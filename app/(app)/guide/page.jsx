"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { useToast } from "@/lib/hooks/useToast";

// Hooks personnalisés
import { useTrainingWiseTwin } from "@/lib/hooks/useTrainingWiseTwin";
import { useCurrentTraining } from "@/lib/hooks/useCurrentTraining";

// Composants personnalisés
import NoOrganizationGuide from "@/components/guide/NoOrganizationGuide";
import WiseTwinRecommendations from "@/components/guide/WiseTwinRecommendations";
import CurrentTrainingsPanel from "@/components/guide/CurrentTrainingsPanel";
import OrganizationsSection from "@/components/guide/OrganizationsSection";
import NoTrainingsMessage from "@/components/guide/NoTrainingsMessage";
import LoadingState from "@/components/guide/LoadingState";

export default function GuidePage() {
	const { toast } = useToast();
	const { user, isLoading: userLoading } = useUser();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const { currentTrainings, isLoading: currentTrainingsLoading } =
		useCurrentTraining();

	const [isLoading, setIsLoading] = useState(true);
	const [hasOrganizations, setHasOrganizations] = useState(false);
	const [organizationsData, setOrganizationsData] = useState([]);

	// Utiliser le hook pour les formations WiseTwin
	const { trainings: wiseTwinTrainings, isLoading: wiseTwinLoading } =
		useTrainingWiseTwin(containerName);

	// Charger les données utilisateur
	useEffect(() => {
		if (user && containerName && !containerLoading && !userLoading) {
			loadUserData();
		}
	}, [user, containerName, containerLoading, userLoading]);

	const loadUserData = async () => {
		setIsLoading(true);

		try {
			// 1. Récupérer les organisations de l'utilisateur
			const orgsResponse = await axios.get("/api/organization");
			const userOrgs = orgsResponse.data.organizations || [];
			setHasOrganizations(userOrgs.length > 0);

			// 2. Récupérer les données pour chaque organisation
			const orgData = await Promise.all(
				userOrgs.map(async (org) => {
					try {
						// Récupérer les tags de l'utilisateur pour cette organisation
						const membersResponse = await axios.get(
							`/api/organization/${org.id}/members-with-tags`
						);

						let userTags = [];
						let taggedTrainings = [];
						let allTaggedTrainings = [];
						let hasCompletedTaggedTrainings = false;

						if (
							membersResponse.data.members &&
							Array.isArray(membersResponse.data.members)
						) {
							// Trouver l'utilisateur actuel
							const userEmail = user.email || user.name;
							const currentUser =
								membersResponse.data.members.find(
									(m) =>
										(m.email &&
											m.email.toLowerCase() ===
												userEmail.toLowerCase()) ||
										(m.name &&
											m.name.toLowerCase() ===
												userEmail.toLowerCase())
								);

							if (
								currentUser &&
								currentUser.tags &&
								currentUser.tags.length > 0
							) {
								userTags = currentUser.tags.map((tag) => ({
									...tag,
									organizationName: org.name,
									organizationId: org.id,
								}));

								// Pour chaque tag, récupérer les formations associées
								for (const tag of userTags) {
									try {
										const trainingRes = await axios.get(
											`/api/organization/${org.id}/tags/${tag.id}/training`
										);

										if (
											trainingRes.data.trainings &&
											Array.isArray(
												trainingRes.data.trainings
											)
										) {
											// Toutes les formations taguées (complétées ou non)
											const allTagged =
												trainingRes.data.trainings.map(
													(training) => ({
														...training,
														tagInfo: {
															id: tag.id,
															name: tag.name,
															color: tag.color,
														},
														organizationId: org.id,
														organizationName:
															org.name,
													})
												);

											allTaggedTrainings = [
												...allTaggedTrainings,
												...allTagged,
											];

											// Filtrer pour garder uniquement les formations non complétées (progress < 100)
											const incompleteTrainings =
												allTagged.filter(
													(training) =>
														training.progress ===
															undefined ||
														training.progress < 100
												);

											taggedTrainings = [
												...taggedTrainings,
												...incompleteTrainings,
											];
										}
									} catch (error) {
										console.error(
											`Erreur lors de la récupération des formations pour le tag ${tag.id}:`,
											error
										);
									}
								}

								// Si nous avons des formations taguées au total mais aucune incomplète,
								// cela signifie que toutes ont été complétées
								hasCompletedTaggedTrainings =
									allTaggedTrainings.length > 0 &&
									taggedTrainings.length === 0;
							}
						}

						// Récupérer toutes les formations de l'organisation
						const buildsRes = await axios.get(
							`/api/organization/${org.id}/builds`
						);

						let orgTrainings = [];

						if (
							buildsRes.data.builds &&
							Array.isArray(buildsRes.data.builds)
						) {
							orgTrainings = buildsRes.data.builds.map(
								(training) => ({
									...training,
									organizationId: org.id,
									organizationName: org.name,
									source: {
										type: "organization",
										name: org.name,
										organizationId: org.id,
									},
								})
							);
						}

						return {
							organization: org,
							userTags,
							taggedTrainings,
							orgTrainings,
							hasCompletedTaggedTrainings,
						};
					} catch (error) {
						console.error(
							`Erreur lors de la récupération des données pour l'organisation ${org.id}:`,
							error
						);
						return {
							organization: org,
							userTags: [],
							taggedTrainings: [],
							orgTrainings: [],
							hasCompletedTaggedTrainings: false,
						};
					}
				})
			);

			setOrganizationsData(orgData);
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données utilisateur:",
				error
			);
			toast({
				title: "Erreur",
				description:
					"Une erreur est survenue lors du chargement des données",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Affichage pendant le chargement
	if (
		userLoading ||
		containerLoading ||
		isLoading ||
		wiseTwinLoading ||
		currentTrainingsLoading
	) {
		return <LoadingState />;
	}

	// Vérifier si nous avons des formations à afficher
	const hasAnyTraining =
		organizationsData.some(
			(org) =>
				org.taggedTrainings.length > 0 || org.orgTrainings.length > 0
		) ||
		wiseTwinTrainings.length > 0 ||
		currentTrainings.length > 0;

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
					Guide de démarrage
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					Bienvenue sur WiseTwin. Voici les prochaines étapes pour
					votre parcours de formation.
				</p>
			</div>

			<div className="space-y-6">
				{/* 1. Formations en cours */}
				<CurrentTrainingsPanel
					trainings={currentTrainings}
					isLoading={currentTrainingsLoading}
				/>

				{/* 2. Organisations avec leurs formations */}
				<OrganizationsSection organizationsData={organizationsData} />

				{/* 4. Formations recommandées par WiseTwin */}
				{wiseTwinTrainings.length > 0 && (
					<WiseTwinRecommendations trainings={wiseTwinTrainings} />
				)}

				{/* Si pas d'organisation, afficher un guide spécifique */}
				{!hasOrganizations && <NoOrganizationGuide />}

				{/* Message si aucune formation n'est disponible */}
				{!hasAnyTraining && <NoTrainingsMessage />}
			</div>
		</div>
	);
}
