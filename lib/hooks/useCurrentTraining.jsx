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

			// Récupérer les formations de l'utilisateur depuis la base de données
			// Cette API ne récupère que les informations de progression, pas les fichiers
			const dbResponse = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${containerName}`
			);

			// Formations depuis la base de données avec info de progression
			const userTrainings = dbResponse.data?.trainings || [];

			// Enrichir chaque formation avec des détails supplémentaires et la source
			const enrichedTrainings = await Promise.all(
				userTrainings.map(async (training) => {
					try {
						// Déterminer la source de la formation
						let source = {
							type: "wisetwin",
							name: "WiseTwin",
							containerName:
								WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE,
						};

						let courseDetailsUrl = `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${training.id}`;

						// Vérifier si c'est une formation d'organisation
						if (
							training.source &&
							training.source.type === "organization"
						) {
							source = {
								type: "organization",
								name: training.source.name || "Organisation",
								organizationId: training.source.organizationId,
								containerName:
									training.source.containerName || null,
							};

							// Utiliser l'API de détails de cours d'organisation
							courseDetailsUrl = `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/organization/${source.organizationId}/${training.id}`;
						}

						// Récupérer les détails du cours depuis la source appropriée
						const courseDetails = await axios
							.get(courseDetailsUrl)
							.then((res) => res.data)
							.catch(() => null);

						// Récupérer l'image et les modules
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

						// Génération d'un ID composite qui inclut la source
						const compositeId = `${training.id}__${source.type}__${
							source.organizationId || "wisetwin"
						}`;

						return {
							...training,
							compositeId, // ID composite pour identifier de manière unique
							imageUrl,
							// Préserver le nom formaté ou utiliser celui des détails du cours
							name: courseDetails?.name || training.name || formatCourseName(training.id),
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
							source: source, // Information de source enrichie
							// URL pour accéder à la formation (basée sur la source)
							trainingUrl:
								source.type === "organization"
									? `/wisetrainer/organization/${source.organizationId}/${training.id}`
									: `/wisetrainer/${training.id}`,
						};
					} catch (error) {
						console.warn(
							`Erreur lors de l'enrichissement du cours ${training.id}:`,
							error
						);

						// Déterminer la source basique
						const source = training.source || {
							type: "wisetwin",
							name: "WiseTwin",
							containerName:
								WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE,
						};

						// Même en cas d'erreur, créer un ID composite
						const compositeId = `${training.id}__${source.type}__${
							source.organizationId || "wisetwin"
						}`;

						return {
							...training,
							compositeId,
							// Utiliser formatCourseName pour s'assurer que le nom est correctement formaté
							name: training.name || formatCourseName(training.id),
							source,
							trainingUrl:
								source.type === "organization"
									? `/wisetrainer/organization/${source.organizationId}/${training.id}`
									: `/wisetrainer/${training.id}`,
						};
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
