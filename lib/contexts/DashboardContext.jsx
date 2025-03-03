//lib/contexts/DashboardContext.jsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import achievementService from "@/lib/services/achievementService";

// Création du contexte
const DashboardContext = createContext();

/**
 * Fournisseur de contexte pour les données du tableau de bord
 */
export function DashboardProvider({ children }) {
	const router = useRouter();
	const { user, isLoading: userLoading } = useUser();
	const { containerName, isLoading: containerLoading } = useAzureContainer();

	// États pour les données
	const [trainings, setTrainings] = useState([]);
	const [stats, setStats] = useState({
		digitalTwin: 0,
		wiseTrainer: 0,
		totalTime: 0,
		completionRate: 0,
		questionsAnswered: 0,
		correctAnswers: 0,
		successRate: 0,
	});
	const [achievements, setAchievements] = useState([]);
	const [recentProjects, setRecentProjects] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [newAchievements, setNewAchievements] = useState([]);
	const [lastRefresh, setLastRefresh] = useState(null);

	// Charger toutes les données de l'utilisateur
	useEffect(() => {
		if (user && containerName && !containerLoading && !userLoading) {
			loadUserData();
		} else if (!userLoading && !user) {
			// Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
			router.push("/login");
		}
	}, [user, containerName, containerLoading, userLoading, router]);

	// Fonction principale pour charger toutes les données
	const loadUserData = async () => {
		setIsLoading(true);
		try {
			// Charger les formations
			await loadTrainings();

			// Charger les statistiques depuis l'API
			await loadUserStats();

			// Charger les achievements depuis l'API
			await loadAchievements();

			// Mettre à jour la date de dernière actualisation
			setLastRefresh(new Date());
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données utilisateur:",
				error
			);
			// En cas d'erreur, utiliser quand même les données de démo
			setDemoData();
		} finally {
			setIsLoading(false);
		}
	};

	// Charger les formations de l'utilisateur
	const loadTrainings = async () => {
		try {
			// Récupérer les formations de l'utilisateur
			const response = await axios.get(
				`/api/db/wisetrainer/user-trainings/${containerName}`
			);
			const userTrainings = response.data.trainings || [];

			// Enrichir chaque formation avec le nombre correct de modules
			const enrichedTrainings = await Promise.all(
				userTrainings.map(async (training) => {
					try {
						// Essayer de récupérer les détails du cours via une API
						const courseDetails = await axios
							.get(
								`/api/db/wisetrainer/course-details/${training.id}`
							)
							.then((res) => res.data)
							.catch(() => null);

						// Déterminer le nombre total de modules
						const totalModules =
							courseDetails && courseDetails.modules
								? courseDetails.modules.length
								: training.modules && training.modules.length
								? training.modules.length
								: 3; // Valeur par défaut

						return {
							...training,
							// Assurer que nous avons des données de modules
							modules: training.modules || [],
							// Définir explicitement le nombre total de modules
							totalModules: totalModules,
							// Calculer le nombre de modules complétés
							completedModules: training.modules
								? training.modules.filter((m) => m.completed)
										.length
								: 0,
						};
					} catch (error) {
						console.warn(
							`Erreur lors de l'enrichissement du cours ${training.id}:`,
							error
						);
						return {
							...training,
							modules: training.modules || [],
							totalModules: training.modules
								? training.modules.length
								: 3,
							completedModules: training.modules
								? training.modules.filter((m) => m.completed)
										.length
								: 0,
						};
					}
				})
			);

			setTrainings(enrichedTrainings);

			// Mettre à jour les projets récents
			const projects = enrichedTrainings
				.map((training) => ({
					id: training.id,
					name: training.name,
					type: "wiseTrainer",
					imageUrl:
						training.imageUrl || "/images/png/placeholder.png",
					progress: training.progress,
					lastModified: training.lastAccessed,
					totalUsers: 1,
					// Ajouter les informations sur les modules
					completedModules: training.completedModules,
					totalModules: training.totalModules,
				}))
				.sort(
					(a, b) =>
						new Date(b.lastModified) - new Date(a.lastModified)
				)
				.slice(0, 6);

			setRecentProjects(projects);

			return enrichedTrainings;
		} catch (error) {
			console.error("Erreur lors du chargement des formations:", error);
			return [];
		}
	};

	// Charger les statistiques de l'utilisateur
	const loadUserStats = async () => {
		try {
			// Récupérer les statistiques depuis l'API
			const response = await axios.get(
				`/api/db/stats/user/${containerName}`
			);

			if (response.data) {
				// Calculer le taux de réussite si disponible
				let successRate = 0;
				if (
					response.data.questionsAnswered &&
					response.data.questionsAnswered > 0
				) {
					successRate = Math.round(
						(response.data.correctAnswers /
							response.data.questionsAnswered) *
							100
					);
				}

				// Calculer le temps total en heures
				const totalTimeInHours = response.data.totalTimeSpent
					? Math.max(1, Math.round(response.data.totalTimeSpent / 60)) // Convertir minutes en heures, minimum 1h
					: 0;

				setStats({
					digitalTwin: 0, // Pas encore implémenté
					wiseTrainer:
						trainings.length || response.data.activeCourses || 0,
					totalTime: totalTimeInHours,
					completionRate:
						response.data.completionRate ||
						calculateCompletionRate(trainings),
					questionsAnswered: response.data.questionsAnswered || 0,
					correctAnswers: response.data.correctAnswers || 0,
					successRate: successRate,
				});
			}
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
			// Utiliser les statistiques locales en cas d'erreur
			setStats({
				digitalTwin: 0,
				wiseTrainer: trainings.length || 0,
				totalTime: 1, // Valeur minimale pour éviter de montrer 0h
				completionRate: calculateCompletionRate(trainings),
				questionsAnswered: 0,
				correctAnswers: 0,
				successRate: 0,
			});
		}
	};

	// Charger les achievements de l'utilisateur
	const loadAchievements = async () => {
		try {
			const response = await axios.get(
				`/api/db/achievements/user/${containerName}`
			);

			if (response.data && response.data.achievements) {
				setAchievements(response.data.achievements);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des achievements:", error);
			// Utiliser des données de démo pour les achievements
			const demoAchievements = [
				{
					id: "first-training",
					title: "Première formation",
					description:
						"Vous avez commencé votre parcours de formation",
					iconName: "GraduationCap",
					unlocked: trainings.length > 0,
					unlockedAt:
						trainings.length > 0
							? new Date(
									Date.now() - 7 * 24 * 60 * 60 * 1000
							  ).toISOString()
							: null,
				},
				{
					id: "complete-training",
					title: "Formation complétée",
					description:
						"Vous avez terminé votre première formation avec succès",
					iconName: "Award",
					unlocked: trainings.some((t) => t.progress === 100),
					unlockedAt: trainings.some((t) => t.progress === 100)
						? new Date().toISOString()
						: null,
				},
				{
					id: "explorer",
					title: "Explorateur",
					description:
						"Vous avez découvert au moins 3 formations différentes",
					iconName: "Layers",
					unlocked: trainings.length >= 3,
					unlockedAt:
						trainings.length >= 3 ? new Date().toISOString() : null,
				},
			];

			setAchievements(demoAchievements);
		}
	};

	// Définir des données de démo pour les tests
	const setDemoData = () => {
		// Définir des statistiques par défaut
		setStats({
			digitalTwin: 0,
			wiseTrainer: trainings.length || 2,
			totalTime: 3,
			completionRate: calculateCompletionRate(trainings) || 65,
			questionsAnswered: 24,
			correctAnswers: 18,
			successRate: 75,
		});

		// Définir des accomplissements par défaut
		const demoAchievements = [
			{
				id: "first-training",
				title: "Première formation",
				description: "Vous avez commencé votre parcours de formation",
				iconName: "GraduationCap",
				unlocked: trainings.length > 0,
				unlockedAt:
					trainings.length > 0
						? new Date(
								Date.now() - 7 * 24 * 60 * 60 * 1000
						  ).toISOString()
						: null,
			},
			{
				id: "complete-training",
				title: "Formation complétée",
				description:
					"Vous avez terminé votre première formation avec succès",
				iconName: "Award",
				unlocked: trainings.some((t) => t.progress === 100),
				unlockedAt: trainings.some((t) => t.progress === 100)
					? new Date().toISOString()
					: null,
			},
			{
				id: "explorer",
				title: "Explorateur",
				description:
					"Vous avez découvert au moins 3 formations différentes",
				iconName: "Layers",
				unlocked: trainings.length >= 3,
				unlockedAt:
					trainings.length >= 3 ? new Date().toISOString() : null,
			},
		];

		setAchievements(demoAchievements);
	};

	// Utilité pour calculer le taux de complétion moyen
	const calculateCompletionRate = (trainings) => {
		if (!trainings || trainings.length === 0) return 0;

		const totalProgress = trainings.reduce(
			(sum, training) => sum + (training.progress || 0),
			0
		);
		return Math.round(totalProgress / trainings.length);
	};

	// Gérer la fermeture des notifications d'accomplissement
	const handleAchievementNotificationClose = (achievementId) => {
		setNewAchievements((prev) =>
			prev.filter((a) => a.id !== achievementId)
		);
	};

	// Valeur du contexte à fournir
	const contextValue = {
		trainings,
		stats,
		achievements,
		recentProjects,
		isLoading,
		newAchievements,
		lastRefresh,
		refreshData: loadUserData,
		handleAchievementNotificationClose,
	};

	return (
		<DashboardContext.Provider value={contextValue}>
			{children}
		</DashboardContext.Provider>
	);
}

// Hook personnalisé pour utiliser le contexte
export function useDashboard() {
	const context = useContext(DashboardContext);
	if (context === undefined) {
		throw new Error(
			"useDashboard doit être utilisé à l'intérieur d'un DashboardProvider"
		);
	}
	return context;
}

export default DashboardContext;
