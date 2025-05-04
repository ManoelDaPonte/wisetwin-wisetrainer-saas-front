//lib/hooks/useTrainingOrganization.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export function useTrainingOrganization(organizationId, containerName) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [organizationTrainings, setOrganizationTrainings] = useState([]);
	const [orgContainerName, setOrgContainerName] = useState(null);

	const fetchOrganizationTrainings = useCallback(async () => {
		if (!organizationId) {
			console.log(
				"ID d'organisation manquant, impossible de charger les formations"
			);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		try {
			console.log(
				`Récupération des formations pour l'organisation ${organizationId}`
			);
			const response = await axios.get(
				`/api/organization/${organizationId}/builds`
			);

			if (response.data) {
				console.log(
					`${
						response.data.builds?.length || 0
					} formations trouvées dans l'organisation`
				);

				// Récupérer l'organisation depuis l'API
				let organizationName = "Organisation";
				let organizationObj = null;
				try {
					const orgResponse = await axios.get(
						`/api/organization/${organizationId}`
					);
					if (orgResponse.data && orgResponse.data.organization) {
						organizationName = orgResponse.data.organization.name;
						organizationObj = orgResponse.data.organization;
					}
				} catch (orgError) {
					console.warn(
						"Impossible de récupérer les détails de l'organisation",
						orgError
					);
				}

				// Traiter les formations
				if (response.data.builds && response.data.builds.length > 0) {
					// Enrichir les formations avec des détails supplémentaires
					const enrichedTrainings = await Promise.all(
						response.data.builds.map(async (training) => {
							try {
								// Vérifier si l'ID de formation est valide
								if (!training.id) {
									console.warn("Formation sans ID détectée");
									return null;
								}

								// Récupérer les détails de la formation depuis la configuration
								const detailsResponse = await axios.get(
									`${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${training.id}`
								);

								const courseDetails = detailsResponse.data;

								// S'assurer que les propriétés source sont définies correctement
								const sourceInfo = {
									type: "organization",
									organizationId: organizationId, // Utiliser la valeur exacte reçue en paramètre
									name: organizationName || "Organisation",
								};

								console.log(
									`Formation enrichie - ID: ${training.id}, OrgID: ${organizationId}`
								);

								// Fusionner les données
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
									organizationId, // Ajouter explicitement l'ID
									containerName: response.data.containerName, // Stocker également le nom du container
									source: sourceInfo,
								};
							} catch (error) {
								console.warn(
									`Erreur lors de l'enrichissement du cours ${training.id}:`,
									error
								);
								return {
									...training,
									organizationId, // Ajouter explicitement l'ID
									containerName: response.data.containerName,
									// S'assurer que le nom est correctement formaté
									name: training.name || training.id
										.split("-")
										.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
										.join(" "),
									imageUrl:
										training.imageUrl ||
										WISETRAINER_CONFIG.DEFAULT_IMAGE,
									source: {
										type: "organization",
										organizationId, // Utiliser la valeur exacte reçue en paramètre
										name:
											organizationName || "Organisation",
									},
								};
							}
						})
					);

					// Filtrer les éventuelles entrées nulles
					const validTrainings = enrichedTrainings.filter(
						(training) => training !== null
					);
					setOrganizationTrainings(validTrainings);
				} else {
					setOrganizationTrainings([]);
				}

				setOrgContainerName(response.data.containerName);
			} else {
				console.log("Aucune formation trouvée dans l'organisation");
				setOrganizationTrainings([]);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des formations de l'organisation:",
				error
			);
			setError(error);
			setOrganizationTrainings([]);
		} finally {
			setIsLoading(false);
		}
	}, [organizationId]);

	useEffect(() => {
		if (organizationId) {
			fetchOrganizationTrainings();
		} else {
			setIsLoading(false);
		}
	}, [organizationId, fetchOrganizationTrainings]);

	return {
		organizationTrainings,
		containerName: orgContainerName, // Utilisez le nom du container de l'organisation
		isLoading,
		error,
		refresh: fetchOrganizationTrainings, // Exposer la fonction de rafraîchissement
	};
}

export default useTrainingOrganization;
