// app/api/organization/[organizationId]/container/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";
import { BlobServiceClient } from "@azure/storage-blob";

const prisma = new PrismaClient();

// POST - Créer un container Azure pour l'organisation
export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;

		// Vérifier l'authentification
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur
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

		// Vérifier que l'utilisateur est admin ou propriétaire de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: user.id,
				role: {
					in: ["OWNER", "ADMIN"],
				},
			},
		});

		if (!membership) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
				},
				{ status: 403 }
			);
		}

		// Récupérer l'organisation
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Si l'organisation a déjà un container, vérifier s'il existe
		if (organization.azureContainer) {
			// Connexion au service Azure Blob Storage
			const blobServiceClient = BlobServiceClient.fromConnectionString(
				process.env.AZURE_STORAGE_CONNECTION_STRING
			);

			// Récupération du client du container
			const containerClient = blobServiceClient.getContainerClient(
				organization.azureContainer
			);

			// Vérifier si le container existe
			const exists = await containerClient.exists();

			if (exists) {
				return NextResponse.json({
					success: true,
					message:
						"Le container Azure existe déjà pour cette organisation",
					containerName: organization.azureContainer,
				});
			}
		}

		// Générer un nom de container unique basé sur l'ID de l'organisation
		const containerName = `org-${organizationId.substring(0, 8)}`;

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Créer le container
		await containerClient.createIfNotExists({
			access: "blob", // Accès en lecture publique pour les blobs
		});

		// Mettre à jour l'organisation avec le nom du container
		const updatedOrganization = await prisma.organization.update({
			where: { id: organizationId },
			data: { azureContainer: containerName },
		});

		return NextResponse.json({
			success: true,
			message: "Container Azure créé avec succès pour l'organisation",
			containerName,
		});
	} catch (error) {
		console.error("Erreur lors de la création du container Azure:", error);
		return NextResponse.json(
			{
				error: "Échec de la création du container Azure",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// GET - Vérifier l'existence du container Azure
export async function GET(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;

		// Vérifier l'authentification
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur
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

		// Vérifier que l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: user.id,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer l'organisation
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Si l'organisation n'a pas de container, retourner cette information
		if (!organization.azureContainer) {
			return NextResponse.json({
				exists: false,
				message:
					"Aucun container Azure n'est associé à cette organisation",
			});
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient = blobServiceClient.getContainerClient(
			organization.azureContainer
		);

		// Vérifier si le container existe
		const exists = await containerClient.exists();

		return NextResponse.json({
			exists,
			containerName: organization.azureContainer,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la vérification du container Azure:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la vérification du container Azure",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
