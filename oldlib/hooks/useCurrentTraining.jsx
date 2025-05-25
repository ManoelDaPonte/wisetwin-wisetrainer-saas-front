//lib/hooks/useCurrentTraining.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { usePathname } from "next/navigation";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

// Durée du cache en ms (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache global pour partager les données entre les instances du hook
let globalCache = {
  trainings: [],
  lastFetched: null
};

export function useCurrentTraining() {
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const pathname = usePathname();
	const [currentTrainings, setCurrentTrainings] = useState(globalCache.trainings);
	const [isLoading, setIsLoading] = useState(globalCache.trainings.length === 0);
	const [error, setError] = useState(null);
	const [isPending, setIsPending] = useState(false);

	// Fonction de récupération des formations encapsulée avec useCallback
	const fetchCurrentTrainings = useCallback(async (force = false) => {
		// Si aucun container, impossible de récupérer les données
		if (!containerName) return [];
		
		// Vérifier si nous avons déjà des données récentes en cache global
		if (
			!force &&
			globalCache.trainings.length > 0 &&
			globalCache.lastFetched &&
			Date.now() - globalCache.lastFetched < CACHE_DURATION
		) {
			setCurrentTrainings(globalCache.trainings);
			setIsLoading(false);
			return globalCache.trainings;
		}

		// Éviter les requêtes multiples simultanées
		if (isPending) return globalCache.trainings;

		try {
			setIsPending(true);
			setIsLoading(true);
			setError(null);

			// Récupérer les formations de l'utilisateur depuis la base de données
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
									? `/wisetrainer/${source.organizationId}/${training.id}`
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
									? `/wisetrainer/${source.organizationId}/${training.id}`
									: `/wisetrainer/${training.id}`,
						};
					}
				})
			);

			// Mettre à jour le cache global et l'état local
			globalCache = {
				trainings: enrichedTrainings,
				lastFetched: Date.now()
			};
			
			setCurrentTrainings(enrichedTrainings);
			return enrichedTrainings;
		} catch (err) {
			console.error(
				"Erreur lors de la récupération des formations en cours:",
				err
			);
			setError(err);
			return [];
		} finally {
			setIsLoading(false);
			setIsPending(false);
		}
	}, [containerName, isPending]);

	// Détermine si les données doivent être chargées immédiatement
	const shouldLoadImmediately = useCallback(() => {
		// Pages qui nécessitent les données dès le chargement
		const immediateLoadPages = [
			'/wisetrainer',
			'/guide',
			'/mon-profil'
		];
		
		// Vérifier si le chemin actuel commence par l'un des préfixes ci-dessus
		return pathname && immediateLoadPages.some(page => pathname.startsWith(page));
	}, [pathname]);

	// Effet pour charger les formations uniquement lorsque nécessaire
	useEffect(() => {
		const needsLoading = shouldLoadImmediately();
		
		if (containerName && !containerLoading) {
			if (needsLoading) {
				// Charger les données immédiatement si on est sur une page qui en a besoin
				fetchCurrentTrainings();
			} else {
				// Sinon, utiliser le cache global s'il est disponible
				if (globalCache.trainings.length > 0) {
					setCurrentTrainings(globalCache.trainings);
				}
				setIsLoading(false);
			}
		} else if (!containerLoading) {
			// Si le container n'est pas disponible, ne pas montrer de chargement
			setIsLoading(false);
		}
	}, [containerName, containerLoading, fetchCurrentTrainings, shouldLoadImmediately]);

	// Fonction pour rafraîchir manuellement les données
	const refresh = useCallback(() => {
		if (containerName) {
			return fetchCurrentTrainings(true);
		}
	}, [containerName, fetchCurrentTrainings]);

	// Helper pour formatter le nom du cours
	const formatCourseName = (id) => {
		return id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	// Fonction pour garantir que les données sont chargées avant utilisation
	const ensureTrainings = useCallback(async () => {
		// Si on a des données récentes dans le cache, les utiliser
		if (
			globalCache.trainings.length > 0 && 
			globalCache.lastFetched && 
			Date.now() - globalCache.lastFetched < CACHE_DURATION
		) {
			if (currentTrainings.length === 0) {
				setCurrentTrainings(globalCache.trainings);
			}
			return globalCache.trainings;
		}
		
		// Sinon, charger les données
		return await fetchCurrentTrainings();
	}, [currentTrainings.length, fetchCurrentTrainings]);

	return {
		currentTrainings,
		isLoading: isLoading || containerLoading,
		error,
		refresh,
		lastRefresh: globalCache.lastFetched,
		ensureTrainings, // Fonction pour garantir que les données sont chargées
	};
}

export default useCurrentTraining;