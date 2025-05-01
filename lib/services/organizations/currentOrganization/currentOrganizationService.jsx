// lib/services/organizations/currentOrganization/currentOrganizationService.jsx
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";

const prisma = new PrismaClient();

/**
 * Service pour les opérations courantes sur l'organisation courante
 */
class CurrentOrganizationService {
	/**
	 * Récupère une organisation par son ID avec des options de sélection flexibles
	 * @param {string} organizationId - ID de l'organisation
	 * @param {Object} options - Options de sélection
	 * @param {boolean} options.basicInfo - Inclure les informations de base (nom, description, logo)
	 * @param {boolean} options.membersCount - Inclure le nombre de membres
	 * @param {boolean} options.container - Inclure les informations du container Azure
	 * @param {boolean} options.allMembers - Inclure tous les membres
	 * @returns {Promise<Object>} Les données de l'organisation selon les options choisies
	 */
	async getOrganizationById(organizationId, options = {}) {
		try {
			const {
				basicInfo = true,
				membersCount = false,
				container = false,
				allMembers = false,
			} = options;

			// On ne peut pas utiliser à la fois select et include,
			// donc si on a besoin d'include (allMembers), on n'utilise pas select

			let queryOptions = {
				where: { id: organizationId },
			};

			if (allMembers) {
				// Si on veut les membres, on utilise include
				queryOptions.include = {
					members: {
						include: {
							user: {
								select: {
									id: true,
									name: true,
									email: true,
								},
							},
						},
					},
				};
			} else {
				// Sinon, on utilise select pour les champs basiques
				const select = {};

				if (basicInfo) {
					select.id = true;
					select.name = true;
					select.description = true;
					select.logoUrl = true;
					select.isActive = true;
					select.createdAt = true;
					select.updatedAt = true;
				}

				if (container) {
					select.azureContainer = true;
				}

				queryOptions.select = select;
			}

			// Effectuer la requête principale
			const organization = await prisma.organization.findUnique(
				queryOptions
			);

			if (!organization) {
				return null;
			}

			// Si on demande le nombre de membres et qu'on n'a pas déjà récupéré tous les membres
			if (membersCount && !allMembers) {
				const count = await prisma.organizationMember.count({
					where: { organizationId },
				});

				return {
					...organization,
					membersCount: count,
				};
			}

			// Si on a déjà récupéré tous les membres, calculer le nombre et formater les données
			if (allMembers) {
				return {
					...organization,
					membersCount: organization.members.length,
					// Formater les membres pour la cohérence avec d'autres parties de l'application
					members: organization.members.map((member) => ({
						id: member.id,
						userId: member.user.id,
						name:
							member.user.name || member.user.email.split("@")[0],
						email: member.user.email,
						role: member.role,
						joinedAt: member.joinedAt,
					})),
				};
			}

			return organization;
		} catch (error) {
			console.error(
				"Erreur lors de la récupération de l'organisation:",
				error
			);
			throw error;
		}
	}

	/**
	 * Récupère juste le nom d'une organisation
	 * @param {string} organizationId - ID de l'organisation
	 * @returns {Promise<string|null>} Le nom de l'organisation ou null si non trouvée
	 */
	async getOrganizationName(organizationId) {
		try {
			const organization = await prisma.organization.findUnique({
				where: { id: organizationId },
				select: { name: true },
			});

			return organization ? organization.name : null;
		} catch (error) {
			console.error(
				"Erreur lors de la récupération du nom de l'organisation:",
				error
			);
			throw error;
		}
	}

	/**
	 * Vérifie si une organisation existe
	 * @param {string} organizationId - ID de l'organisation
	 * @returns {Promise<boolean>} true si l'organisation existe, false sinon
	 */
	async organizationExists(organizationId) {
		try {
			const count = await prisma.organization.count({
				where: { id: organizationId },
			});

			return count > 0;
		} catch (error) {
			console.error(
				"Erreur lors de la vérification de l'existence de l'organisation:",
				error
			);
			throw error;
		}
	}

	/**
	 * Supprime un container Azure associé à une organisation
	 * @param {string} containerName - Nom du container à supprimer
	 * @returns {Promise<Object>} Résultat de la suppression
	 */
	async deleteAzureContainer(containerName) {
		try {
			if (!containerName) {
				console.warn("Pas de nom de container à supprimer");
				return {
					success: false,
					message: "Nom de container non fourni",
				};
			}

			// Connexion au service Azure Blob Storage
			const blobServiceClient = BlobServiceClient.fromConnectionString(
				process.env.AZURE_STORAGE_CONNECTION_STRING
			);

			// Récupération du client du container
			const containerClient =
				blobServiceClient.getContainerClient(containerName);

			// Vérifier que le container existe
			const containerExists = await containerClient.exists();
			if (!containerExists) {
				console.warn(`Le container ${containerName} n'existe pas`);
				return { success: false, message: "Container inexistant" };
			}

			// Supprimer le container
			await containerClient.delete();

			return {
				success: true,
				message: `Container ${containerName} supprimé avec succès`,
			};
		} catch (error) {
			console.error("Erreur lors de la suppression du container:", error);
			return {
				success: false,
				message: error.message,
				error,
			};
		}
	}

	/**
	 * Supprime une organisation avec son container Azure associé
	 * @param {string} organizationId - ID de l'organisation à supprimer
	 * @returns {Promise<Object>} Résultat de la suppression
	 */
	async deleteOrganization(organizationId) {
		try {
			// Récupérer l'organisation pour obtenir le nom du container Azure
			const organization = await this.getOrganizationById(
				organizationId,
				{
					basicInfo: true,
					container: true,
				}
			);

			if (!organization) {
				return {
					success: false,
					message: "Organisation non trouvée",
				};
			}

			// Supprimer le container Azure associé à l'organisation
			let containerDeleteResult = {
				success: true,
				message: "Aucun container à supprimer",
			};

			if (organization.azureContainer) {
				containerDeleteResult = await this.deleteAzureContainer(
					organization.azureContainer
				);
				console.log(
					"Résultat de la suppression du container:",
					containerDeleteResult
				);
			}

			// Supprimer l'organisation (les relations seront supprimées automatiquement grâce à onDelete: Cascade)
			await prisma.organization.delete({
				where: {
					id: organizationId,
				},
			});

			return {
				success: true,
				message: "L'organisation a été supprimée avec succès",
				containerDeleteResult,
			};
		} catch (error) {
			console.error(
				"Erreur lors de la suppression de l'organisation:",
				error
			);
			return {
				success: false,
				message: error.message,
				error,
			};
		}
	}
}

// Export d'une instance unique du service
export const currentOrganizationService = new CurrentOrganizationService();
