//app/(app)/guide/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { Card, CardContent } from "@/components/ui/card";

// Hooks personnalisés
import { useTrainingWiseTwin } from "@/lib/hooks/useTrainingWiseTwin";

// Composants personnalisés
import WelcomeHeader from "@/components/guide/WelcomeHeader";
import OrganizationTrainingPanel from "@/components/guide/OrganizationTrainingPanel";
import NoOrganizationGuide from "@/components/guide/NoOrganizationGuide";
import WiseTwinRecommendations from "@/components/guide/WiseTwinRecommendations";

export default function GuidePage() {
	const router = useRouter();
	const { toast } = useToast();
	const { user, isLoading: userLoading } = useUser();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [isLoading, setIsLoading] = useState(true);
	const [organizations, setOrganizations] = useState([]);
	const [hasOrganizations, setHasOrganizations] = useState(false);
	const [inProgressTrainings, setInProgressTrainings] = useState([]);
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
			console.log("Récupération des organisations...");
			const orgsResponse = await axios.get("/api/organization");
			const userOrgs = orgsResponse.data.organizations || [];
			setOrganizations(userOrgs);
			setHasOrganizations(userOrgs.length > 0);
			console.log("Organisations récupérées:", userOrgs);

			// 2. Récupérer les formations en cours
			console.log("Récupération des formations en cours...");
			const trainingsResponse = await axios.get(
				`/api/db/wisetrainer/user-trainings/${containerName}`
			);
			const userTrainings = trainingsResponse.data.trainings || [];
			const inProgress = userTrainings.filter(
				(t) => t.progress > 0 && t.progress < 100
			);
			setInProgressTrainings(inProgress);
			console.log("Formations en cours:", inProgress);

			// 3. Récupérer les données pour chaque organisation
			const orgData = await Promise.all(
				userOrgs.map(async (org) => {
					try {
						// Récupérer les tags de l'utilisateur pour cette organisation
						const membersResponse = await axios.get(
							`/api/organization/${org.id}/members-with-tags`
						);

						let userTags = [];
						let taggedTrainings = [];

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
											const tagTrainings =
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

											taggedTrainings = [
												...taggedTrainings,
												...tagTrainings,
											];
										}
									} catch (error) {
										console.error(
											`Erreur lors de la récupération des formations pour le tag ${tag.id}:`,
											error
										);
									}
								}
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

						// Filtrer les formations en cours pour cette organisation
						const orgInProgressTrainings = inProgress.filter(
							(t) =>
								t.organizationId === org.id ||
								(t.source && t.source.organizationId === org.id)
						);

						return {
							organization: org,
							userTags,
							taggedTrainings,
							orgTrainings,
							inProgressTrainings: orgInProgressTrainings,
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
							inProgressTrainings: [],
						};
					}
				})
			);

			setOrganizationsData(orgData);
			console.log("Chargement des données terminé avec succès");
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
	if (userLoading || containerLoading || isLoading || wiseTwinLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="flex justify-between items-center mb-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/4"></div>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-6">
					<div className="animate-pulse">
						<div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
					</div>
					<div className="animate-pulse">
						<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
					</div>
				</div>
			</div>
		);
	}

	// Vérifier si nous avons des formations à afficher
	const hasAnyTraining =
		organizationsData.some(
			(org) =>
				org.taggedTrainings.length > 0 ||
				org.orgTrainings.length > 0 ||
				org.inProgressTrainings.length > 0
		) || wiseTwinTrainings.length > 0;

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
				{/* En-tête avec bienvenue et statistiques */}
				<WelcomeHeader
					user={user}
					hasOrganizations={hasOrganizations}
					organizationsCount={organizations.length}
					trainingsInProgressCount={inProgressTrainings.length}
				/>

				{/* Formations de chaque organisation avec un nouveau design */}
				{organizationsData.map((orgData) => (
					<OrganizationTrainingPanel
						key={orgData.organization.id}
						organization={orgData.organization}
						taggedTrainings={orgData.taggedTrainings}
						organizationTrainings={orgData.orgTrainings}
						inProgressTrainings={orgData.inProgressTrainings}
						showAllTrainings={true}
					/>
				))}

				{/* Formations recommandées par WiseTwin */}
				{wiseTwinTrainings.length > 0 && (
					<WiseTwinRecommendations trainings={wiseTwinTrainings} />
				)}

				{/* Si pas d'organisation, afficher un guide spécifique */}
				{!hasOrganizations && <NoOrganizationGuide />}

				{/* Message si aucune formation n'est disponible */}
				{!hasAnyTraining && (
					<div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
						<div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 p-6 mb-4">
							<BookOpen className="w-8 h-8 text-wisetwin-blue" />
						</div>
						<h3 className="text-lg font-medium mb-2">
							Aucune formation trouvée
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
							Aucune formation n'est disponible pour le moment.
							Explorez notre catalogue pour découvrir nos
							programmes.
						</p>
						<Button
							onClick={() => router.push("/wisetrainer")}
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
						>
							Explorer le catalogue
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
