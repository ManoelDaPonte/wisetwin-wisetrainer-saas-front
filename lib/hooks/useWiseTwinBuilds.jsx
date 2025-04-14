//lib/hooks/useWiseTwinBuilds.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

export function useWiseTwinBuilds(userId) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [builds, setBuilds] = useState([]);

	useEffect(() => {
		if (!userId) return;

		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Récupérer les builds disponibles dans le container source
				const buildsResponse = await axios.get(
					WISETWIN_CONFIG.API_ROUTES.LIST_BUILDS,
					{
						params: {
							container: WISETWIN_CONFIG.CONTAINER_NAMES.SOURCE,
						},
					}
				);

				if (
					buildsResponse.data &&
					(buildsResponse.data.blobs || buildsResponse.data.builds)
				) {
					const buildData = buildsResponse.data.builds || [];
					let buildsList = [];

					// Si nous avons les données dans le format attendu
					if (buildData.length > 0) {
						buildsList = buildData;
					}
					// Sinon, essayer de traiter les blobs si disponibles
					else if (
						buildsResponse.data.blobs &&
						buildsResponse.data.blobs.length > 0
					) {
						// Utiliser une fonction pour traiter les noms de blobs
						buildsList = processBuildNames(
							buildsResponse.data.blobs,
							WISETWIN_CONFIG,
							"wisetwin" // Spécifier explicitement la source comme WiseTwin
						);
					}

					// Enrichir chaque build avec des métadonnées supplémentaires
					const enrichedBuilds = await Promise.all(
						buildsList.map(async (build) => {
							try {
								// Récupérer les détails du build depuis le fichier de configuration
								const detailsResponse = await axios
									.get(
										`${WISETWIN_CONFIG.API_ROUTES.BUILD_DETAILS}/${build.id}`
									)
									.catch(() => ({ data: null }));

								const buildDetails = detailsResponse.data;

								// Utiliser les détails du fichier de configuration quand disponibles
								return {
									...build,
									name: buildDetails?.name || build.name,
									description:
										buildDetails?.description ||
										build.description,
									imageUrl:
										buildDetails?.imageUrl ||
										build.imageUrl ||
										WISETWIN_CONFIG.DEFAULT_IMAGE,
									category:
										buildDetails?.category ||
										build.category ||
										"Environnement industriel",
									features:
										buildDetails?.features ||
										build.features ||
										[],
									source: {
										type: "wisetwin",
										name: "WiseTwin",
									},
								};
							} catch (error) {
								console.warn(
									`Erreur lors de l'enrichissement du build ${build.id}:`,
									error
								);
								return {
									...build,
									source: {
										type: "wisetwin",
										name: "WiseTwin",
									},
									imageUrl:
										build.imageUrl ||
										WISETWIN_CONFIG.DEFAULT_IMAGE,
								};
							}
						})
					);

					setBuilds(enrichedBuilds);
				} else {
					setBuilds([]);
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des builds WiseTwin:",
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
		builds,
	};
}

// Fonction auxiliaire pour traiter les noms de blobs
function processBuildNames(blobs, config, sourceType = null) {
	// Extraire les noms uniques des builds (sans extension)
	const buildIds = new Set();

	blobs.forEach((blob) => {
		// Exemple: "wisetwin/factory-01.data.gz" -> "factory-01"
		const match = blob.match(
			/(?:wisetwin\/)?([^\/]+?)(?:\.data\.gz|\.framework\.js\.gz|\.loader\.js|\.wasm\.gz)$/
		);
		if (match && match[1]) {
			buildIds.add(match[1]);
		}
	});

	// Créer des objets à partir des IDs
	return Array.from(buildIds).map((id) => {
		const name = id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			id,
			name,
			description: `Environnement 3D interactif de ${name.toLowerCase()}`,
			imageUrl: config.DEFAULT_IMAGE,
			category: "Environnement industriel",
			features: [
				"Visite interactive",
				"Mesures de sécurité",
				"Exploration détaillée",
			],
			source: {
				type: sourceType || "wisetwin",
				name: "WiseTwin",
			},
		};
	});
}

export default useWiseTwinBuilds;
