// lib/services/organization/organizationService.jsx
import { v4 as uuidv4 } from "uuid";
import { BlobServiceClient } from "@azure/storage-blob";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Récupère toutes les organisations dont l'utilisateur est membre
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} Liste des organisations
 */
export async function getUserOrganizations(userId) {
	try {
		// Récupérer toutes les organisations dont l'utilisateur est membre
		const memberships = await prisma.organizationMember.findMany({
			where: {
				userId: userId,
			},
			include: {
				organization: true,
			},
			orderBy: {
				organization: {
					name: "asc",
				},
			},
		});

		// Formater les données pour le front-end
		const organizations = await Promise.all(
			memberships.map(async (membership) => {
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
					isActive: membership.organization.isActive,
					userRole: membership.role,
					membersCount,
					createdAt: membership.organization.createdAt,
				};
			})
		);

		return organizations;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des organisations:",
			error
		);
		throw error;
	}
}

/**
 * Crée un conteneur privé Azure pour une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat de la création du conteneur
 */
export async function createOrganizationContainer(organizationId) {
	try {
		// Vérifier que la chaîne de connexion est définie
		if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
			throw new Error(
				"Variable d'environnement AZURE_STORAGE_CONNECTION_STRING non configurée"
			);
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Créer un nom de conteneur conforme aux règles Azure:
		// - Uniquement des lettres minuscules, chiffres et tirets
		// - Entre 3 et 63 caractères
		// - Pas de tirets consécutifs
		// - Pas de tiret au début ou à la fin
		const sanitizedId = organizationId
			.replace(/-/g, "")
			.toLowerCase()
			.substring(0, 16);
		const containerName = `org${sanitizedId}`;

		// Récupérer le client du conteneur
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Vérifier si le conteneur existe déjà
		const containerExists = await containerClient.exists();
		if (containerExists) {
			return {
				success: true,
				containerName,
				message: "Le conteneur existe déjà",
				isExisting: true,
			};
		}

		await containerClient.create();

		console.log(
			`Conteneur Azure "${containerName}" créé avec succès (accès privé)`
		);

		return {
			success: true,
			containerName,
			message: "Conteneur créé avec succès (accès privé)",
			isNew: true,
		};
	} catch (error) {
		console.error("Erreur lors de la création du conteneur Azure:", error);

		// Erreur spécifique pour aider au diagnostic
		let errorMessage = "Erreur lors de la création du conteneur Azure";

		if (error.code === "PublicAccessNotPermitted") {
			errorMessage =
				"L'accès public n'est pas autorisé sur ce compte de stockage";
		} else if (error.code === "AuthenticationFailed") {
			errorMessage =
				"Échec d'authentification avec Azure Storage. Vérifiez la chaîne de connexion";
		} else if (error.statusCode) {
			errorMessage = `Erreur Azure (${error.statusCode}): ${error.message}`;
		}

		return {
			success: false,
			message: errorMessage,
			error,
			details: error.details || {},
		};
	}
}

/**
 * Crée une organisation avec son conteneur Azure privé
 * @param {Object} organizationData - Données de l'organisation
 * @param {string} userId - ID de l'utilisateur créateur
 * @returns {Promise<Object>} Organisation créée
 */
export async function createOrganization(organizationData, userId) {
	// Génération d'un ID d'organisation unique
	const organizationId = uuidv4();

	try {
		// Créer un conteneur Azure privé pour l'organisation
		const containerResult = await createOrganizationContainer(
			organizationId
		);

		if (!containerResult.success) {
			throw new Error(
				`Échec de la création du conteneur Azure: ${containerResult.message}`
			);
		}

		// Si le conteneur a bien été créé, enregistrer l'organisation en base de données
		const organization = await prisma.$transaction(async (prisma) => {
			// Créer l'organisation
			const newOrganization = await prisma.organization.create({
				data: {
					id: organizationId,
					name: organizationData.name,
					description: organizationData.description || null,
					logoUrl: organizationData.logoUrl || null,
					azureContainer: containerResult.containerName,
					isActive: true,
					// Ajouter l'utilisateur comme propriétaire
					members: {
						create: {
							userId: userId,
							role: "OWNER",
						},
					},
				},
				include: {
					members: {
						include: {
							user: {
								select: {
									name: true,
									email: true,
								},
							},
						},
					},
				},
			});

			return newOrganization;
		});

		return organization;
	} catch (error) {
		console.error("Erreur lors de la création de l'organisation:", error);

		// Si l'erreur survient après la création du conteneur Azure,
		// on devrait idéalement supprimer ce conteneur pour éviter les ressources orphelines
		if (
			error.message.includes(
				"Échec de la création du conteneur Azure"
			) === false
		) {
			try {
				await deleteOrganizationContainer(organizationId);
			} catch (cleanupError) {
				console.error(
					"Erreur lors du nettoyage du conteneur Azure:",
					cleanupError
				);
			}
		}

		throw error;
	}
}

/**
 * Supprime un conteneur Azure associé à une organisation
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Object>} Résultat de la suppression
 */
export async function deleteOrganizationContainer(organizationId) {
	try {
		// Récupérer d'abord l'organisation pour obtenir le nom du conteneur
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
			select: { azureContainer: true },
		});

		if (!organization || !organization.azureContainer) {
			return {
				success: false,
				message: "Conteneur non trouvé pour cette organisation",
			};
		}

		const containerName = organization.azureContainer;

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupérer le client du conteneur
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Vérifier si le conteneur existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			return {
				success: true,
				message: "Le conteneur n'existe pas ou a déjà été supprimé",
			};
		}

		// Supprimer le conteneur
		await containerClient.delete();

		console.log(`Conteneur Azure "${containerName}" supprimé avec succès`);

		return {
			success: true,
			message: "Conteneur supprimé avec succès",
		};
	} catch (error) {
		console.error(
			"Erreur lors de la suppression du conteneur Azure:",
			error
		);
		return {
			success: false,
			message: error.message,
			error,
		};
	}
}
