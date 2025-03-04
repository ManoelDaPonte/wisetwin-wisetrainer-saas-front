import { NextResponse } from "next/server";
import { ManagementClient } from "auth0";
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";

const prisma = new PrismaClient();
const management = new ManagementClient({
	domain: process.env.AUTH0_DOMAIN,
	clientId: process.env.AUTH0_MGMT_CLIENT_ID,
	clientSecret: process.env.AUTH0_MGMT_CLIENT_SECRET,
});

export async function DELETE(request) {
	try {
		const { userId, azureContainer } = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ error: "L'identifiant utilisateur est requis" },
				{ status: 400 }
			);
		}

		// Vérifiez que l'ID utilisateur est au bon format (auth0|xxxx)
		if (!userId.startsWith("auth0|")) {
			return NextResponse.json(
				{ error: "Format d'identifiant utilisateur invalide" },
				{ status: 400 }
			);
		}

		// Extrait l'ID utilisateur réel (sans le préfixe "auth0|")
		const auth0UserId = userId.split("|")[1];

		// 1. Supprimer les données de la base de données
		const dbCleanupResults = await cleanupDatabase(userId);

		// 2. Supprimer le container Azure si fourni
		let azureCleanupResults = {
			success: true,
			message: "Aucun container Azure à nettoyer",
		};
		if (azureContainer) {
			azureCleanupResults = await cleanupAzureContainer(azureContainer);
		}

		// 3. Supprimer l'utilisateur dans Auth0
		await management.users.delete({ id: `auth0|${auth0UserId}` });

		return NextResponse.json({
			success: true,
			message: "Compte utilisateur supprimé avec succès",
			dbCleanup: dbCleanupResults,
			azureCleanup: azureCleanupResults,
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du compte:", error);
		return NextResponse.json(
			{
				error: "Échec de la suppression du compte",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Fonction utilitaire pour nettoyer la base de données
async function cleanupDatabase(userId) {
	try {
		// Récupérer l'utilisateur basé sur son ID Auth0
		const user = await prisma.user.findFirst({
			where: {
				auth0Id: userId,
			},
		});

		if (!user) {
			return {
				success: false,
				message: "Utilisateur non trouvé dans la base de données",
			};
		}

		// Supprimer toutes les données liées à l'utilisateur
		// Note: Ces opérations dépendent de votre schéma de base de données

		// 1. Supprimer les réponses aux questionnaires
		await prisma.userResponse.deleteMany({
			where: {
				userId: user.id,
			},
		});

		// 2. Supprimer les réalisations débloquées
		await prisma.userAchievement.deleteMany({
			where: {
				userId: user.id,
			},
		});

		// 3. Supprimer les statistiques utilisateur
		if (user.userStats) {
			await prisma.userStats.delete({
				where: {
					userId: user.id,
				},
			});
		}

		// 4. Supprimer les sessions utilisateur
		await prisma.userSession.deleteMany({
			where: {
				userId: user.id,
			},
		});

		// 5. Supprimer les modules complétés par l'utilisateur
		await prisma.userModule.deleteMany({
			where: {
				userCourse: {
					userId: user.id,
				},
			},
		});

		// 6. Supprimer les cours suivis par l'utilisateur
		await prisma.userCourse.deleteMany({
			where: {
				userId: user.id,
			},
		});

		// 7. Enfin, supprimer l'utilisateur lui-même
		await prisma.user.delete({
			where: {
				id: user.id,
			},
		});

		return {
			success: true,
			message:
				"Toutes les données utilisateur ont été supprimées de la base de données",
		};
	} catch (error) {
		console.error("Erreur lors du nettoyage de la base de données:", error);
		return {
			success: false,
			message: `Erreur lors du nettoyage de la base de données: ${error.message}`,
			error: error,
		};
	}
}

// Fonction utilitaire pour supprimer le container Azure
async function cleanupAzureContainer(containerName) {
	try {
		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Vérifier que le container existe
		const exists = await containerClient.exists();
		if (!exists) {
			return {
				success: false,
				message: `Le container ${containerName} n'existe pas`,
			};
		}

		// Supprimer tous les blobs dans le container
		let blobsDeleted = 0;
		for await (const blob of containerClient.listBlobsFlat()) {
			await containerClient.deleteBlob(blob.name);
			blobsDeleted++;
		}

		// Supprimer le container lui-même
		await containerClient.delete();

		return {
			success: true,
			message: `Container ${containerName} et ${blobsDeleted} blobs supprimés avec succès`,
		};
	} catch (error) {
		console.error(
			"Erreur lors de la suppression du container Azure:",
			error
		);
		return {
			success: false,
			message: `Erreur lors de la suppression du container Azure: ${error.message}`,
			error: error,
		};
	}
}
