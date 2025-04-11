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
import { useToast } from "@/lib/hooks/useToast";

// Composants personnalisés
import WelcomeHeader from "@/components/guide/WelcomeHeader";
import OrganizationTrainingPanel from "@/components/guide/OrganizationTrainingPanel";
import NoOrganizationGuide from "@/components/guide/NoOrganizationGuide";
import RecommendedTrainings from "@/components/guide/RecommendedTrainings";
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
	const [recommendedTrainings, setRecommendedTrainings] = useState([]);
	const [userTagsWithOrgs, setUserTagsWithOrgs] = useState([]);
	const [taggedTrainings, setTaggedTrainings] = useState([]);
	const [debug, setDebug] = useState({});

	// Charger les données utilisateur
	useEffect(() => {
		if (user && containerName && !containerLoading && !userLoading) {
			loadUserData();
		}
	}, [user, containerName, containerLoading, userLoading]);

	const loadUserData = async () => {
		setIsLoading(true);
		const debugInfo = {};

		try {
			// 1. Récupérer les organisations de l'utilisateur
			console.log("Récupération des organisations...");
			const orgsResponse = await axios.get("/api/organization");
			const userOrgs = orgsResponse.data.organizations || [];
			setOrganizations(userOrgs);
			setHasOrganizations(userOrgs.length > 0);
			debugInfo.organizations = userOrgs;
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
			debugInfo.inProgressTrainings = inProgress;
			console.log("Formations en cours:", inProgress);

			// 3. Si l'utilisateur a des organisations, récupérer ses tags et formations associées
			let allUserTags = [];
			let allTaggedTrainings = [];

			if (userOrgs.length > 0) {
				console.log(
					`Récupération des tags pour ${userOrgs.length} organisation(s)...`
				);

				// Récupérer les tags de l'utilisateur pour chaque organisation
				for (const org of userOrgs) {
					try {
						console.log(
							`Récupération des tags pour l'organisation ${org.id} (${org.name})...`
						);
						const res = await axios.get(
							`/api/organization/${org.id}/members-with-tags`
						);
						console.log(`Réponse pour l'org ${org.id}:`, res.data);

						// CORRECTION: Vérifier si members est un tableau et est disponible
						if (
							!res.data.members ||
							!Array.isArray(res.data.members)
						) {
							console.warn(
								`Pas de membre trouvé pour l'org ${org.id}`
							);
							continue;
						}

						// CORRECTION: Comparer à la fois par email et éventuellement par ID
						// Note: l'objet user peut avoir auth0 email ou email selon la configuration
						const userEmail = user.email || user.name; // Auth0 met parfois l'email dans le champ name

						console.log(
							`Recherche de l'utilisateur avec email: ${userEmail}`
						);

						// Recherche de l'utilisateur par email
						const currentUser = res.data.members.find(
							(m) =>
								(m.email &&
									m.email.toLowerCase() ===
										userEmail.toLowerCase()) ||
								(m.name &&
									m.name.toLowerCase() ===
										userEmail.toLowerCase())
						);

						if (currentUser) {
							console.log(
								`Utilisateur trouvé dans l'org:`,
								currentUser
							);

							// Vérifier si l'utilisateur a des tags
							if (
								currentUser.tags &&
								Array.isArray(currentUser.tags) &&
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

								console.log(
									`Tags trouvés pour l'utilisateur dans l'org ${org.id}:`,
									userTags
								);
								allUserTags = [...allUserTags, ...userTags];

								// Pour chaque tag, récupérer les formations associées
								for (const tag of userTags) {
									try {
										console.log(
											`Récupération des formations pour le tag ${tag.id} (${tag.name})...`
										);
										const trainingRes = await axios.get(
											`/api/organization/${org.id}/tags/${tag.id}/training`
										);

										console.log(
											`Formations trouvées pour le tag ${tag.id}:`,
											trainingRes.data
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

											if (taggedTrainings.length > 0) {
												console.log(
													`${taggedTrainings.length} formations trouvées pour le tag ${tag.id}`
												);
												allTaggedTrainings = [
													...allTaggedTrainings,
													...taggedTrainings,
												];
											} else {
												console.log(
													`Aucune formation trouvée pour le tag ${tag.id}`
												);
											}
										}
									} catch (error) {
										console.error(
											`Erreur lors de la récupération des formations pour le tag ${tag.id}:`,
											error
										);
									}
								}
							} else {
								console.log(
									`Aucun tag trouvé pour l'utilisateur dans l'org ${org.id}`
								);
							}
						} else {
							console.warn(
								`Utilisateur avec email ${userEmail} non trouvé dans l'org ${org.id}`
							);

							// Afficher les emails disponibles pour aider au débogage
							const availableEmails = res.data.members.map(
								(m) => m.email || m.name
							);
							console.log(
								`Emails disponibles dans cette organisation:`,
								availableEmails
							);
						}
					} catch (error) {
						console.error(
							`Erreur lors de la récupération des tags pour l'organisation ${org.id}:`,
							error
						);
					}
				}
			}

			console.log("Tous les tags de l'utilisateur:", allUserTags);
			console.log(
				"Toutes les formations associées aux tags:",
				allTaggedTrainings
			);

			setUserTagsWithOrgs(allUserTags);
			setTaggedTrainings(allTaggedTrainings);
			debugInfo.userTags = allUserTags;
			debugInfo.taggedTrainings = allTaggedTrainings;

			// 4. Recommandations générales
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
			debugInfo.recommendedTrainings = generalRecommendations;

			// Mettre à jour les informations de débogage
			setDebug(debugInfo);

			console.log("Chargement des données terminé avec succès");
			console.log("État final:", {
				organizations: userOrgs,
				userTags: allUserTags,
				taggedTrainings: allTaggedTrainings,
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
			debugInfo.error = error.message;
			setDebug(debugInfo);
		} finally {
			setIsLoading(false);
		}
	};

	// Reste du code inchangé...

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

	// Afficher des informations de débogage en mode développement
	const showDebugInfo = process.env.NODE_ENV === "development";

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

			{/* Informations de débogage en mode développement */}
			{showDebugInfo && (
				<div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
					<details>
						<summary className="font-semibold cursor-pointer">
							Informations de débogage
						</summary>
						<div className="mt-2 space-y-2">
							<div>
								<strong>User Email:</strong>{" "}
								{user?.email || user?.name}
							</div>
							<div>
								<strong>Container:</strong> {containerName}
							</div>
							<div>
								<strong>Organizations:</strong>{" "}
								{organizations.length}
							</div>
							<div>
								<strong>Has Tags:</strong>{" "}
								{userTagsWithOrgs.length > 0 ? "Oui" : "Non"}
							</div>
							<div>
								<strong>Tagged Trainings:</strong>{" "}
								{taggedTrainings.length}
							</div>
							<pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-auto max-h-64 text-xs">
								{JSON.stringify(debug, null, 2)}
							</pre>
						</div>
					</details>
				</div>
			)}

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

				{/* Formations en cours par organisation */}
				{hasOrganizations &&
					organizations.map((org) => (
						<OrganizationTrainingPanel
							key={org.id}
							organization={org}
							taggedTrainings={taggedTrainings.filter(
								(t) => t.organizationId === org.id
							)}
							inProgressTrainings={inProgressTrainings}
						/>
					))}

				{/* Si pas d'organisation, afficher un guide spécifique */}
				{!hasOrganizations && <NoOrganizationGuide />}

				{/* Recommandations générales si peu de formations associées à des tags */}
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
