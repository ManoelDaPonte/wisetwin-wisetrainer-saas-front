//lib/hooks/useTrainingOrganization.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export function useTrainingOrganization(organizationId, userId) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [organizationTrainings, setOrganizationTrainings] = useState([]);
	const [containerName, setContainerName] = useState(null);

	useEffect(() => {
		if (!organizationId || !userId) {
			setIsLoading(false);
			return;
		}

		const fetchOrganizationTrainings = async () => {
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

					// Récupérer l'organisation depuis l'API si nécessaire
					let organizationName = "Organisation";
					let organizationObj = null;
					try {
						const orgResponse = await axios.get(
							`/api/organization/${organizationId}`
						);
						if (orgResponse.data && orgResponse.data.organization) {
							organizationName =
								orgResponse.data.organization.name;
							organizationObj = orgResponse.data.organization;
						}
					} catch (orgError) {
						console.warn(
							"Impossible de récupérer les détails de l'organisation",
							orgError
						);
					}

					// Traiter les formations
					if (
						response.data.builds &&
						response.data.builds.length > 0
					) {
						// Enrichir les formations avec des détails supplémentaires
						const enrichedTrainings = await Promise.all(
							response.data.builds.map(async (training) => {
								try {
									// Récupérer les détails de la formation depuis la configuration
									const detailsResponse = await axios.get(
										`${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${training.id}`
									);

									const courseDetails = detailsResponse.data;

									// Fusionner les données
									return {
										...training,
										name:
											courseDetails.name || training.name,
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
										organizationId,
										containerName:
											response.data.containerName, // Stocker également le nom du container
										source: {
											type: "organization",
											organizationId,
											name: organizationName,
										},
									};
								} catch (error) {
									console.warn(
										`Erreur lors de l'enrichissement du cours ${training.id}:`,
										error
									);
									return {
										...training,
										organizationId,
										containerName:
											response.data.containerName,
										imageUrl:
											training.imageUrl ||
											WISETRAINER_CONFIG.DEFAULT_IMAGE,
										source: {
											type: "organization",
											organizationId,
											name: organizationName,
										},
									};
								}
							})
						);

						setOrganizationTrainings(enrichedTrainings);
					} else {
						setOrganizationTrainings([]);
					}

					setContainerName(response.data.containerName);
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
		};

		fetchOrganizationTrainings();
	}, [organizationId, userId]);

	return {
		organizationTrainings,
		containerName,
		isLoading,
		error,
	};
}

export default useTrainingOrganization;
