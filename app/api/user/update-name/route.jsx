import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";
const prisma = new PrismaClient();

/**
 * API pour mettre à jour le nom de l'utilisateur dans la base de données
 * Cette API vérifie l'authentification via Auth0 et met à jour le nom de l'utilisateur dans Prisma
 *
 * @param {Object} request - Requête HTTP
 * @returns {Response} Réponse HTTP avec le statut et un message
 */
export async function POST(request) {
	try {
		// Récupérer la session Auth0 pour vérifier l'authentification
		const session = await auth0.getSession();

		if (!session || !session.user) {
			return new Response(JSON.stringify({ error: "Non authentifié" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Récupérer l'identifiant Auth0 de l'utilisateur
		const auth0Id = session.user.sub;

		// Récupérer les données du corps de la requête
		const { name } = await request.json();

		// Valider les données
		if (!name || typeof name !== "string" || name.trim() === "") {
			return new Response(
				JSON.stringify({ error: "Le nom ne peut pas être vide" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Trouver l'utilisateur dans la base de données Prisma
		const user = await prisma.user.findUnique({
			where: { auth0Id },
		});

		if (!user) {
			return new Response(
				JSON.stringify({ error: "Utilisateur non trouvé" }),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		// Mettre à jour le nom de l'utilisateur
		const updatedUser = await prisma.user.update({
			where: { id: user.id },
			data: { name: name.trim() },
		});

		return new Response(
			JSON.stringify({
				success: true,
				user: {
					id: updatedUser.id,
					name: updatedUser.name,
					email: updatedUser.email,
				},
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("Erreur lors de la mise à jour du nom:", error);

		return new Response(
			JSON.stringify({
				error: "Une erreur est survenue lors de la mise à jour du nom",
				details: error.message,
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	} finally {
		// S'assurer de déconnecter Prisma pour éviter les fuites de connexion
		await prisma.$disconnect();
	}
}
