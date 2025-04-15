// components/wisetrainer/WiseTrainerCourses.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { useToast } from "@/lib/hooks/useToast";

// Import des hooks personnalisés
import { useTrainingWiseTwin } from "@/lib/hooks/useTrainingWiseTwin";
import { useTrainingOrganization } from "@/lib/hooks/useTrainingOrganization";
import { useCurrentTraining } from "@/lib/hooks/useCurrentTraining";

// Import des composants d'onglets
import PersonalCoursesTab from "@/components/wisetrainer/courses/PersonalCoursesTab";
import CatalogCoursesTab from "@/components/wisetrainer/courses/CatalogCoursesTab";
import CatalogOrganizationTab from "@/components/wisetrainer/courses/CatalogOrganizationTab";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export default function WiseTrainerCourses() {
	const router = useRouter();
	const { containerName } = useAzureContainer();
	const [activeTab, setActiveTab] = useState("personal");
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [selectedOrgId, setSelectedOrgId] = useState(null);
	const { toast } = useToast();

	// Utiliser les hooks personnalisés pour récupérer les données
	const { trainings: wiseTwinTrainings, isLoading: isLoadingWiseTwin } =
		useTrainingWiseTwin(containerName);
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

		// Rediriger directement vers la page de la formation
		router.push(`/wisetrainer/${course.id}`);

		// Notification informative
		toast({
			title: "Formation prête",
			description:
				"Vous accédez à la formation. La progression sera automatiquement enregistrée.",
			variant: "info",
		});
	};

	const handleUnenroll = async (course) => {
		if (
			!confirm(
				`Êtes-vous sûr de vouloir supprimer "${course.name}" de votre liste ? Votre progression sera perdue.`
			)
		) {
			return;
		}

		try {
			// Appeler l'API pour supprimer les fichiers du container
			const response = await axios.delete(
				`${WISETRAINER_CONFIG.API_ROUTES.UNENROLL}/${containerName}/${course.id}`
			);

			if (response.data.success) {
				// Rafraîchir la liste des formations personnelles
				await refreshPersonalCourses();

				toast({
					title: "Formation supprimée",
					description: `"${course.name}" a été supprimée de votre liste`,
					variant: "success",
				});
			} else {
				throw new Error(
					response.data.error || "Échec de la suppression"
				);
			}
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast({
				title: "Échec de la suppression",
				description: "Une erreur est survenue. Veuillez réessayer.",
				variant: "destructive",
			});
		}
	};

	const handleCourseSelect = (course) => {
		router.push(`/wisetrainer/${course.id}`);
	};

	const toggleCardFlip = (courseId) => {
		setFlippedCardId(flippedCardId === courseId ? null : courseId);
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
					<TabsTrigger value="catalog" className="px-6">
						Catalogue
					</TabsTrigger>
					<TabsTrigger value="organization" className="px-6">
						Organisation
					</TabsTrigger>
				</TabsList>

				<TabsContent value="personal">
					<PersonalCoursesTab
						isLoading={isLoadingPersonal}
						courses={personalCourses}
						onCourseSelect={handleCourseSelect}
						onUnenroll={handleUnenroll}
						onBrowseCatalog={() => setActiveTab("catalog")}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="catalog">
					<CatalogCoursesTab
						isLoading={isLoadingWiseTwin}
						courses={wiseTwinTrainings}
						personalCourses={personalCourses}
						onEnroll={handleStartCourse} // Maintenant utilise la méthode handleStartCourse
						onToggleInfo={toggleCardFlip}
						flippedCardId={flippedCardId}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="organization">
					<CatalogOrganizationTab
						organizations={userOrganizations}
						selectedOrganizationId={selectedOrgId}
						onSelectOrganization={handleSelectOrganization}
						trainings={organizationTrainings || []}
						isLoading={isLoadingOrgs || isLoadingOrg}
						onCourseSelect={handleCourseSelect}
						onEnroll={handleStartCourse} // Utilise également handleStartCourse
						onToggleInfo={toggleCardFlip}
						flippedCardId={flippedCardId}
						personalCourses={personalCourses}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
