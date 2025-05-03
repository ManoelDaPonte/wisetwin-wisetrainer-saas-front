//lib/hooks/useTrainingWiseTwin.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export function useTrainingWiseTwin(userId) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [trainings, setTrainings] = useState([]);

	useEffect(() => {
		if (!userId) return;

		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Récupérer les formations disponibles dans le container source
				const buildsResponse = await axios.get(
					WISETRAINER_CONFIG.API_ROUTES.LIST_BUILDS,
					{
						params: {
							container:
								WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE,
						},
					}
				);

				if (
					buildsResponse.data &&
					(buildsResponse.data.blobs || buildsResponse.data.builds)
				) {
					const buildData = buildsResponse.data.builds || [];
					let trainingsList = [];

					// Si nous avons les données dans le format attendu
					if (buildData.length > 0) {
						trainingsList = buildData;
					}
					// Sinon, essayer de traiter les blobs si disponibles
					else if (
						buildsResponse.data.blobs &&
						buildsResponse.data.blobs.length > 0
					) {
						// Utiliser une fonction pour traiter les noms de blobs
						trainingsList = processBuildNames(
							buildsResponse.data.blobs,
							WISETRAINER_CONFIG,
							"wisetwin" // Spécifier explicitement la source comme WiseTwin
						);
					}

					// Enrichir chaque formation avec des métadonnées supplémentaires
					const enrichedTrainings = await Promise.all(
						trainingsList.map(async (training) => {
							try {
								// Récupérer les détails de la formation depuis le fichier de configuration
								const detailsResponse = await axios.get(
									`${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${training.id}`
								);

								const courseDetails = detailsResponse.data;

								// Utiliser les détails du fichier de configuration quand disponibles
								return {
									...training,
									name: courseDetails.name || training.name,
									description:
										courseDetails.description ||
										training.description,
									imageUrl:
										courseDetails.imageUrl ||
										training.imageUrl ||
										WISETRAINER_CONFIG.DEFAULT_IMAGE,
									difficulty:
										courseDetails.difficulty ||
										training.difficulty ||
										"Intermédiaire",
									duration:
										courseDetails.duration ||
										training.duration ||
										"30 min",
									category:
										courseDetails.category ||
										training.category ||
										"Formation",
									modules:
										courseDetails.modules ||
										training.modules ||
										[],
									source: {
										type: "wisetwin",
										name: "WiseTwin",
									},
								};
							} catch (error) {
								console.warn(
									`Erreur lors de l'enrichissement du cours ${training.id}:`,
									error
								);
								return {
									...training,
									source: {
										type: "wisetwin",
										name: "WiseTwin",
									},
									imageUrl:
										training.imageUrl ||
										WISETRAINER_CONFIG.DEFAULT_IMAGE,
								};
							}
						})
					);

					setTrainings(enrichedTrainings);
				} else {
					setTrainings([]);
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des formations WiseTwin:",
					error
				);
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [userId]);

	return {
		isLoading,
		error,
		trainings,
	};
}

// Fonction auxiliaire pour traiter les noms de blobs (simplifiée)
// Si vous avez un module helper.jsx, il serait préférable de l'importer
function processBuildNames(blobs, config, sourceType = null) {
	// Extraire les noms uniques des builds (sans extension)
	const buildIds = new Set();

	blobs.forEach((blob) => {
		// Exemple: "wisetrainer/safety-101.data.gz" -> "safety-101"
		const match = blob.match(
			/(?:wisetrainer\/)?([^\/]+?)(?:\.data\.gz|\.framework\.js\.gz|\.loader\.js|\.wasm\.gz)$/
		);
		if (match && match[1]) {
			buildIds.add(match[1]);
		}
	});

	// Créer des objets de formation à partir des IDs
	return Array.from(buildIds).map((id) => {
		const name = id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			id,
			name,
			description: `Formation interactive sur ${name.toLowerCase()}`,
			imageUrl: config.DEFAULT_IMAGE,
			difficulty: "Intermédiaire",
			duration: "30 min",
			category: "Sécurité industrielle",
			source: {
				type: sourceType || "wisetwin",
				name: "WiseTwin",
			},
		};
	});
}
