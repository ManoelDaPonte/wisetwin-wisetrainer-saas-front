import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import { auth0 } from "@/lib/auth0";
import axios from "axios";

// Utiliser une instance unique de PrismaClient pour éviter de multiples connexions
let prisma;

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient();
} else {
	// En développement, réutiliser la connexion pour éviter trop de connexions pendant HMR
	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}
	prisma = global.prisma;
}

/**
 * API pour supprimer le compte utilisateur
 * Supprime les données de la base de données, le container Azure et le compte Auth0
 *
 * @returns {Response} Réponse HTTP indiquant le succès ou l'échec
 */
export async function DELETE() {
	try {
		// Récupérer la session Auth0
		const session = await auth0.getSession();

		if (!session || !session.user) {
			return new Response(JSON.stringify({ error: "Non authentifié" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Récupérer l'identifiant Auth0 de l'utilisateur
		const auth0Id = session.user.sub;
		const userEmail = session.user.email;

		// Récupérer les données utilisateur depuis Prisma
		const user = await prisma.user.findUnique({
			where: { auth0Id },
			select: {
				id: true,
				azureContainer: true,
			},
		});

		if (!user) {
			return new Response(
				JSON.stringify({
					error: "Utilisateur non trouvé dans la base de données",
				}),
				{ status: 404, headers: { "Content-Type": "application/json" } }
			);
		}

		// Étape 1: Supprimer le container Azure si l'utilisateur en a un
		if (user.azureContainer) {
			await deleteAzureContainer(user.azureContainer);
		}

		// Étape 2: Supprimer l'utilisateur de la base de données
		// (Grâce aux contraintes de cascade, toutes les données associées seront également supprimées)
		await prisma.user.delete({
			where: { id: user.id },
		});

		// Étape 3: Supprimer l'utilisateur d'Auth0
		if (
			process.env.AUTH0_MANAGEMENT_CLIENT_ID &&
			process.env.AUTH0_MANAGEMENT_CLIENT_SECRET
		) {
			await deleteAuth0User(auth0Id);
		} else {
			console.warn(
				"Identifiants de gestion Auth0 non disponibles - l'utilisateur n'a pas été supprimé d'Auth0"
			);
		}

		return new Response(
			JSON.stringify({
				success: true,
				message: "Compte utilisateur supprimé avec succès",
			}),
			{ status: 200, headers: { "Content-Type": "application/json" } }
		);
	} catch (error) {
		console.error("Erreur lors de la suppression du compte:", error);

		return new Response(
			JSON.stringify({
				error: "Une erreur est survenue lors de la suppression du compte",
				details: error.message,
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	} finally {
		await prisma.$disconnect();
	}
}

/**
 * Fonction pour supprimer un container Azure
 * @param {string} containerName - Nom du container à supprimer
 */
async function deleteAzureContainer(containerName) {
	try {
		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Vérifier si le container existe
		const exists = await containerClient.exists();

		if (exists) {
			// Supprimer le container
			await containerClient.delete();
			console.log(`Container ${containerName} supprimé avec succès`);
		} else {
			console.log(
				`Container ${containerName} non trouvé, aucune suppression nécessaire`
			);
		}
	} catch (error) {
		console.error(
			`Erreur lors de la suppression du container ${containerName}:`,
			error
		);
		throw error;
	}
}

/**
 * Fonction pour supprimer un utilisateur Auth0
 * @param {string} userId - ID Auth0 de l'utilisateur à supprimer
 */
async function deleteAuth0User(userId) {
	try {
		// Obtenir un token d'API pour Auth0 Management API
		const tokenResponse = await axios.post(
			`https://${process.env.AUTH0_DOMAIN}/oauth/token`,
			{
				client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
				client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
				audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
				grant_type: "client_credentials",
			},
			{
				headers: {
					"Content-Type": "application/json",
				},
			}
		);

		const accessToken = tokenResponse.data.access_token;

		// Supprimer l'utilisateur
		await axios.delete(
			`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		console.log(`Utilisateur Auth0 ${userId} supprimé avec succès`);
	} catch (error) {
		console.error(
			`Erreur lors de la suppression de l'utilisateur Auth0 ${userId}:`,
			error
		);
		throw error;
	}
}
