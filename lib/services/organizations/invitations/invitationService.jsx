// lib/services/organizations/invitations/invitationService.jsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Service pour gérer toutes les opérations liées aux invitations
 */
class InvitationService {
	/**
	 * Récupère les détails d'une invitation
	 * @param {string} inviteCode - Code d'invitation unique
	 * @returns {Promise<Object>} Détails de l'invitation
	 */
	async getInvitationDetails(inviteCode) {
		try {
			// Récupérer l'invitation
			const invitation = await prisma.organizationInvitation.findUnique({
				where: { inviteCode },
				include: { organization: true },
			});

			if (!invitation) {
				return {
					success: false,
					error: "Invitation non trouvée ou déjà utilisée",
					statusCode: 404,
				};
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

				return {
					success: false,
					error: "Cette invitation a expiré",
					statusCode: 400,
				};
			}

			// Retourner les informations sur l'invitation pour affichage
			return {
				success: true,
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
			};
		} catch (error) {
			console.error(
				"Erreur lors de la récupération de l'invitation:",
				error
			);
			return {
				success: false,
				error: "Échec de la récupération de l'invitation",
				details: error.message,
				statusCode: 500,
			};
		}
	}

	/**
	 * Accepte une invitation
	 * @param {string} inviteCode - Code d'invitation unique
	 * @param {Object} currentUser - Utilisateur actuel
	 * @returns {Promise<Object>} Résultat de l'opération
	 */
	async acceptInvitation(inviteCode, currentUser) {
		try {
			if (!currentUser) {
				return {
					success: false,
					error: "Utilisateur non trouvé",
					statusCode: 404,
				};
			}

			// Récupérer l'invitation
			const invitation = await prisma.organizationInvitation.findUnique({
				where: { inviteCode },
			});

			if (!invitation) {
				return {
					success: false,
					error: "Invitation non trouvée ou déjà utilisée",
					statusCode: 404,
				};
			}

			if (invitation.status !== "PENDING") {
				return {
					success: false,
					error: "Cette invitation a déjà été traitée",
					statusCode: 400,
				};
			}

			if (new Date() > invitation.expiresAt) {
				await prisma.organizationInvitation.update({
					where: { id: invitation.id },
					data: { status: "EXPIRED" },
				});

				return {
					success: false,
					error: "Cette invitation a expiré",
					statusCode: 400,
				};
			}

			// Vérifier que l'email de l'invitation correspond à celui de l'utilisateur
			if (
				invitation.email.toLowerCase() !==
				currentUser.email.toLowerCase()
			) {
				return {
					success: false,
					error: "Cette invitation est destinée à une autre adresse email",
					statusCode: 403,
				};
			}

			// Vérifier si l'utilisateur est déjà membre de l'organisation
			const existingMembership =
				await prisma.organizationMember.findFirst({
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

				return {
					success: false,
					error: "Vous êtes déjà membre de cette organisation",
					statusCode: 400,
				};
			}

			// Transaction pour garantir l'atomicité des opérations
			const result = await prisma.$transaction(async (prisma) => {
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

				return {
					membership,
					organizationId: invitation.organizationId,
				};
			});

			return {
				success: true,
				message: "Vous avez rejoint l'organisation avec succès",
				membership: {
					id: result.membership.id,
					role: result.membership.role,
					joinedAt: result.membership.joinedAt,
				},
				organizationId: result.organizationId,
			};
		} catch (error) {
			console.error(
				"Erreur lors de l'acceptation de l'invitation:",
				error
			);
			return {
				success: false,
				error: "Échec de l'acceptation de l'invitation",
				details: error.message,
				statusCode: 500,
			};
		}
	}
}

// Exporter une instance unique du service
export const invitationService = new InvitationService();
