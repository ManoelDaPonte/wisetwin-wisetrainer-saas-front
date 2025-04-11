"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/useToast";
import { Card, CardContent } from "@/components/ui/card";

// Composants personnalisés
import WelcomeHeader from "@/components/guide/WelcomeHeader";
import OrganizationTrainingPanel from "@/components/guide/OrganizationTrainingPanel";
import NoOrganizationGuide from "@/components/guide/NoOrganizationGuide";
import NextStepsPanel from "@/components/guide/NextStepsPanel";
import TagBasedRecommendations from "@/components/guide/TagBasedRecommendations";

export default function GuidePage() {
	const router = useRouter();
	const { toast } = useToast();
	const { user, isLoading: userLoading } = useUser();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [isLoading, setIsLoading] = useState(true);
	const [organizations, setOrganizations] = useState([]);
	const [hasOrganizations, setHasOrganizations] = useState(false);
	const [inProgressTrainings, setInProgressTrainings] = useState([]);
	const [userTagsWithOrgs, setUserTagsWithOrgs] = useState([]);
	const [taggedTrainings, setTaggedTrainings] = useState([]);
	const [organizationTrainings, setOrganizationTrainings] = useState([]);

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

			// 3. Si l'utilisateur a des organisations, récupérer toutes les formations et les tags
			let allUserTags = [];
			let allTaggedTrainings = [];
			let allOrgTrainings = [];

			if (userOrgs.length > 0) {
				// Récupérer les tags de l'utilisateur pour chaque organisation
				for (const org of userOrgs) {
					try {
						// a) Récupérer tous les membres de l'organisation avec leurs tags
						const res = await axios.get(
							`/api/organization/${org.id}/members-with-tags`
						);

						if (
							res.data.members &&
							Array.isArray(res.data.members)
						) {
							// Trouver l'utilisateur actuel dans la liste des membres
							const userEmail = user.email || user.name;
							const currentUser = res.data.members.find(
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
								// Ajouter l'info de l'organisation à chaque tag
								const userTags = currentUser.tags.map(
									(tag) => ({
										...tag,
										organizationName: org.name,
										organizationId: org.id,
									})
								);

								allUserTags = [...allUserTags, ...userTags];

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
											const taggedTrainings =
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
												...taggedTrainings,
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

						// b) Récupérer toutes les formations de l'organisation
						const buildsRes = await axios.get(
							`/api/organization/${org.id}/builds`
						);

						if (
							buildsRes.data.builds &&
							Array.isArray(buildsRes.data.builds)
						) {
							const orgTrainings = buildsRes.data.builds.map(
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

							allOrgTrainings = [
								...allOrgTrainings,
								...orgTrainings,
							];
						}
					} catch (error) {
						console.error(
							`Erreur lors de la récupération des données pour l'organisation ${org.id}:`,
							error
						);
					}
				}
			}

			// Mettre à jour l'état avec les données récupérées
			setUserTagsWithOrgs(allUserTags);
			setTaggedTrainings(allTaggedTrainings);
			setOrganizationTrainings(allOrgTrainings);

			console.log("Chargement des données terminé avec succès");
			console.log("État final:", {
				organizations: userOrgs,
				userTags: allUserTags,
				taggedTrainings: allTaggedTrainings,
				organizationTrainings: allOrgTrainings,
				inProgressTrainings: inProgress,
			});
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
	if (userLoading || containerLoading || isLoading) {
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

				{/* Recommandations basées sur les tags de l'utilisateur */}
				{userTagsWithOrgs.length > 0 && taggedTrainings.length > 0 && (
					<TagBasedRecommendations
						userTags={userTagsWithOrgs}
						taggedTrainings={taggedTrainings}
					/>
				)}

				{userTagsWithOrgs.length > 0 &&
					taggedTrainings.length === 0 && (
						<Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
							<CardContent className="py-4">
								<p className="text-amber-800 dark:text-amber-200">
									Vous avez {userTagsWithOrgs.length} tag(s)
									attribué(s), mais aucune formation associée
									n'a été trouvée. Demandez à votre
									administrateur d'associer des formations à
									vos tags.
								</p>
							</CardContent>
						</Card>
					)}

				{/* Formations de chaque organisation */}
				{hasOrganizations &&
					organizations.map((org) => (
						<OrganizationTrainingPanel
							key={org.id}
							organization={org}
							taggedTrainings={taggedTrainings.filter(
								(t) => t.organizationId === org.id
							)}
							organizationTrainings={organizationTrainings.filter(
								(t) => t.organizationId === org.id
							)}
							inProgressTrainings={inProgressTrainings}
							showAllTrainings={true}
						/>
					))}

				{/* Si pas d'organisation, afficher un guide spécifique */}
				{!hasOrganizations && <NoOrganizationGuide />}

				{/* Panneau de prochaines étapes */}
				<NextStepsPanel />

				{/* Message si aucune formation n'est disponible */}
				{!isLoading &&
					inProgressTrainings.length === 0 &&
					taggedTrainings.length === 0 &&
					organizationTrainings.length === 0 && (
						<div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
							<div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 p-6 mb-4">
								<BookOpen className="w-8 h-8 text-wisetwin-blue" />
							</div>
							<h3 className="text-lg font-medium mb-2">
								Aucune formation trouvée
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
								Aucune formation n'est disponible pour le
								moment. Explorez notre catalogue pour découvrir
								nos programmes.
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
