//lib/hooks/useWiseTwinOrganization.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

export function useWiseTwinOrganization(organizationId, userId) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [organizationBuilds, setOrganizationBuilds] = useState([]);
	const [containerName, setContainerName] = useState(null);

	useEffect(() => {
		if (!organizationId || !userId) {
			setIsLoading(false);
			return;
		}

		const fetchOrganizationBuilds = async () => {
			setIsLoading(true);
			try {
				console.log(
					`Récupération des environnements 3D pour l'organisation ${organizationId}`
				);
				const response = await axios.get(
					`/api/organization/${organizationId}/wisetwin-builds`
				);

				if (response.data) {
					console.log(
						`${
							response.data.builds?.length || 0
						} environnements 3D trouvés dans l'organisation`
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

					// Traiter les builds
					if (
						response.data.builds &&
						response.data.builds.length > 0
					) {
						// Enrichir les builds avec des détails supplémentaires
						const enrichedBuilds = await Promise.all(
							response.data.builds.map(async (build) => {
								try {
									// Récupérer les détails du build depuis la configuration
									const detailsResponse = await axios
										.get(
											`${WISETWIN_CONFIG.API_ROUTES.BUILD_DETAILS}/${build.id}`
										)
										.catch(() => ({ data: null }));

									const buildDetails = detailsResponse.data;

									// Fusionner les données
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
										`Erreur lors de l'enrichissement du build ${build.id}:`,
										error
									);
									return {
										...build,
										organizationId,
										containerName:
											response.data.containerName,
										imageUrl:
											build.imageUrl ||
											WISETWIN_CONFIG.DEFAULT_IMAGE,
										source: {
											type: "organization",
											organizationId,
											name: organizationName,
										},
									};
								}
							})
						);

						setOrganizationBuilds(enrichedBuilds);
					} else {
						setOrganizationBuilds([]);
					}

					setContainerName(response.data.containerName);
				} else {
					console.log(
						"Aucun environnement 3D trouvé dans l'organisation"
					);
					setOrganizationBuilds([]);
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des environnements 3D de l'organisation:",
					error
				);
				setError(error);
				setOrganizationBuilds([]);
			} finally {
				setIsLoading(false);
			}
		};

		fetchOrganizationBuilds();
	}, [organizationId, userId]);

	return {
		organizationBuilds,
		containerName,
		isLoading,
		error,
	};
}

export default useWiseTwinOrganization;
