import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";
import { BlobServiceClient } from "@azure/storage-blob";

const prisma = new PrismaClient();

/**
 * API combinée qui initialise l'utilisateur et retourne son profil complet
 * Remplace à la fois /api/auth/initialize-user et /api/user/profile
 */
export async function GET() {
	try {
		// Vérifier l'authentification
		const session = await auth0.getSession();
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const { sub, email, name } = session.user;

		// Vérifier si l'utilisateur existe déjà
		let user = await prisma.user.findUnique({
			where: {
				auth0Id: sub,
			},
			include: {
				organizations: {
					include: {
						organization: true,
					},
				},
			},
		});

		// Initialiser le client Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Si l'utilisateur n'existe pas, créer un nouvel utilisateur
		if (!user) {
			// Générer un nom de container unique basé sur l'ID Auth0
			const containerName = `user-${
				name ? name.toLowerCase().replace(/[^a-z0-9]/g, "-") : "user"
			}-${sub.slice(-6)}`;
			const containerClient =
				blobServiceClient.getContainerClient(containerName);

			// Créer le container s'il n'existe pas
			await containerClient.createIfNotExists({
				access: "container",
			});

			// Créer l'utilisateur dans la base de données
			user = await prisma.user.create({
				data: {
					auth0Id: sub,
					email,
					name,
					azureContainer: containerName,
				},
				include: {
					organizations: {
						include: {
							organization: true,
						},
					},
				},
			});
		} else {
			// L'utilisateur existe déjà, vérifier que son container Azure existe aussi
			if (user.azureContainer) {
				const containerClient = blobServiceClient.getContainerClient(user.azureContainer);
				
				// Vérifier si le container existe
				const containerExists = await containerClient.exists();
				
				if (!containerExists) {
					console.log(`Container Azure manquant pour l'utilisateur ${user.email}: ${user.azureContainer}`);
					
					// Recréer le container
					await containerClient.createIfNotExists({
						access: "container",
					});
					
					console.log(`Container Azure recréé: ${user.azureContainer}`);
				}
			}
		}

		// Transformer les données pour le client
		const formattedUser = {
			id: user.id,
			auth0Id: user.auth0Id,
			email: user.email,
			name: user.name,
			azureContainer: user.azureContainer,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			organizations: user.organizations.map((membership) => ({
				id: membership.organization.id,
				name: membership.organization.name,
				role: membership.role,
				azureContainer: membership.organization.azureContainer,
			})),
			// Autres données de session utilisateur
			auth0: {
				sub: session.user.sub,
				email: session.user.email,
				name: session.user.name,
				picture: session.user.picture,
			},
		};

		return NextResponse.json({
			success: true,
			user: formattedUser,
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
