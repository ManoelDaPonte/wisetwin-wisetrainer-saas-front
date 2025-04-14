//lib/hooks/useCurrentTraining.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export function useCurrentTraining() {
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [currentTrainings, setCurrentTrainings] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastRefresh, setLastRefresh] = useState(Date.now());

	// Fonction de récupération des formations encapsulée avec useCallback
	const fetchCurrentTrainings = useCallback(async () => {
		if (!containerName) return;

		try {
			setIsLoading(true);
			setError(null);

			// Deux approches parallèles pour obtenir les données les plus complètes possible

			// 1. Récupérer les formations de l'utilisateur depuis la base de données
			const dbResponse = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${containerName}`
			);

			// 2. Vérifier les fichiers dans le container de l'utilisateur (peut contenir des formations non encore dans la DB)
			const containerResponse = await axios.get(
				WISETRAINER_CONFIG.API_ROUTES.LIST_BUILDS,
				{
					params: {
						container: containerName,
						prefix: WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER,
					},
				}
			);

			// Formations depuis la base de données
			const dbTrainings = dbResponse.data?.trainings || [];

			// Extraire les IDs des formations dans le container
			let containerTrainingIds = [];
			if (containerResponse.data?.blobs) {
				const blobs = containerResponse.data.blobs;

				// Extraire les IDs uniques des builds (sans extension)
				const buildIdsSet = new Set();
				blobs.forEach((blob) => {
					// Exemple: "wisetrainer/safety-101.data.gz" -> "safety-101"
					const match = blob.match(
						/(?:wisetrainer\/)?([^\/]+?)(?:\.data\.gz|\.framework\.js\.gz|\.loader\.js|\.wasm\.gz)$/
					);
					if (match && match[1]) {
						buildIdsSet.add(match[1]);
					}
				});

				containerTrainingIds = Array.from(buildIdsSet);
			}

			// Fusionner les deux sources (priorité à la base de données pour les détails)
			const mergedTrainings = [...dbTrainings];

			// Pour chaque ID de formation trouvé dans le container mais pas dans la DB
			const dbTrainingIds = dbTrainings.map((t) => t.id);
			const missingTrainingIds = containerTrainingIds.filter(
				(id) => !dbTrainingIds.includes(id)
			);

			// Si des formations sont présentes dans le container mais pas dans la DB,
			// essayer de récupérer leurs détails
			if (missingTrainingIds.length > 0) {
				const additionalTrainings = await Promise.all(
					missingTrainingIds.map(async (id) => {
						try {
							// Récupérer les détails de la formation
							const details = await axios.get(
								`${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${id}`
							);

							// Créer un objet formation avec les données disponibles
							return {
								id,
								name:
									details.data?.name || formatCourseName(id),
								description:
									details.data?.description ||
									`Formation interactive sur ${formatCourseName(
										id
									).toLowerCase()}`,
								imageUrl:
									details.data?.imageUrl ||
									WISETRAINER_CONFIG.DEFAULT_IMAGE,
								difficulty:
									details.data?.difficulty || "Intermédiaire",
								duration: details.data?.duration || "30 min",
								category: details.data?.category || "Formation",
								modules: details.data?.modules || [],
								progress: 0, // Par défaut 0% car pas encore commencée
								lastAccessed: new Date().toISOString(),
								completedModules: 0,
								totalModules:
									details.data?.modules?.length || 3,
							};
						} catch (error) {
							console.warn(
								`Impossible de récupérer les détails pour ${id}:`,
								error
							);
							// Version minimale si on ne peut pas récupérer les détails
							return {
								id,
								name: formatCourseName(id),
								description: `Formation interactive sur ${formatCourseName(
									id
								).toLowerCase()}`,
								imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
								difficulty: "Intermédiaire",
								duration: "30 min",
								progress: 0,
								lastAccessed: new Date().toISOString(),
								modules: [],
								completedModules: 0,
								totalModules: 3,
							};
						}
					})
				);

				// Ajouter ces formations aux formations existantes
				mergedTrainings.push(...additionalTrainings);
			}

			// Enrichir chaque formation avec des détails supplémentaires
			const enrichedTrainings = await Promise.all(
				mergedTrainings.map(async (training) => {
					try {
						// Récupérer les détails du cours depuis le fichier de configuration
						const courseDetails = await axios
							.get(
								`${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${training.id}`
							)
							.then((res) => res.data)
							.catch(() => null);

						// Récupérer l'image et les modules du fichier de configuration
						const imageUrl =
							courseDetails?.imageUrl ||
							training.imageUrl ||
							WISETRAINER_CONFIG.DEFAULT_IMAGE;
						const availableModules = courseDetails?.modules || [];

						// Fusionner avec les modules déjà complétés par l'utilisateur
						const mergedModules = availableModules.map((module) => {
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
							imageUrl,
							modules:
								mergedModules.length > 0
									? mergedModules
									: training.modules || [],
							totalModules:
								availableModules.length ||
								training.modules?.length ||
								3,
							completedModules:
								training.modules?.filter((m) => m.completed)
									.length || 0,
						};
					} catch (error) {
						console.warn(
							`Erreur lors de l'enrichissement du cours ${training.id}:`,
							error
						);
						return training;
					}
				})
			);

			setCurrentTrainings(enrichedTrainings);
			setLastRefresh(Date.now());
		} catch (err) {
			console.error(
				"Erreur lors de la récupération des formations en cours:",
				err
			);
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, [containerName]);

	// Effet pour charger les formations au démarrage et quand le container change
	useEffect(() => {
		if (containerName && !containerLoading) {
			fetchCurrentTrainings();
		}
	}, [containerName, containerLoading, fetchCurrentTrainings]);

	// Fonction pour rafraîchir manuellement les données
	const refresh = useCallback(() => {
		if (containerName) {
			fetchCurrentTrainings();
		}
	}, [containerName, fetchCurrentTrainings]);

	// Helper pour formatter le nom du cours
	const formatCourseName = (id) => {
		return id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	return {
		currentTrainings,
		isLoading: isLoading || containerLoading,
		error,
		refresh,
		lastRefresh,
	};
}

export default useCurrentTraining;
