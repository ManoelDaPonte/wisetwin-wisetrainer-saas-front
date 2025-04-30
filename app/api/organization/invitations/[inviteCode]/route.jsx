// app/api/invitations/[inviteCode]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// GET pour récupérer les détails d'une invitation
export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const { inviteCode } = resolvedParams;

		// Récupérer l'invitation
		const invitation = await prisma.organizationInvitation.findUnique({
			where: { inviteCode },
			include: { organization: true },
		});

		if (!invitation) {
			return NextResponse.json(
				{ error: "Invitation non trouvée ou déjà utilisée" },
				{ status: 404 }
			);
		}

		// Vérifier si l'invitation est expirée
		if (
			new Date() > invitation.expiresAt &&
			invitation.status === "PENDING"
		) {
			await prisma.organizationInvitation.update({
				where: { id: invitation.id },
				data: { status: "EXPIRED" },
			});

			return NextResponse.json(
				{ error: "Cette invitation a expiré" },
				{ status: 400 }
			);
		}

		// Retourner les informations sur l'invitation pour affichage
		return NextResponse.json({
			invitation: {
				id: invitation.id,
				email: invitation.email,
				organization: {
					id: invitation.organization.id,
					name: invitation.organization.name,
					description: invitation.organization.description,
					logoUrl: invitation.organization.logoUrl,
				},
				role: invitation.role,
				status: invitation.status,
				expiresAt: invitation.expiresAt,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la récupération de l'invitation:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération de l'invitation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST pour accepter une invitation
export async function POST(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { inviteCode } = resolvedParams;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Veuillez vous connecter pour accepter l'invitation" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur actuel
		const currentUser = await prisma.user.findUnique({
			where: { auth0Id: session.user.sub },
		});

		if (!currentUser) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer l'invitation
		const invitation = await prisma.organizationInvitation.findUnique({
			where: { inviteCode },
		});

		if (!invitation) {
			return NextResponse.json(
				{ error: "Invitation non trouvée ou déjà utilisée" },
				{ status: 404 }
			);
		}

		if (invitation.status !== "PENDING") {
			return NextResponse.json(
				{ error: "Cette invitation a déjà été traitée" },
				{ status: 400 }
			);
		}

		if (new Date() > invitation.expiresAt) {
			await prisma.organizationInvitation.update({
				where: { id: invitation.id },
				data: { status: "EXPIRED" },
			});

			return NextResponse.json(
				{ error: "Cette invitation a expiré" },
				{ status: 400 }
			);
		}

		// Vérifier que l'email de l'invitation correspond à celui de l'utilisateur
		if (
			invitation.email.toLowerCase() !== currentUser.email.toLowerCase()
		) {
			return NextResponse.json(
				{
					error: "Cette invitation est destinée à une autre adresse email",
				},
				{ status: 403 }
			);
		}

		// Vérifier si l'utilisateur est déjà membre de l'organisation
		const existingMembership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: invitation.organizationId,
				userId: currentUser.id,
			},
		});

		if (existingMembership) {
			// Mettre à jour l'invitation
			await prisma.organizationInvitation.update({
				where: { id: invitation.id },
				data: { status: "ACCEPTED" },
			});

			return NextResponse.json(
				{ error: "Vous êtes déjà membre de cette organisation" },
				{ status: 400 }
			);
		}

		// Ajouter l'utilisateur à l'organisation
		const membership = await prisma.organizationMember.create({
			data: {
				organizationId: invitation.organizationId,
				userId: currentUser.id,
				role: invitation.role,
			},
		});

		// Mettre à jour l'invitation
		await prisma.organizationInvitation.update({
			where: { id: invitation.id },
			data: { status: "ACCEPTED" },
		});

		return NextResponse.json({
			success: true,
			message: "Vous avez rejoint l'organisation avec succès",
			membership: {
				id: membership.id,
				role: membership.role,
				joinedAt: membership.joinedAt,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'acceptation de l'invitation:", error);
		return NextResponse.json(
			{
				error: "Échec de l'acceptation de l'invitation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
