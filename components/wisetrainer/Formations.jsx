// components/wisetrainer/Formations.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFormations } from "@/lib/hooks/formations/useFormations";
import { motion } from "framer-motion";

// Import des composants d'onglets
import UserFormation from "@/components/wisetrainer/tabs/UserFormation";
import CataloguePublique from "@/components/wisetrainer/tabs/CataloguePublique";
import CatalogueOrganizations from "@/components/wisetrainer/tabs/CatalogueOrganizations";
import UnenrollModal from "@/components/wisetrainer/modals/UnenrollModal";

export default function Formations() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("mesFormations");
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [showUnenrollModal, setShowUnenrollModal] = useState(false);
	const [courseToUnenroll, setCourseToUnenroll] = useState(null);

	// Utiliser le hook useFormations pour récupérer et gérer les données
	const {
		userFormations,
		publicFormations,
		organizationFormations,
		userOrganizations,
		selectedOrgId,

		isLoadingUser,
		isLoadingPublic,
		isLoadingOrgs,
		isLoadingOrgFormations,

		setSelectedOrgId,
		isUserEnrolled,
		enrollFormation,
		unenrollFormation,

		refreshUserFormations,
	} = useFormations();

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

	// Fonction pour confirmer la désinscription
	const confirmUnenroll = async () => {
		if (!courseToUnenroll) return;

		const result = await unenrollFormation(courseToUnenroll);

		if (result.success) {
			setShowUnenrollModal(false);
			setCourseToUnenroll(null);
		}
	};

	// Fonction pour fermer la modale
	const closeUnenrollModal = () => {
		setShowUnenrollModal(false);
		setCourseToUnenroll(null);
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
				`/wisetrainer/organization/${course.source.organizationId}/${course.id}`
			);
		} else {
			// Rediriger vers la version standard du cours
			router.push(`/wisetrainer/${course.id}`);
		}
	};

	// Fonction pour s'inscrire à une formation
	const handleEnroll = async (course) => {
		const result = await enrollFormation(course);

		if (result.success) {
			// Si l'utilisateur est sur l'onglet catalogue, proposer de passer à "mes formations"
			if (activeTab !== "mesFormations") {
				setTimeout(() => {
					setActiveTab("mesFormations");
				}, 1000);
			}
		}
	};

	const toggleCardFlip = (courseId) => {
		setFlippedCardId(flippedCardId === courseId ? null : courseId);
	};

	console.log("Organizations dans le composant parent:", userOrganizations);

	return (
		<div className="container mx-auto">
			<Tabs
				defaultValue="mesFormations"
				className="w-full"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-8">
					<TabsTrigger value="mesFormations" className="px-6">
						Mes Formations
					</TabsTrigger>
					<TabsTrigger value="cataloguePublique" className="px-6">
						Catalogue Publique
					</TabsTrigger>
					<TabsTrigger
						value="catalogueOrganizations"
						className="px-6"
					>
						Catalogue Organisations
					</TabsTrigger>
				</TabsList>

				<TabsContent value="mesFormations">
					<UserFormation
						formations={userFormations}
						isLoading={isLoadingUser}
						onCourseSelect={handleCourseSelect}
						onUnenroll={handleUnenroll}
						onBrowseCatalog={() =>
							setActiveTab("cataloguePublique")
						}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="cataloguePublique">
					<CataloguePublique
						formations={publicFormations}
						isLoading={isLoadingPublic}
						isUserEnrolled={isUserEnrolled}
						onEnroll={handleEnroll}
						onToggleInfo={toggleCardFlip}
						flippedCardId={flippedCardId}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="catalogueOrganizations">
					<CatalogueOrganizations
						formations={organizationFormations}
						isLoading={isLoadingOrgs || isLoadingOrgFormations}
						userOrganizations={userOrganizations} // S'assurer que c'est toujours un tableau
						selectedOrgId={selectedOrgId}
						onSelectOrg={setSelectedOrgId} // Corriger le nom de la prop
						isUserEnrolled={isUserEnrolled}
						onEnroll={handleEnroll}
					/>
				</TabsContent>
			</Tabs>

			{/* Modale de désinscription */}
			<UnenrollModal
				isOpen={showUnenrollModal}
				onClose={closeUnenrollModal}
				onConfirm={confirmUnenroll}
				courseName={courseToUnenroll?.name || ""}
			/>
		</div>
	);
}
