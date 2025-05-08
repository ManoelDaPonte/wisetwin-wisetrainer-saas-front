// components/wisetrainer/courses/CatalogOrganizationTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { Building } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import CatalogCourseCard from "@/components/wisetrainer/courses/CatalogCourseCard";
import EmptyStateCard from "@/components/wisetrainer/courses/EmptyStateCard";
import CoursesLoading from "@/components/wisetrainer/courses/CoursesLoading";

export default function CatalogOrganizationTab({
	organizations = [],
	selectedOrganizationId,
	onSelectOrganization,
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
	isUserEnrolled, // Accepter la fonction de vérification
}) {
	// Organisation sélectionnée
	const selectedOrganization = organizations.find(
		(org) => org.id === selectedOrganizationId
	);

	// États d'affichage
	const isEmptyCatalog = trainings.length === 0;
	const showNoOrganizations = organizations.length === 0;

	// Sélection d'organisation
	const handleOrganizationChange = (orgId) => {
		// Changer l'organisation
		onSelectOrganization(orgId);
	};

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
						onEnroll={onEnroll}
						onToggleInfo={onToggleInfo}
						flippedCardId={flippedCardId}
						isImporting={isImporting === course.id}
						isEnrolled={
							isUserEnrolled
								? isUserEnrolled(
										course,
										personalCourses
								  )
								: false
						}
						itemVariants={itemVariants}
					/>
				))}
			</motion.div>
		);
	};

	return (
		<div className="space-y-6">
			{/* En-tête avec titre et description */}
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
					Formations de vos organisations
				</h2>
			</div>

			{/* Sélection d'organisation si plusieurs sont disponibles */}
			{organizations.length > 1 && (
				<div className="mb-6">
					<Select
						value={selectedOrganizationId}
						onValueChange={handleOrganizationChange}
					>
						<SelectTrigger className="w-[300px]">
							<SelectValue placeholder="Sélectionner une organisation" />
						</SelectTrigger>
						<SelectContent>
							{organizations.map((org) => (
								<SelectItem key={org.id} value={org.id}>
									<div className="flex items-center gap-2">
										<Building className="w-4 h-4" />
										<span>{org.name}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{renderContent()}
		</div>
	);
}
