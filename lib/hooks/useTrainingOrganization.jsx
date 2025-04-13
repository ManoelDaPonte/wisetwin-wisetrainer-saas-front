//lib/hooks/useTrainingOrganization.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export function useTrainingOrganization(organizationId, userId) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [taggedTrainings, setTaggedTrainings] = useState([]);
	const [organizationTrainings, setOrganizationTrainings] = useState([]);
	const [inProgressTrainings, setInProgressTrainings] = useState([]);

	useEffect(() => {
		if (!organizationId || !userId) return;

		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Récupérer les formations en cours pour cet utilisateur
				const userTrainingsResponse = await axios.get(
					`/api/db/wisetrainer/user-trainings/${userId}`
				);

				const userTrainings =
					userTrainingsResponse.data.trainings || [];
				const inProgress = userTrainings.filter(
					(t) =>
						t.progress > 0 &&
						t.progress < 100 &&
						(t.organizationId === organizationId ||
							(t.source &&
								t.source.organizationId === organizationId))
				);
				setInProgressTrainings(inProgress);

				// Récupérer les tags de l'utilisateur pour cette organisation
				const membersResponse = await axios.get(
					`/api/organization/${organizationId}/members-with-tags`
				);

				if (
					membersResponse.data.members &&
					Array.isArray(membersResponse.data.members)
				) {
					// Trouver l'utilisateur actuel
					const currentMember = membersResponse.data.members.find(
						(m) => m.userId === userId
					);

					if (
						currentMember &&
						currentMember.tags &&
						currentMember.tags.length > 0
					) {
						// Pour chaque tag, récupérer les formations associées
						let allTaggedTrainings = [];

						for (const tag of currentMember.tags) {
							try {
								const trainingRes = await axios.get(
									`/api/organization/${organizationId}/tags/${tag.id}/training`
								);

								if (
									trainingRes.data.trainings &&
									Array.isArray(trainingRes.data.trainings)
								) {
									const taggedTrainings =
										trainingRes.data.trainings.map(
											(training) => ({
												...training,
												tagInfo: {
													id: tag.id,
													name: tag.name,
													color: tag.color,
												},
												organizationId: organizationId,
											})
										);

									allTaggedTrainings = [
										...allTaggedTrainings,
										...taggedTrainings,
									];
								}
							} catch (tagError) {
								console.error(
									`Erreur lors de la récupération des formations pour le tag ${tag.id}:`,
									tagError
								);
							}
						}

						setTaggedTrainings(allTaggedTrainings);
					}
				}

				// Récupérer toutes les formations de l'organisation
				const buildsResponse = await axios.get(
					`/api/organization/${organizationId}/builds`
				);

				if (
					buildsResponse.data.builds &&
					Array.isArray(buildsResponse.data.builds)
				) {
					const orgTrainings = buildsResponse.data.builds.map(
						(training) => ({
							...training,
							organizationId: organizationId,
							source: {
								type: "organization",
								organizationId: organizationId,
							},
						})
					);

					setOrganizationTrainings(orgTrainings);
				}
			} catch (error) {
				console.error(
					`Erreur lors de la récupération des données pour l'organisation ${organizationId}:`,
					error
				);
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [organizationId, userId]);

	return {
		isLoading,
		error,
		taggedTrainings,
		organizationTrainings,
		inProgressTrainings,
	};
}
