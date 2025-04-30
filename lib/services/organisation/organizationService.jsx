// lib/services/organizationService.js
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";

const prisma = new PrismaClient();

/**
 * Crée un container Azure pour une organisation
 */
export async function createOrganizationContainer(orgName) {
	try {
		// Normaliser le nom pour qu'il soit utilisable comme nom de container
		const normalizedName = orgName
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "-")
			.replace(/-+/g, "-")
			.replace(/^-|-$/g, "");

		// Ajouter un suffixe unique pour éviter les conflits
		const uniqueSuffix = Math.random().toString(36).substring(2, 8);
		const containerName = `org-${normalizedName}-${uniqueSuffix}`;

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Création du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);
		const createContainerResponse = await containerClient.createIfNotExists(
			{
				access: "blob", // Accès en lecture publique pour les blobs
			}
		);

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

/**
 * Crée une nouvelle organisation
 */
export async function createOrganization(organizationData, userId) {
	const { name, description, logoUrl } = organizationData;

	// Créer le container Azure
	const containerResult = await createOrganizationContainer(name);

	if (!containerResult.success) {
		throw new Error("Échec de la création du container Azure");
	}

	// Transaction pour créer l'organisation et y ajouter l'utilisateur comme propriétaire
	return prisma.$transaction(async (prisma) => {
		// Créer l'organisation
		const organization = await prisma.organization.create({
			data: {
				name,
				description,
				logoUrl,
				azureContainer: containerResult.containerName,
			},
		});

		// Ajouter l'utilisateur comme propriétaire
		await prisma.organizationMember.create({
			data: {
				organizationId: organization.id,
				userId: userId,
				role: "OWNER",
			},
		});

		return organization;
	});
}

/**
 * Récupère toutes les organisations d'un utilisateur
 */
export async function getUserOrganizations(userId) {
	const memberships = await prisma.organizationMember.findMany({
		where: {
			userId: userId,
		},
		include: {
			organization: true,
		},
	});

	// Enrichir avec des informations supplémentaires
	return Promise.all(
		memberships.map(async (membership) => {
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
}

// Autres fonctions relatives aux organisations...
