//lib/services/achievementService.jsx
import axios from "axios";

// Définition des conditions pour chaque accomplissement
// format: { id, title, description, icon, checkFunction }
const achievements = [
	{
		id: "first-training",
		title: "Première formation",
		description: "Vous avez commencé votre parcours de formation",
		icon: "GraduationCap",
		// Vérifie si l'utilisateur a au moins une formation
		checkFunction: (userData) => {
			return userData.courses && userData.courses.length > 0;
		},
	},
	{
		id: "complete-training",
		title: "Formation complétée",
		description: "Vous avez terminé votre première formation avec succès",
		icon: "Award",
		// Vérifie si l'utilisateur a au moins une formation avec progress = 100
		checkFunction: (userData) => {
			return (
				userData.courses &&
				userData.courses.some((course) => course.progress === 100)
			);
		},
	},
	{
		id: "three-trainings",
		title: "Explorateur",
		description: "Vous avez découvert au moins 3 formations différentes",
		icon: "Layers",
		// Vérifie si l'utilisateur a au moins 3 formations
		checkFunction: (userData) => {
			return userData.courses && userData.courses.length >= 3;
		},
	},
	{
		id: "training-expert",
		title: "Expert en formation",
		description: "Vous avez complété au moins 3 formations",
		icon: "Trophy",
		// Vérifie si l'utilisateur a au moins 3 formations avec progress = 100
		checkFunction: (userData) => {
			return (
				userData.courses &&
				userData.courses.filter((course) => course.progress === 100)
					.length >= 3
			);
		},
	},
	{
		id: "learning-streak",
		title: "Assidu",
		description: "Vous vous êtes connecté 3 jours consécutifs",
		icon: "Calendar",
		// Cette vérification serait plus complexe et nécessiterait des données de connexion
		checkFunction: (userData) => {
			return userData.stats && userData.stats.consecutiveDays >= 3;
		},
	},
	{
		id: "answer-master",
		title: "Maître des réponses",
		description: "Vous avez répondu correctement à 50 questions",
		icon: "Check",
		// Vérifie si l'utilisateur a répondu correctement à au moins 50 questions
		checkFunction: (userData) => {
			return userData.stats && userData.stats.correctAnswers >= 50;
		},
	},
];

/**
 * Vérifie et débloque les accomplissements pour un utilisateur
 * @param {string} userId - Identifiant du container Azure de l'utilisateur
 * @param {Object} userData - Données de l'utilisateur (formations, statistiques, etc.)
 * @returns {Promise<Array>} - Liste des accomplissements débloqués
 */
export async function checkAchievements(userId, userData) {
	try {
		if (!userId || !userData) {
			console.error("userId et userData sont requis");
			return [];
		}

		// Récupérer les accomplissements actuels de l'utilisateur
		const response = await axios.get(`/api/db/achievements/user/${userId}`);
		const userAchievements = response.data.achievements || [];

		// Identifier les accomplissements non débloqués
		const unlockedAchievements = userAchievements
			.filter((a) => a.unlocked)
			.map((a) => a.id);
		const pendingAchievements = achievements.filter(
			(a) => !unlockedAchievements.includes(a.id)
		);

		// Vérifier chaque accomplissement non débloqué
		const newlyUnlocked = [];

		for (const achievement of pendingAchievements) {
			if (achievement.checkFunction(userData)) {
				// Tenter de débloquer l'accomplissement
				try {
					const unlockResponse = await axios.post(
						`/api/db/achievements/user/${userId}`,
						{
							achievementId: achievement.id,
							data: JSON.stringify({
								timestamp: new Date().toISOString(),
								context:
									"Débloqué automatiquement par le système",
							}),
						}
					);

					if (
						unlockResponse.data.success &&
						!unlockResponse.data.alreadyUnlocked
					) {
						newlyUnlocked.push(achievement);
					}
				} catch (error) {
					console.error(
						`Erreur lors du déblocage de l'accomplissement ${achievement.id}:`,
						error
					);
				}
			}
		}

		return newlyUnlocked;
	} catch (error) {
		console.error(
			"Erreur lors de la vérification des accomplissements:",
			error
		);
		return [];
	}
}

/**
 * Débloquer manuellement un accomplissement pour un utilisateur
 * @param {string} userId - Identifiant du container Azure de l'utilisateur
 * @param {string} achievementId - Identifiant de l'accomplissement
 * @param {Object} contextData - Données contextuelles pour l'accomplissement
 * @returns {Promise<Object>} - Résultat du déblocage
 */
export async function unlockAchievement(
	userId,
	achievementId,
	contextData = {}
) {
	try {
		if (!userId || !achievementId) {
			console.error("userId et achievementId sont requis");
			return { success: false, error: "Paramètres manquants" };
		}

		const response = await axios.post(
			`/api/db/achievements/user/${userId}`,
			{
				achievementId,
				data: JSON.stringify({
					timestamp: new Date().toISOString(),
					context: "Débloqué manuellement",
					...contextData,
				}),
			}
		);

		return response.data;
	} catch (error) {
		console.error(
			`Erreur lors du déblocage manuel de l'accomplissement ${achievementId}:`,
			error
		);
		return {
			success: false,
			error: error.response?.data?.error || "Erreur lors du déblocage",
		};
	}
}

export default {
	achievements,
	checkAchievements,
	unlockAchievement,
};
