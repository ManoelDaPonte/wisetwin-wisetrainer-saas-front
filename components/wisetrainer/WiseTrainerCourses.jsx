// components/wisetrainer/WiseTrainerCourses.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { useToast } from "@/lib/hooks/useToast";

// Import des hooks personnalisés
import { useTrainingOrganization } from "@/lib/hooks/useTrainingOrganization";
import { useCurrentTraining } from "@/lib/hooks/useCurrentTraining";

// Import des composants d'onglets
import PersonalCoursesTab from "@/components/wisetrainer/courses/PersonalCoursesTab";
import CatalogOrganizationTab from "@/components/wisetrainer/courses/CatalogOrganizationTab";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

import UnenrollModal from "@/components/wisetrainer/UnenrollModal";

export default function WiseTrainerCourses() {
	const router = useRouter();
	const { containerName } = useAzureContainer();
	const [activeTab, setActiveTab] = useState("personal");
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [selectedOrgId, setSelectedOrgId] = useState(null);
	const [showUnenrollModal, setShowUnenrollModal] = useState(false);
	const [courseToUnenroll, setCourseToUnenroll] = useState(null);
	const { toast } = useToast();

	// Utiliser les hooks personnalisés pour récupérer les données
	const {
		currentTrainings: personalCourses,
		isLoading: isLoadingPersonal,
		refresh: refreshPersonalCourses,
	} = useCurrentTraining();

	// Récupérer les organisations de l'utilisateur
	const [userOrganizations, setUserOrganizations] = useState([]);
	const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

	// Utiliser le hook pour les formations d'organisation
	const { organizationTrainings, isLoading: isLoadingOrg } =
		useTrainingOrganization(selectedOrgId, containerName);

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

	// Effet pour charger les organisations de l'utilisateur
	useEffect(() => {
		fetchUserOrganizations();
	}, []);

	// Fonction pour gérer la désinscription avec modale
	const handleUnenroll = (course) => {
		setCourseToUnenroll(course);
		setShowUnenrollModal(true);
	};

	const fetchUserOrganizations = async () => {
		try {
			setIsLoadingOrgs(true);
			const response = await axios.get("/api/organization");

			if (response.data.organizations) {
				setUserOrganizations(response.data.organizations);

				// Sélectionner automatiquement la première organisation si elle existe
				if (response.data.organizations.length > 0 && !selectedOrgId) {
					setSelectedOrgId(response.data.organizations[0].id);
				}
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des organisations:",
				error
			);
			setUserOrganizations([]);
		} finally {
			setIsLoadingOrgs(false);
		}
	};

	const handleSelectOrganization = (orgId) => {
		setSelectedOrgId(orgId);
	};

	// Nouvelle logique pour démarrer directement une formation
	const handleStartCourse = async (course) => {
		if (!containerName) {
			toast({
				title: "Erreur d'accès",
				description:
					"Impossible d'accéder aux formations. Veuillez vous reconnecter.",
				variant: "destructive",
			});
			return;
		}

		try {
			// Log pour déboguer les informations de source
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
					userId: containerName,
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
				// Redirection basée sur la source de la formation
				if (
					course.source &&
					course.source.type === "organization" &&
					course.source.organizationId
				) {
					console.log("Redirection vers cours d'organisation:", {
						courseId: course.id,
						orgId: course.source.organizationId,
					});
					router.push(
						`/wisetrainer/${course.source.organizationId}/${course.id}`
					);
				}

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
		// Vérifier si le cours a des informations de source
		if (
			course.source &&
			course.source.type === "organization" &&
			course.source.organizationId
		) {
			// Rediriger vers la version organisation du cours
			router.push(
				`/wisetrainer/${course.source.organizationId}/${course.id}`
			);
		}
	};

	// Fonction pour se désinscrire d'une formation
	const confirmUnenroll = async () => {
		if (!courseToUnenroll) return;

		try {
			// 1. Appel API pour supprimer l'inscription de la base de données
			const dbResponse = await axios.delete(
				`${
					WISETRAINER_CONFIG.API_ROUTES.UNENROLL_COURSE
				}/${containerName}/${courseToUnenroll.id}?sourceType=${
					courseToUnenroll.source?.type || "organization"
				}&sourceOrganizationId=${
					courseToUnenroll.source?.organizationId || ""
				}`
			);

			// 2. Appel API pour supprimer les fichiers dans Azure
			const azureResponse = await axios.delete(
				`${WISETRAINER_CONFIG.API_ROUTES.UNENROLL_AZURE}/${containerName}/${courseToUnenroll.id}`
			);

			console.log("Réponse suppression Azure:", azureResponse.data);

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

		if (course.id === "WiseTrainer_01") {
			// Ajoutez l'ID qui pose problème ici
			console.log("INFO VÉRIFICATION - Détails du cours à vérifier:", {
				id: course.id,
				sourceType: course.source?.type || "organization",
				sourceOrgId: course.source?.organizationId || null,
				compositeId: course.compositeId || `${course.id}__unknown`,
			});

			// Afficher toutes les formations personnelles pour comparaison
			personalCourses.forEach((pc) => {
				console.log("INFO VÉRIFICATION - Formation personnelle:", {
					id: pc.id,
					sourceType: pc.source?.type || "organization",
					sourceOrgId: pc.source?.organizationId || null,
					compositeId: pc.compositeId || `${pc.id}__unknown`,
				});
			});
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

	// Fonction pour générer un ID composite pour un cours
	const generateCompositeId = (course) => {
		const sourceType = course.source?.type || "organization";
		const orgId = course.source?.organizationId || "organization";
		return `${course.id}__${sourceType}__${orgId}`;
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
					<CatalogOrganizationTab
						organizations={userOrganizations}
						selectedOrganizationId={selectedOrgId}
						onSelectOrganization={handleSelectOrganization}
						trainings={(organizationTrainings || []).map(
							(training) => {
								// S'assurer que chaque formation a les informations de source complètes
								const selectedOrg = userOrganizations.find(
									(org) => org.id === selectedOrgId
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
									compositeId: `${training.id}__organization__${selectedOrgId}`,
									source: {
										type: "organization",
										name:
											selectedOrg?.name || "Organisation",
										organizationId: selectedOrgId,
										containerName:
											selectedOrg?.azureContainer || null,
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
