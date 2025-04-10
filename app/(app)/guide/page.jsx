//app/(app)/guide/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Composants personnalisés
import WelcomeHeader from "@/components/guide/WelcomeHeader";
import OrganizationTrainingPanel from "@/components/guide/OrganizationTrainingPanel";
import NoOrganizationGuide from "@/components/guide/NoOrganizationGuide";
import RecommendedTrainings from "@/components/guide/RecommendedTrainings";
import NextStepsPanel from "@/components/guide/NextStepsPanel";

export default function GuidePage() {
	const router = useRouter();
	const { user, isLoading: userLoading } = useUser();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [isLoading, setIsLoading] = useState(true);
	const [organizations, setOrganizations] = useState([]);
	const [hasOrganizations, setHasOrganizations] = useState(false);
	const [inProgressTrainings, setInProgressTrainings] = useState([]);
	const [recommendedTrainings, setRecommendedTrainings] = useState([]);
	const [taggedTrainings, setTaggedTrainings] = useState([]);

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
			setOrganizations(userOrgs);
			setHasOrganizations(userOrgs.length > 0);

			// 2. Récupérer les formations en cours
			const trainingsResponse = await axios.get(
				`/api/db/wisetrainer/user-trainings/${containerName}`
			);
			const userTrainings = trainingsResponse.data.trainings || [];
			const inProgress = userTrainings.filter(
				(t) => t.progress > 0 && t.progress < 100
			);
			setInProgressTrainings(inProgress);

			// 3. Si l'utilisateur a des organisations, récupérer les formations recommandées par tags
			if (userOrgs.length > 0) {
				// Récupérer d'abord les tags de l'utilisateur
				const userTagsPromises = userOrgs.map((org) =>
					axios
						.get(`/api/organization/${org.id}/members-with-tags`)
						.then((res) => {
							const currentUser = res.data.members.find(
								(m) => m.email === user.email
							);
							return currentUser?.tags || [];
						})
				);

				const orgTagsResults = await Promise.all(userTagsPromises);
				// Fusionner tous les tags
				const userTags = [].concat(...orgTagsResults);

				// Si l'utilisateur a des tags, récupérer les formations associées à ces tags
				if (userTags.length > 0) {
					const taggedTrainingsPromises = userTags.map((tag) =>
						axios
							.get(
								`/api/organization/${tag.organizationId}/tags/${tag.id}/trainings`
							)
							.then((res) => {
								return (res.data.trainings || []).map(
									(training) => ({
										...training,
										tagInfo: {
											id: tag.id,
											name: tag.name,
											color: tag.color,
											organizationId: tag.organizationId,
										},
										organizationName:
											userOrgs.find(
												(o) =>
													o.id === tag.organizationId
											)?.name || "Organisation",
									})
								);
							})
					);

					const taggedTrainingsResults = await Promise.all(
						taggedTrainingsPromises
					);
					// Fusionner et dédoublonner les formations
					const allTaggedTrainings = [].concat(
						...taggedTrainingsResults
					);
					const uniqueTaggedTrainings = [];
					const trainingIds = new Set();

					allTaggedTrainings.forEach((training) => {
						if (!trainingIds.has(training.id)) {
							trainingIds.add(training.id);
							uniqueTaggedTrainings.push(training);
						}
					});

					setTaggedTrainings(uniqueTaggedTrainings);
				}
			}

			// 4. Recommandations générales (à compléter avec une vraie logique d'IA plus tard)
			const generalRecommendations = [
				{
					id: "LOTO_Maintenance",
					name: "Accès à la zone robotisée pour maintenance",
					description:
						"Formation sur les procédures de sécurité pour l'accès aux zones robotisées",
					imageUrl: "/images/png/wisetrainer-02.png",
					progress: 0,
					source: { type: "wisetwin", name: "WiseTwin" },
				},
				{
					id: "WiseTrainer_01",
					name: "Sécurité industrielle et prévention des risques",
					description:
						"Formation sur les fondamentaux de la sécurité et les bonnes pratiques en environnement industriel",
					imageUrl: "/images/png/wisetrainer-01.png",
					progress: 0,
					source: { type: "wisetwin", name: "WiseTwin" },
				},
			];

			setRecommendedTrainings(generalRecommendations);
		} catch (error) {
			console.error(
				"Erreur lors du chargement des données utilisateur:",
				error
			);
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

				{/* Pour chaque organisation, afficher les formations taguées et en cours */}
				{hasOrganizations &&
					organizations.map((org) => (
						<OrganizationTrainingPanel
							key={org.id}
							organization={org}
							taggedTrainings={taggedTrainings}
							inProgressTrainings={inProgressTrainings}
						/>
					))}

				{/* Si pas d'organisation, afficher un guide spécifique */}
				{!hasOrganizations && <NoOrganizationGuide />}

				{/* Recommandations générales si peu de formations associées à des organisations */}
				{(!hasOrganizations || taggedTrainings.length < 2) && (
					<RecommendedTrainings
						recommendedTrainings={recommendedTrainings}
					/>
				)}

				{/* Panneau de prochaines étapes */}
				<NextStepsPanel />

				{/* Message si aucune formation n'est disponible */}
				{!isLoading &&
					inProgressTrainings.length === 0 &&
					taggedTrainings.length === 0 &&
					recommendedTrainings.length === 0 && (
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
