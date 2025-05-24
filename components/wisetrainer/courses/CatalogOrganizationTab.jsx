// components/wisetrainer/courses/CatalogOrganizationTab-new.jsx
import React from "react";
import { motion } from "framer-motion";
import { Building } from "lucide-react";
import CatalogCourseCard from "@/components/wisetrainer/courses/CatalogCourseCard";
import EmptyStateCard from "@/components/wisetrainer/courses/EmptyStateCard";
import CoursesLoading from "@/components/wisetrainer/courses/CoursesLoading";

export default function CatalogOrganizationTab({
	organizations = [],
	selectedOrganizationId,
	trainings = [],
	isLoading = false,
	onCourseSelect,
	onEnroll,
	onToggleInfo,
	flippedCardId,
	personalCourses = [],
	isImporting,
	containerVariants,
	itemVariants,
	isUserEnrolled,
}) {
	// Organisation sélectionnée (depuis le contexte global)
	const selectedOrganization = organizations.find(
		(org) => org.id === selectedOrganizationId
	);

	// États d'affichage
	const isEmptyCatalog = trainings.length === 0;
	const showNoOrganizations = organizations.length === 0;

	// Rendu pour les différents états vides
	const renderContent = () => {
		if (isLoading) {
			return <CoursesLoading count={4} />;
		}

		if (showNoOrganizations) {
			return (
				<EmptyStateCard
					icon={<Building className="w-10 h-10 text-gray-400 dark:text-gray-500" />}
					title="Aucune organisation"
					description="Vous n'êtes membre d'aucune organisation. Rejoignez une organisation pour accéder aux formations spécifiques."
				/>
			);
		}

		if (isEmptyCatalog) {
			return (
				<EmptyStateCard
					icon={<Building className="w-10 h-10 text-gray-400 dark:text-gray-500" />}
					title="Aucune formation disponible"
					description={
						selectedOrganization
							? `L'organisation "${selectedOrganization.name}" n'a pas encore de formations disponibles.`
							: "Cette organisation n'a pas encore de formations disponibles."
					}
				/>
			);
		}

		return (
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="grid grid-cols-1 md:grid-cols-2 gap-8"
			>
				{trainings.map((course) => (
					<CatalogCourseCard
						key={
							course.compositeId ||
							`${course.id}_${selectedOrganizationId}`
						}
						course={{
							...course,
							// S'assurer que les informations d'organisation sont correctement définies
							source: {
								type: "organization",
								organizationId: selectedOrganizationId,
								name: selectedOrganization
									? selectedOrganization.name
									: "Organisation",
								containerName:
									selectedOrganization?.azureContainer ||
									null,
							},
						}}
						isFlipped={flippedCardId === course.id}
						onToggleInfo={() => onToggleInfo(course.id)}
						onSelect={() => onCourseSelect(course)}
						onEnroll={() => onEnroll(course)}
						itemVariants={itemVariants}
						isEnrolled={isUserEnrolled(course, personalCourses)}
						isImporting={isImporting}
					/>
				))}
			</motion.div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Afficher le nom de l'organisation active ou du catalogue personnel */}
			{selectedOrganization ? (
				<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
					<Building className="w-4 h-4" />
					<span>Catalogue de formations de {selectedOrganization.name}</span>
				</div>
			) : selectedOrganizationId === null && trainings.length > 0 ? (
				<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
					<Building className="w-4 h-4" />
					<span>Catalogue de formations disponibles</span>
				</div>
			) : null}
			
			{renderContent()}
		</div>
	);
}