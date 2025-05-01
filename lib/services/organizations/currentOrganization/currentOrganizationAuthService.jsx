// lib/services/organizations/organization/authService.jsx
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

/**
 * Service pour gérer l'authentification et les permissions liées aux organisations
 */
class CurrentOrganizationAuthService {
	/**
	 * Vérifie si un utilisateur est authentifié et renvoie ses informations
	 * @param {Object} session - Session Auth0
	 * @returns {Promise<Object>} Informations de l'utilisateur
	 * @throws {Error} Si l'utilisateur n'est pas authentifié ou n'existe pas
	 */
	async getAuthenticatedUser(session) {
		if (!session || !session.user) {
			throw new Error("Non autorisé");
		}

		const user = await findUserByAuth0Id(session.user.sub);

		if (!user) {
			throw new Error("Utilisateur non trouvé");
		}

		return user;
	}

	/**
	 * Vérifie si un utilisateur est membre d'une organisation
	 * @param {string} organizationId - ID de l'organisation
	 * @param {string} userId - ID de l'utilisateur
	 * @returns {Promise<Object>} Informations sur l'adhésion
	 * @throws {Error} Si l'utilisateur n'est pas membre de l'organisation
	 */
	async checkOrganizationMembership(organizationId, userId) {
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: userId,
			},
		});

		if (!membership) {
			throw new Error("Vous n'êtes pas membre de cette organisation");
		}

		return membership;
	}

	/**
	 * Vérifie si un utilisateur a un rôle spécifique dans une organisation
	 * @param {string} organizationId - ID de l'organisation
	 * @param {string} userId - ID de l'utilisateur
	 * @param {Array<string>} allowedRoles - Rôles autorisés (ex: ["OWNER", "ADMIN"])
	 * @returns {Promise<Object>} Informations sur l'adhésion
	 * @throws {Error} Si l'utilisateur n'a pas le rôle requis
	 */
	async checkOrganizationRole(organizationId, userId, allowedRoles) {
		const membership = await this.checkOrganizationMembership(
			organizationId,
			userId
		);

		if (!allowedRoles.includes(membership.role)) {
			throw new Error(
				"Vous n'avez pas les droits nécessaires pour effectuer cette action"
			);
		}

		return membership;
	}

	/**
	 * Authentifie un utilisateur et vérifie son appartenance à une organisation
	 * @param {Object} session - Session Auth0
	 * @param {string} organizationId - ID de l'organisation
	 * @returns {Promise<Object>} Informations sur l'utilisateur et son adhésion
	 */
	async authenticateForOrganization(session, organizationId) {
		const user = await this.getAuthenticatedUser(session);
		const membership = await this.checkOrganizationMembership(
			organizationId,
			user.id
		);

		return {
			user,
			membership,
		};
	}

	/**
	 * Authentifie un utilisateur et vérifie son rôle dans une organisation
	 * @param {Object} session - Session Auth0
	 * @param {string} organizationId - ID de l'organisation
	 * @param {Array<string>} allowedRoles - Rôles autorisés
	 * @returns {Promise<Object>} Informations sur l'utilisateur et son adhésion
	 */
	async authenticateWithRole(session, organizationId, allowedRoles) {
		const user = await this.getAuthenticatedUser(session);
		const membership = await this.checkOrganizationRole(
			organizationId,
			user.id,
			allowedRoles
		);

		return {
			user,
			membership,
		};
	}
}

// Export d'une instance unique du service
export const currentOrganizationAuthService =
	new CurrentOrganizationAuthService();
