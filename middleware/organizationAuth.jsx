// middleware/organizationAuth.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

/**
 * Middleware pour vérifier l'autorisation aux ressources d'une organisation
 * @param {Object} options - Options de configuration
 * @param {String} options.requiredRole - Rôle minimum requis (MEMBER, ADMIN, OWNER)
 * @returns {Function} Middleware function
 */
export function checkOrganizationAccess(options = { requiredRole: "MEMBER" }) {
	return async (req, params) => {
		try {
			const session = await auth0.getSession();
			// S'assurer que params est résolu s'il s'agit d'une Promise
			const resolvedParams =
				params && typeof params.then === "function"
					? await params
					: params;
			const organizationId = resolvedParams.organizationId;

			// Vérifier si l'utilisateur est authentifié
			if (!session || !session.user) {
				return {
					authorized: false,
					status: 401,
					message: "Non authentifié",
				};
			}

			// Récupérer l'utilisateur depuis la base de données
			const user = await prisma.user.findUnique({
				where: {
					auth0Id: session.user.sub,
				},
			});

			if (!user) {
				return {
					authorized: false,
					status: 404,
					message: "Utilisateur non trouvé",
				};
			}

			// Vérifier si l'utilisateur est membre de l'organisation
			const membership = await prisma.organizationMember.findFirst({
				where: {
					organizationId: organizationId,
					userId: user.id,
				},
			});

			if (!membership) {
				return {
					authorized: false,
					status: 403,
					message: "Vous n'êtes pas membre de cette organisation",
				};
			}

			// Vérifier le rôle requis
			if (options.requiredRole) {
				const roles = ["MEMBER", "ADMIN", "OWNER"];
				const userRoleIndex = roles.indexOf(membership.role);
				const requiredRoleIndex = roles.indexOf(options.requiredRole);

				if (userRoleIndex < requiredRoleIndex) {
					return {
						authorized: false,
						status: 403,
						message: `Rôle insuffisant, ${options.requiredRole} requis`,
					};
				}
			}

			// Vérifier si l'organisation existe et est active
			const organization = await prisma.organization.findUnique({
				where: {
					id: organizationId,
				},
			});

			if (!organization) {
				return {
					authorized: false,
					status: 404,
					message: "Organisation non trouvée",
				};
			}

			if (!organization.isActive) {
				return {
					authorized: false,
					status: 403,
					message: "Cette organisation n'est pas active",
				};
			}

			// L'accès est autorisé
			return {
				authorized: true,
				user,
				membership,
				organization,
			};
		} catch (error) {
			console.error("Erreur dans le middleware d'organisation:", error);
			return {
				authorized: false,
				status: 500,
				message: "Erreur interne du serveur",
			};
		}
	};
}

/**
 * Helper pour appliquer le middleware dans une route API
 * @param {Request} request - Requête HTTP
 * @param {Object} params - Paramètres de route
 * @param {Function} middleware - Fonction middleware à appliquer
 * @param {Function} handler - Gestionnaire à exécuter si autorisé
 */
export async function withOrganizationAuth(
	request,
	params,
	middlewareFn,
	handler
) {
	// Exécuter la fonction middleware pour obtenir le middleware réel
	const middleware = middlewareFn();

	// Puis exécuter ce middleware avec la requête et les paramètres
	const authResult = await middleware(request, params);

	if (!authResult.authorized) {
		return NextResponse.json(
			{ error: authResult.message },
			{ status: authResult.status }
		);
	}

	return handler(request, params, authResult);
}
