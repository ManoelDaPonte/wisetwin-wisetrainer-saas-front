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

			// Chargement des données pour Overview
			// Pour l'instant, on utilise un jeu de données de démonstration en attendant
			// que toutes les API soient complètement fonctionnelles
			setDemoData();

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
