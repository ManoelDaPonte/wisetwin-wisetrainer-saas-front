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

	// Partie du rendu pour les états vides
	const renderEmptyState = () => {
		if (isLoading) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
					<div className="w-16 h-16 border-4 border-wisetwin-blue border-t-transparent rounded-full animate-spin mb-4"></div>
					<p className="text-gray-500 dark:text-gray-400 text-center">
						Chargement des formations...
					</p>
				</div>
			);
		}

		if (showNoOrganizations) {
			return (
				<div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<Building className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucune organisation
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4 max-w-md">
						Vous n'êtes membre d'aucune organisation. Rejoignez une
						organisation pour accéder aux formations spécifiques.
					</p>
				</div>
			);
		}

		if (isEmptyCatalog) {
			return (
				<div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<Building className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucune formation disponible
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4">
						{selectedOrganization
							? `L'organisation "${selectedOrganization.name}" n'a pas encore de formations disponibles.`
							: "Cette organisation n'a pas encore de formations disponibles."}
					</p>
				</div>
			);
		}

		return null;
	};

	// Sélection d'organisation
	const handleOrganizationChange = (orgId) => {
		// Changer l'organisation
		onSelectOrganization(orgId);
	};

	return (
		<div className="space-y-6">
			{/* En-tête avec titre et description */}
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
					Formations de vos organisations
				</h2>
				<p className="text-gray-600 dark:text-gray-300">
					Accédez aux formations proposées par vos organisations
				</p>
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

			{showNoOrganizations || isEmptyCatalog || isLoading ? (
				renderEmptyState()
			) : (
				<>
					{/* Liste des formations */}
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
				</>
			)}
		</div>
	);
}
