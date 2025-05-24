// components/wisetrainer/WiseTrainerCourses-new.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useUser } from "@/newlib/hooks/useUser";
import { useCourses } from "@/newlib/hooks/useCourses";
import { useOrganization } from "@/newlib/hooks/useOrganization";
import { useOrganizationBuilds } from "@/newlib/hooks/useOrganizationBuilds";
import { useTrainingWiseTwin } from "@/lib/hooks/useTrainingWiseTwin";
import { useToast } from "@/lib/hooks/useToast";

// Import des composants d'onglets
import PersonalCoursesTab from "@/components/wisetrainer/courses/PersonalCoursesTab";
import CatalogOrganizationTab from "@/components/wisetrainer/courses/CatalogOrganizationTab";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

import UnenrollModal from "@/components/wisetrainer/UnenrollModal";

export default function WiseTrainerCourses() {
	const router = useRouter();
	const { user } = useUser();
	const [activeTab, setActiveTab] = useState("personal");
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [showUnenrollModal, setShowUnenrollModal] = useState(false);
	const [courseToUnenroll, setCourseToUnenroll] = useState(null);
	const { toast } = useToast();

	// Récupérer le contexte actif depuis localStorage
	const getActiveContext = () => {
		if (typeof window !== 'undefined') {
			const contextStr = localStorage.getItem('wisetwin-active-context');
			if (contextStr) {
				try {
					const context = JSON.parse(contextStr);
					return context;
				} catch (e) {
					console.error('Erreur parsing contexte:', e);
					return null;
				}
			}
		}
		return null;
	};
	
	const activeContext = getActiveContext();

	// Utiliser les hooks de newlib
	const {
		courses: personalCourses,
		isLoading: isLoadingPersonal,
		refreshCourses: refreshPersonalCourses,
	} = useCourses({ autoLoad: true });

	// Récupérer les organisations de l'utilisateur
	const {
		organizations: userOrganizations,
		isLoading: isLoadingOrgs,
		currentOrganizationId,
	} = useOrganization({ autoLoad: true });

	// Utiliser le hook pour les formations d'organisation (contexte actif)
	const { 
		trainings: organizationTrainings, 
		isLoading: isLoadingOrg 
	} = useOrganizationBuilds({
		organizationId: activeContext?.type === 'organization' ? (activeContext.id || currentOrganizationId) : null,
		type: 'wisetrainer',
		autoLoad: activeContext?.type === 'organization'
	});

	// Hook pour récupérer les formations du container personnel (depuis le container source WiseTwin)
	const {
		trainings: personalCatalogTrainings,
		isLoading: isLoadingPersonalCatalog,
		error: personalCatalogError
	} = useTrainingWiseTwin(user?.id);

	// Configuration pour les animations
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.5 },
		},
	};


	// Fonction pour gérer la désinscription avec modale
	const handleUnenroll = (course) => {
		setCourseToUnenroll(course);
		setShowUnenrollModal(true);
	};


	// Nouvelle logique pour démarrer directement une formation
	const handleStartCourse = async (course) => {
		if (!user?.azureContainer) {
			toast({
				title: "Erreur d'accès",
				description:
					"Impossible d'accéder aux formations. Veuillez vous reconnecter.",
				variant: "destructive",
			});
			return;
		}

		try {
			console.log("INFO INSCRIPTION - Démarrage de la formation:", {
				courseId: course.id,
				sourceType: course.source?.type || "organization",
				sourceOrganizationId: course.source?.organizationId || null,
				sourceName: course.source?.name || "Organisation",
				compositeId: course.compositeId || `${course.id}__unknown`,
			});

			// Inscription de l'utilisateur à la formation
			const response = await axios.post(
				`${WISETRAINER_CONFIG.API_ROUTES.ENROLL_COURSE}`,
				{
					userId: user.id,
					courseId: course.id,
					sourceType: course.source?.type || "organization",
					sourceOrganizationId: course.source?.organizationId || null,
					sourceContainerName: course.source?.containerName || null,
				}
			);

			console.log(
				"INFO INSCRIPTION - Réponse d'inscription:",
				response.data
			);

			if (response.data.success) {
				// Redirection vers la page du cours (sans organizationId dans l'URL)
				console.log("Redirection vers le cours:", {
					courseId: course.id,
					context: activeContext,
				});
				router.push(`/wisetrainer/${course.id}`);

				// Rafraîchir la liste des formations personnelles
				await refreshPersonalCourses();

				toast({
					title: "Formation ajoutée",
					description:
						'Vous pouvez maintenant accéder à cette formation depuis "Mes Formations"',
					variant: "success",
				});
			} else {
				throw new Error(
					response.data.error ||
						"Échec de l'inscription à la formation"
				);
			}
		} catch (error) {
			console.error(
				"Erreur lors de l'inscription à la formation:",
				error
			);
			toast({
				title: "Erreur",
				description:
					"Impossible d'ajouter cette formation. Veuillez réessayer.",
				variant: "destructive",
			});
		}
	};

	// Fonction pour gérer la sélection d'un cours
	const handleCourseSelect = (course) => {
		// Rediriger vers la page du cours (sans organizationId dans l'URL)
		router.push(`/wisetrainer/${course.id}`);
	};

	// Fonction pour se désinscrire d'une formation
	const confirmUnenroll = async () => {
		if (!courseToUnenroll) return;

		try {
			// 1. Appel API pour supprimer l'inscription de la base de données
			const dbResponse = await axios.delete(
				`${
					WISETRAINER_CONFIG.API_ROUTES.UNENROLL_COURSE
				}/${user.id}/${courseToUnenroll.id}?sourceType=${
					courseToUnenroll.source?.type || "organization"
				}&sourceOrganizationId=${
					courseToUnenroll.source?.organizationId || ""
				}`
			);

			// Plus besoin de supprimer les fichiers Azure car on ne copie plus

			if (dbResponse.data.success) {
				// Rafraîchir la liste des formations personnelles
				await refreshPersonalCourses();

				toast({
					title: "Formation supprimée",
					description: `"${courseToUnenroll.name}" a été supprimée de votre liste. Vous pouvez la réajouter à tout moment depuis le catalogue.`,
					variant: "success",
				});
			} else {
				throw new Error(
					dbResponse.data.error || "Échec de la suppression"
				);
			}
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast({
				title: "Échec de la suppression",
				description: "Une erreur est survenue. Veuillez réessayer.",
				variant: "destructive",
			});
		} finally {
			// Fermer la modale
			setShowUnenrollModal(false);
			setCourseToUnenroll(null);
		}
	};

	// Fonction pour fermer la modale
	const closeUnenrollModal = () => {
		setShowUnenrollModal(false);
		setCourseToUnenroll(null);
	};

	const toggleCardFlip = (courseId) => {
		setFlippedCardId(flippedCardId === courseId ? null : courseId);
	};

	const isUserEnrolled = (course, personalCourses) => {
		// Si aucune formation personnelle, retourne false
		if (!personalCourses || personalCourses.length === 0) {
			return false;
		}

		// Récupérer les informations de source du cours
		const sourceType = course.source?.type || "organization";
		const orgId = course.source?.organizationId || null;

		// Vérifier si le cours existe déjà dans les formations personnelles
		return personalCourses.some((personalCourse) => {
			const personalSourceType =
				personalCourse.source?.type || "organization";
			const personalOrgId = personalCourse.source?.organizationId || null;

			// Vérifier l'ID du cours ET sa source
			return (
				personalCourse.id === course.id &&
				personalSourceType === sourceType &&
				// Si les deux sont null, c'est égal. Sinon, comparer les valeurs
				((personalOrgId === null && orgId === null) ||
					personalOrgId === orgId)
			);
		});
	};

	return (
		<div className="container mx-auto">
			<Tabs
				defaultValue="personal"
				className="w-full"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-8">
					<TabsTrigger value="personal" className="px-6">
						Mes Formations
					</TabsTrigger>
					<TabsTrigger value="organization" className="px-6">
						Catalogue de formations
					</TabsTrigger>
				</TabsList>

				<TabsContent value="personal">
					<PersonalCoursesTab
						isLoading={isLoadingPersonal}
						courses={personalCourses}
						onCourseSelect={handleCourseSelect}
						onUnenroll={handleUnenroll}
						onBrowseCatalog={() => setActiveTab("organization")}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="organization">
					{activeContext?.type === 'personal' ? (
						// Mode personnel : afficher les formations du catalogue WiseTwin
						<CatalogOrganizationTab
							organizations={[]}
							selectedOrganizationId={null}
							trainings={(personalCatalogTrainings || []).map(
								(training) => {
									return {
										...training,
										// Préserver le nom de la formation
										name:
											training.name ||
											training.id
												.split("-")
												.map(
													(word) =>
														word
															.charAt(0)
															.toUpperCase() +
														word.slice(1)
												)
												.join(" "),
										compositeId: `${training.id}__personal__${user?.id}`,
										source: {
											type: "personal",
											name: "Catalogue personnel",
											organizationId: null,
											containerName: user?.azureContainer || null,
										},
									};
								}
							)}
							isLoading={isLoadingPersonalCatalog}
							onCourseSelect={handleCourseSelect}
							onEnroll={handleStartCourse}
							onToggleInfo={toggleCardFlip}
							flippedCardId={flippedCardId}
							personalCourses={personalCourses}
							containerVariants={containerVariants}
							itemVariants={itemVariants}
							isUserEnrolled={isUserEnrolled}
						/>
					) : activeContext?.type === 'organization' ? (
						// Mode organisation : afficher les formations de l'organisation
						<CatalogOrganizationTab
							organizations={userOrganizations}
							selectedOrganizationId={activeContext.id}
							trainings={(organizationTrainings || []).map(
								(training) => {
									// S'assurer que chaque formation a les informations de source complètes
									const selectedOrg = userOrganizations.find(
										(org) => org.id === activeContext.id
									);
									return {
										...training,
										// Préserver le nom de la formation
										name:
											training.name ||
											training.id
												.split("-")
												.map(
													(word) =>
														word
															.charAt(0)
															.toUpperCase() +
														word.slice(1)
												)
												.join(" "),
										compositeId: `${training.id}__organization__${activeContext.id}`,
										source: {
											type: "organization",
											name:
												selectedOrg?.name || activeContext.name || "Organisation",
											organizationId: activeContext.id,
											containerName:
												selectedOrg?.azureContainer || activeContext.azureContainer || null,
										},
									};
								}
							)}
							isLoading={isLoadingOrgs || isLoadingOrg}
							onCourseSelect={handleCourseSelect}
							onEnroll={handleStartCourse}
							onToggleInfo={toggleCardFlip}
							flippedCardId={flippedCardId}
							personalCourses={personalCourses}
							containerVariants={containerVariants}
							itemVariants={itemVariants}
							isUserEnrolled={isUserEnrolled} // Passer la fonction de vérification
						/>
					) : (
						// Aucun contexte défini
						<div className="text-center py-12">
							<p className="text-gray-600 dark:text-gray-400 mb-4">
								Veuillez sélectionner un contexte (personnel ou organisation) dans la barre latérale.
							</p>
						</div>
					)}
				</TabsContent>
			</Tabs>

			{/* Ajouter la modale à la fin du composant */}
			<UnenrollModal
				isOpen={showUnenrollModal}
				onClose={closeUnenrollModal}
				onConfirm={confirmUnenroll}
				courseName={courseToUnenroll?.name || ""}
			/>
		</div>
	);
}