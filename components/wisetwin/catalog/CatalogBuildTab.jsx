//components/wisetwin/catalog/CatalogBuildTab.jsx
import React from "react";
import { motion } from "framer-motion";
import BuildCard from "@/components/wisetwin/catalog/BuildCard";
import BuildsLoading from "@/components/wisetwin/catalog/BuildsLoading";

const CatalogBuildTab = ({
	isLoading,
	builds = [], // Valeur par défaut pour éviter les erreurs si undefined
	onViewBuild,
	onToggleInfo,
	flippedCardId,
	importingBuildId,
	containerVariants,
	itemVariants,
}) => {
	// Vérifier si builds est un tableau valide
	const validBuilds = Array.isArray(builds) ? builds : [];

	return (
		<>
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
					Environnements 3D disponibles
				</h2>
				<p className="text-gray-600 dark:text-gray-300">
					Explorez nos environnements industriels en 3D pour vous
					familiariser avec les installations
				</p>
			</div>
			{isLoading ? (
				<BuildsLoading />
			) : validBuilds.length === 0 ? (
				<div className="text-center py-16">
					<div className="text-4xl mb-4">🔍</div>
					<h3 className="text-lg font-medium mb-2">
						Aucun environnement disponible
					</h3>
					<p className="text-gray-500 dark:text-gray-400 mb-6">
						Nous n'avons pas trouvé d'environnements 3D disponibles
						dans le catalogue pour le moment.
					</p>
				</div>
			) : (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 gap-8"
				>
					{validBuilds.map(
						(build) =>
							build && (
								<BuildCard
									key={build.id}
									build={{
										...build,
										// Ajouter WiseTwin comme source s'il n'y en a pas déjà une
										source: build.source || {
											type: "wisetwin",
											name: "WiseTwin",
										},
									}}
									onViewBuild={onViewBuild}
									onToggleInfo={onToggleInfo}
									flippedCardId={flippedCardId}
									isImporting={importingBuildId === build.id}
									itemVariants={itemVariants}
								/>
							)
					)}
				</motion.div>
			)}
		</>
	);
};

export default CatalogBuildTab;
