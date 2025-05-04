// app/api/auth/initialize-user/route.jsx

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";
import { BlobServiceClient } from "@azure/storage-blob"; // Ajoutez cette importation

const prisma = new PrismaClient();

// Fonction pour créer un container Azure pour l'utilisateur
async function createUserContainer(userName, email) {
	try {
		// Utiliser le nom d'utilisateur ou l'email pour former un nom de base
		const baseUsername = userName || email.split("@")[0];

		// Normaliser le nom pour qu'il soit utilisable comme nom de container
		const normalizedUsername = baseUsername
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		// Ajouter un suffixe unique pour éviter les conflits
		const uniqueSuffix = Math.random().toString(36).substring(2, 8);
		const containerName = `user-${normalizedUsername}-${uniqueSuffix}`;

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Création du container (sans spécifier l'accès pour le rendre privé)
		const containerClient =
			blobServiceClient.getContainerClient(containerName);
		const createContainerResponse = await containerClient.createIfNotExists();

		return {
			success: true,
			containerName,
			created: createContainerResponse.succeeded,
		};
	} catch (error) {
		console.error("Erreur lors de la création du container:", error);
		return { success: false, error: error.message };
	}
}

export async function POST(request) {
	try {
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Le containerName n'est plus requis dans la requête car nous allons le créer
		// Récupérer le body de la requête mais containerName n'est plus nécessaire
		await request.json().catch(() => ({}));

		// Récupérer ou créer l'utilisateur
		let user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		// Créer un container basé sur le nom d'utilisateur si nécessaire
		let containerName = null;
		if (!user || !user.azureContainer) {
			// Créer un nouveau container basé sur le nom d'utilisateur
			const containerResult = await createUserContainer(
				session.user.nickname || session.user.name,
				session.user.email
			);

			if (containerResult.success) {
				containerName = containerResult.containerName;
			} else {
				return NextResponse.json(
					{ error: "Échec de la création du container utilisateur" },
					{ status: 500 }
				);
			}
		}

		if (!user) {
			// Créer un nouvel utilisateur avec les informations de Auth0
			user = await prisma.user.create({
				data: {
					auth0Id: session.user.sub,
					email: session.user.email,
					name: session.user.name || session.user.nickname,
					azureContainer: containerName,
				},
			});
		} else if (!user.azureContainer) {
			// Mettre à jour le containerName si nécessaire
			user = await prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					azureContainer: containerName,
				},
			});
		}

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				auth0Id: user.auth0Id,
				email: user.email,
				name: user.name,
				azureContainer: user.azureContainer,
			},
		});
	} catch (error) {
		console.error(
			"Erreur lors de l'initialisation de l'utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de l'initialisation de l'utilisateur",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}