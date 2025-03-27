// app/api/organization/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// Fonction pour créer un container Azure
async function createAzureContainer(containerName) {
	try {
		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Créer le container s'il n'existe pas
		const createContainerResponse = await containerClient.createIfNotExists(
			{
				access: "blob", // Accès en lecture publique pour les blobs
			}
		);

		return {
			success: true,
			created: createContainerResponse.succeeded,
			containerName,
		};
	} catch (error) {
		console.error("Erreur lors de la création du container:", error);
		throw error;
	}
}

// GET pour récupérer toutes les organisations d'un utilisateur
export async function GET(request) {
	try {
		const session = await getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer les organisations dont l'utilisateur est membre
		const membershipData = await prisma.organizationMember.findMany({
			where: {
				userId: user.id,
			},
			include: {
				organization: true,
			},
		});

		// Formater les résultats pour l'affichage
		const organizations = await Promise.all(
			membershipData.map(async (membership) => {
				// Compter le nombre de membres pour chaque organisation
				const membersCount = await prisma.organizationMember.count({
					where: {
						organizationId: membership.organization.id,
					},
				});

				return {
					id: membership.organization.id,
					name: membership.organization.name,
					description: membership.organization.description,
					logoUrl: membership.organization.logoUrl,
					createdAt: membership.organization.createdAt,
					userRole: membership.role,
					joinedAt: membership.joinedAt,
					membersCount,
				};
			})
		);

		return NextResponse.json({ organizations });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des organisations:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des organisations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST pour créer une nouvelle organisation
export async function POST(request) {
	try {
		const session = await getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer les données de la requête
		const { name, description, logoUrl } = await request.json();

		if (!name) {
			return NextResponse.json(
				{ error: "Le nom de l'organisation est requis" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Générer un nom de container unique pour l'organisation
		// Utiliser un préfixe 'org-' suivi d'un timestamp et d'un ID aléatoire
		const timestamp = Date.now();
		const randomId = Math.random().toString(36).substring(2, 10);
		const containerName = `org-${timestamp}-${randomId}`;

		// Créer le container Azure
		const containerResult = await createAzureContainer(containerName);

		if (!containerResult.success) {
			return NextResponse.json(
				{ error: "Échec de la création du container Azure" },
				{ status: 500 }
			);
		}

		// Créer l'organisation avec le nom du container Azure
		const organization = await prisma.organization.create({
			data: {
				name,
				description,
				logoUrl,
				azureContainer: containerName,
			},
		});

		// Ajouter l'utilisateur comme propriétaire de l'organisation
		await prisma.organizationMember.create({
			data: {
				organizationId: organization.id,
				userId: user.id,
				role: "OWNER", // Le créateur est toujours propriétaire
			},
		});

		return NextResponse.json({
			success: true,
			organization: {
				...organization,
				azureContainer: containerName,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'organisation:", error);
		return NextResponse.json(
			{
				error: "Échec de la création de l'organisation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
