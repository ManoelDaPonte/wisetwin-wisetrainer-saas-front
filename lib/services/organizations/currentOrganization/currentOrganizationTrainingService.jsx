//lib/services/organizations/currentOrganization/currentOrganizationTrainingService.jsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Service pour gérer les formations d'une organisation
 */
class CurrentOrganizationTrainingService {
	/**
	 * Récupère toutes les formations d'une organisation
	 * @param {string} organizationId - ID de l'organisation
	 * @returns {Promise<Array>} Liste des formations
	 */
	async getOrganizationTrainings(organizationId) {
		try {
			// Récupérer toutes les formations assignées à l'organisation
			const trainings = await prisma.organizationTraining.findMany({
				where: {
					organizationId: organizationId,
				},
				include: {
					course: {
						select: {
							name: true,
							description: true,
							category: true,
							difficulty: true,
							duration: true,
							// Autres champs basiques du cours si nécessaire
						},
					},
				},
				orderBy: {
					assignedAt: "desc",
				},
			});

			// Formatage des données pour le frontend
			return trainings.map((training) => ({
				id: training.id,
				courseId: training.courseId,
				courseName: training.course?.name || "Formation sans titre",
				courseCategory: training.course?.category || "Non catégorisé",
				buildId: training.buildId,
				isCustomBuild: training.isCustomBuild,
				isActive: training.isActive,
				// Un indicateur simple pour montrer si la formation est reliée à du contenu
				hasContent: !!training.course,
				assignedAt: training.assignedAt,
			}));
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des formations:",
				error
			);
			throw error;
		}
	}
}

// Export d'une instance unique du service
export const currentOrganizationTrainingService =
	new CurrentOrganizationTrainingService();
