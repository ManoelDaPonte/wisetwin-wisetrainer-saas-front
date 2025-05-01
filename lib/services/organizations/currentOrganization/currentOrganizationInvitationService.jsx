// lib/services/invitationService.js
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { sendInvitationEmail } from "@/lib/services/organizations/currentOrganization/currentOrganizationInvitationMailService";

const prisma = new PrismaClient();

/**
 * Crée une invitation pour rejoindre une organisation
 */
export async function createInvitation(
	organizationId,
	invitedBy,
	invitationData
) {
	const { email, role = "MEMBER" } = invitationData;

	// Vérifier si l'utilisateur a déjà été invité
	const existingInvitation = await prisma.organizationInvitation.findFirst({
		where: {
			email,
			organizationId,
		},
	});

	// Configurer la date d'expiration (7 jours)
	const expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + 7);

	// Générer un code d'invitation unique
	const inviteCode = uuidv4();

	// Si une invitation existe déjà
	if (existingInvitation) {
		// Si elle est encore en attente, renvoyer un message
		if (existingInvitation.status === "PENDING") {
			return {
				success: false,
				message: "Une invitation est déjà en attente pour cet email",
				invitation: existingInvitation,
			};
		}

		// Sinon, mettre à jour l'invitation existante
		const updatedInvitation = await prisma.organizationInvitation.update({
			where: { id: existingInvitation.id },
			data: {
				status: "PENDING",
				invitedBy,
				expiresAt: expirationDate,
			},
		});

		return {
			success: true,
			message: "Invitation mise à jour et renvoyée",
			invitation: updatedInvitation,
		};
	}

	// Créer une nouvelle invitation
	const invitation = await prisma.organizationInvitation.create({
		data: {
			email,
			organizationId,
			inviteCode,
			role,
			invitedBy,
			expiresAt: expirationDate,
		},
	});

	return {
		success: true,
		message: "Invitation créée avec succès",
		invitation,
	};
}

/**
 * Récupère toutes les invitations d'une organisation
 */
export async function getOrganizationInvitations(organizationId) {
	return prisma.organizationInvitation.findMany({
		where: {
			organizationId,
		},
		orderBy: [
			{ status: "asc" }, // PENDING en premier
			{ invitedAt: "desc" }, // Plus récentes en premier
		],
	});
}

/**
 * Annule une invitation
 */
export async function cancelInvitation(invitationId) {
	return prisma.organizationInvitation.delete({
		where: {
			id: invitationId,
		},
	});
}

/**
 * Renvoie une invitation
 */
export async function resendInvitation(invitationId, organizationName) {
	// Mettre à jour la date d'expiration
	const expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + 7);

	const invitation = await prisma.organizationInvitation.update({
		where: {
			id: invitationId,
		},
		data: {
			expiresAt: expirationDate,
		},
	});

	// Renvoyer l'email
	await sendInvitationEmail(
		invitation.email,
		organizationName,
		invitation.inviteCode
	);

	return invitation;
}

/**
 * Accepte une invitation
 */
export async function acceptInvitation(inviteCode, userId) {
	// Trouver l'invitation
	const invitation = await prisma.organizationInvitation.findUnique({
		where: {
			inviteCode,
		},
		include: {
			organization: true,
		},
	});

	if (!invitation) {
		throw new Error("Invitation non trouvée");
	}

	if (invitation.status !== "PENDING") {
		throw new Error(
			`Cette invitation a déjà été ${
				invitation.status === "ACCEPTED" ? "acceptée" : "refusée"
			}`
		);
	}

	if (new Date() > new Date(invitation.expiresAt)) {
		throw new Error("Cette invitation a expiré");
	}

	// Transaction pour mettre à jour l'invitation et ajouter l'utilisateur à l'organisation
	return prisma.$transaction(async (prisma) => {
		// Mettre à jour le statut de l'invitation
		await prisma.organizationInvitation.update({
			where: { id: invitation.id },
			data: { status: "ACCEPTED" },
		});

		// Vérifier si l'utilisateur est déjà membre
		const existingMembership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: invitation.organizationId,
				userId,
			},
		});

		if (existingMembership) {
			throw new Error("Vous êtes déjà membre de cette organisation");
		}

		// Ajouter l'utilisateur comme membre
		await prisma.organizationMember.create({
			data: {
				organizationId: invitation.organizationId,
				userId,
				role: invitation.role,
			},
		});

		return {
			success: true,
			organization: invitation.organization,
		};
	});
}
