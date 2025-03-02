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

			// Charger les statistiques
			await loadStats();

			// Charger les accomplissements
			await loadAchievements();

			// Vérifier les nouveaux accomplissements
			await checkNewAchievements();

			setLastRefresh(new Date());
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données utilisateur:",
				error
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Charger les formations de l'utilisateur
	const loadTrainings = async () => {
		try {
			const response = await axios.get(
				`/api/db/wisetrainer/user-trainings/${containerName}`
			);
			const userTrainings = response.data.trainings || [];
			setTrainings(userTrainings);

			// Mettre à jour les projets récents à partir des formations
			const projects = userTrainings
				.map((training) => ({
					id: training.id,
					name: training.name,
					type: "wiseTrainer",
					imageUrl:
						training.imageUrl || "/images/png/placeholder.png",
					progress: training.progress,
					lastModified: training.lastAccessed,
					totalUsers: 1,
				}))
				.sort(
					(a, b) =>
						new Date(b.lastModified) - new Date(a.lastModified)
				)
				.slice(0, 6);

			setRecentProjects(projects);

			// Mettre à jour les statistiques basiques
			setStats((prevStats) => ({
				...prevStats,
				wiseTrainer: userTrainings.length,
				completionRate: calculateCompletionRate(userTrainings),
			}));

			return userTrainings;
		} catch (error) {
			console.error("Erreur lors du chargement des formations:", error);
			return [];
		}
	};

	// Charger les statistiques de l'utilisateur
	const loadStats = async () => {
		try {
			const response = await axios.get(
				`/api/db/stats/user/${containerName}`
			);
			const userStats = response.data;

			setStats((prevStats) => ({
				...prevStats,
				totalTime: userStats.totalTimeInHours || 0,
				questionsAnswered: userStats.questionsAnswered || 0,
				correctAnswers: userStats.correctAnswers || 0,
				successRate: userStats.successRate || 0,
				sessionsCompleted: userStats.sessionsCompleted || 0,
			}));

			return userStats;
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
			return null;
		}
	};

	// Charger les accomplissements de l'utilisateur
	const loadAchievements = async () => {
		try {
			const response = await axios.get(
				`/api/db/achievements/user/${containerName}`
			);
			const userAchievements = response.data.achievements || [];
			setAchievements(userAchievements);
			return userAchievements;
		} catch (error) {
			console.error(
				"Erreur lors du chargement des accomplissements:",
				error
			);

			// En cas d'erreur, utiliser des données par défaut basées sur le service d'accomplissements
			const defaultAchievements = achievementService.achievements.map(
				(a) => ({
					id: a.id,
					title: a.title,
					description: a.description,
					iconName: a.icon,
					unlocked: false,
				})
			);

			setAchievements(defaultAchievements);
			return defaultAchievements;
		}
	};

	// Vérifier si de nouveaux accomplissements peuvent être débloqués
	const checkNewAchievements = async () => {
		try {
			// Créer un objet avec toutes les données utilisateur pour la vérification
			const userData = {
				courses: trainings,
				stats: stats,
			};

			const unlocked = await achievementService.checkAchievements(
				containerName,
				userData
			);
			if (unlocked.length > 0) {
				setNewAchievements(unlocked);
				// Recharger les accomplissements pour avoir la liste à jour
				await loadAchievements();
			}

			return unlocked;
		} catch (error) {
			console.error(
				"Erreur lors de la vérification des nouveaux accomplissements:",
				error
			);
			return [];
		}
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
