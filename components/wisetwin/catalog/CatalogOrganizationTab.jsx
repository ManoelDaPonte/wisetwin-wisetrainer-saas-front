//components/wisetwin/catalog/CatalogOrganizationTab.jsx
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
import BuildCard from "@/components/wisetwin/catalog/BuildCard";
import BuildsLoading from "@/components/wisetwin/catalog/BuildsLoading";
import EmptyStateCard from "@/components/wisetwin/catalog/EmptyStateCard";

export default function CatalogOrganizationTab({
	organizations = [],
	selectedOrganizationId,
	onSelectOrganization,
	builds = [],
	isLoading = false,
	onViewBuild,
	onToggleInfo,
	flippedCardId,
	importingBuildId,
	containerVariants,
	itemVariants,
}) {
	// Organisation sélectionnée
	const selectedOrganization = organizations.find(
		(org) => org.id === selectedOrganizationId
	);

	// États d'affichage
	const isEmptyCatalog = builds.length === 0;
	const showNoOrganizations = organizations.length === 0;

	// Sélection d'organisation
	const handleOrganizationChange = (orgId) => {
		// Changer l'organisation
		onSelectOrganization(orgId);
	};

	// Rendu pour les différents états
	const renderContent = () => {
		if (isLoading) {
			return <BuildsLoading />;
		}

		if (showNoOrganizations) {
			return (
				<EmptyStateCard
					icon={
						<Building className="w-12 h-12 text-gray-300 dark:text-gray-600" />
					}
					title="Aucune organisation"
					description="Vous n'êtes membre d'aucune organisation. Rejoignez une organisation pour accéder aux environnements 3D spécifiques."
				/>
			);
		}

		if (isEmptyCatalog) {
			return (
				<EmptyStateCard
					icon={
						<Building className="w-12 h-12 text-gray-300 dark:text-gray-600" />
					}
					title="Aucun environnement 3D disponible"
					description={
						selectedOrganization
							? `L'organisation "${selectedOrganization.name}" n'a pas encore d'environnements 3D disponibles.`
							: "Cette organisation n'a pas encore d'environnements 3D disponibles."
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
				{builds.map((build) => (
					<BuildCard
						key={build.id}
						build={{
							...build,
							// Ajouter le nom de l'organisation comme source
							source: {
								type: "organization",
								name: selectedOrganization
									? selectedOrganization.name
									: "Organisation",
							},
						}}
						onViewBuild={onViewBuild}
						onToggleInfo={onToggleInfo}
						flippedCardId={flippedCardId}
						isImporting={importingBuildId === build.id}
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
					Environnements 3D de vos organisations
				</h2>
				<p className="text-gray-600 dark:text-gray-300">
					Accédez aux environnements 3D proposés par vos organisations
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

			{renderContent()}
		</div>
	);
}
