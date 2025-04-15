"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

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
	const [recentProjects, setRecentProjects] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
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
			const enrichedTrainings = await loadTrainings();

			// Charger les statistiques depuis l'API
			await loadUserStats();

			// Mettre à jour la date de dernière actualisation
			setLastRefresh(new Date());
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données utilisateur:",
				error
			);
			// En cas d'erreur, utiliser quand même les données de démo
			setRecentProjects([]);
		} finally {
			setIsLoading(false);
		}
	};

	// Charger les formations de l'utilisateur
	const loadTrainings = async () => {
		try {
			// Récupérer les formations de l'utilisateur
			const response = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${containerName}`
			);
			const userTrainings = response.data.trainings || [];

			// Enrichir chaque formation avec le nombre correct de modules et l'image correcte du fichier JSON
			const enrichedTrainings = await Promise.all(
				userTrainings.map(async (training) => {
					try {
						// Récupérer les détails du cours directement depuis l'API qui lit les fichiers JSON
						const courseDetails = await axios
							.get(
								`${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${training.id}`
							)
							.then((res) => res.data)
							.catch(() => null);

						// Récupérer les modules disponibles depuis les détails du cours
						const availableModules = courseDetails?.modules || [];

						// Utiliser l'URL d'image du fichier JSON si disponible
						const imageUrl =
							courseDetails?.imageUrl ||
							training.imageUrl ||
							WISETRAINER_CONFIG.DEFAULT_IMAGE;

						// Fusionner avec les modules complétés par l'utilisateur
						const mergedModules = availableModules.map((module) => {
							// Chercher si l'utilisateur a déjà complété ce module
							const userModule = training.modules?.find(
								(m) => m.id === module.id
							);

							return {
								...module,
								completed: userModule
									? userModule.completed
									: false,
								score: userModule ? userModule.score : 0,
							};
						});

						return {
							...training,
							imageUrl: imageUrl, // Utiliser l'URL d'image correcte
							modules: mergedModules,
							totalModules: availableModules.length || 3, // Utiliser 3 comme valeur par défaut si aucun module trouvé
							completedModules:
								training.modules?.filter((m) => m.completed)
									.length || 0,
						};
					} catch (error) {
						console.warn(
							`Erreur lors de l'enrichissement du cours ${training.id}:`,
							error
						);
						return {
							...training,
							modules: training.modules || [],
							totalModules: 3, // Valeur par défaut de 3 modules
							completedModules:
								training.modules?.filter((m) => m.completed)
									.length || 0,
						};
					}
				})
			);

			setTrainings(enrichedTrainings);

			// Mettre à jour les projets récents avec les images correctes
			const projects = enrichedTrainings
				.map((training) => ({
					id: training.id,
					name: training.name,
					type: "wiseTrainer",
					imageUrl:
						training.imageUrl || WISETRAINER_CONFIG.DEFAULT_IMAGE,
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

	const loadUserStats = async () => {
		try {
			// Récupérer les statistiques depuis l'API
			const response = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.STATS_USER}/${containerName}`
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

				// Calculer le score moyen à partir des formations
				const calculateAverageScore = () => {
					const completedTrainings = trainings.filter(
						(t) => t.progress === 100
					);
					if (completedTrainings.length === 0) return 0;

					// Moyenne des scores de modules pour chaque formation
					const totalScore = completedTrainings.reduce(
						(sum, training) => {
							// Calculer le score moyen de cette formation
							const moduleScores =
								training.modules
									?.filter((m) => m.completed)
									.map((m) => m.score) || [];
							const trainingAvg =
								moduleScores.length > 0
									? Math.round(
											moduleScores.reduce(
												(a, b) => a + b,
												0
											) / moduleScores.length
									  )
									: 0;
							return sum + (trainingAvg || 0);
						},
						0
					);

					return (
						Math.round(totalScore / completedTrainings.length) || 0
					);
				};

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
					// Calculer le score moyen à partir des formations
					averageScore:
						response.data.averageScore || calculateAverageScore(),
					// Ajouter le nombre de sessions complétées
					sessionsCompleted: response.data.sessionsCompleted || 0,
				});
			}
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
			// Utiliser les statistiques locales en cas d'erreur

			// Calculer le score moyen à partir des formations
			const calculateAverageScore = () => {
				const completedTrainings = trainings.filter(
					(t) => t.progress === 100
				);
				if (completedTrainings.length === 0) return 0;

				// Moyenne des scores de modules pour chaque formation
				const totalScore = completedTrainings.reduce(
					(sum, training) => {
						// Calculer le score moyen de cette formation
						const moduleScores =
							training.modules
								?.filter((m) => m.completed)
								.map((m) => m.score) || [];
						const trainingAvg =
							moduleScores.length > 0
								? Math.round(
										moduleScores.reduce(
											(a, b) => a + b,
											0
										) / moduleScores.length
								  )
								: 0;
						return sum + (trainingAvg || 0);
					},
					0
				);

				return Math.round(totalScore / completedTrainings.length) || 0;
			};

			setStats({
				digitalTwin: 0,
				wiseTrainer: trainings.length || 0,
				totalTime: 1, // Valeur minimale pour éviter de montrer 0h
				completionRate: calculateCompletionRate(trainings),
				questionsAnswered: 0,
				correctAnswers: 0,
				successRate: 0,
				averageScore: calculateAverageScore(),
				sessionsCompleted: 0,
			});
		}
	};

	// Calculer le score moyen à partir des formations terminées
	const calculateAverageScore = (trainings) => {
		const completedTrainings = trainings.filter((t) => t.progress === 100);
		if (completedTrainings.length === 0) return 0;

		// Moyenne des scores de modules pour chaque formation
		const totalScore = completedTrainings.reduce((sum, training) => {
			// Calculer le score moyen de cette formation
			const moduleScores =
				training.modules
					?.filter((m) => m.completed)
					.map((m) => m.score) || [];
			const trainingAvg =
				moduleScores.length > 0
					? Math.round(
							moduleScores.reduce((a, b) => a + b, 0) /
								moduleScores.length
					  )
					: 0;
			return sum + trainingAvg;
		}, 0);

		return Math.round(totalScore / completedTrainings.length);
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

	// Valeur du contexte à fournir
	const contextValue = {
		trainings,
		stats,
		recentProjects,
		isLoading,
		lastRefresh,
		refreshData: loadUserData,
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
