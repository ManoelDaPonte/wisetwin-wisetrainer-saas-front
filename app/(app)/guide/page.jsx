"use client";
import React from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGuideData } from "@/lib/hooks";

// Composants
import CurrentTrainingsPanel from "@/components/guide/CurrentTrainingsPanel";
import OrganizationsSection from "@/components/guide/OrganizationsSection";
import NoOrganizationGuide from "@/components/guide/NoOrganizationGuide";
import NoTrainingsMessage from "@/components/guide/NoTrainingsMessage";
import LoadingState from "@/components/guide/LoadingState";
import ErrorState from "@/components/guide/ErrorState";

// Variants d'animation pour Framer Motion
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

/**
 * Formatage des dates
 * @param {Date|string} dateString - Date à formater
 * @returns {string} Date formatée
 */
const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

/**
 * Page Guide refactorisée utilisant la nouvelle architecture
 * @returns {JSX.Element} - Page Guide
 */
export default function GuidePage() {
	// Utiliser le nouveau hook avec toutes les données nécessaires
	const {
		organizationsData,
		organizations,
		trainings: currentTrainings, // Formations en cours
		allTrainings, // Toutes les formations catégorisées
		trainingStats, // Statistiques globales
		isLoading,
		error,
		refreshData,
		lastRefresh,
		hasOrganizations,
		hasAnyTraining,
		activeContext,
	} = useGuideData();

	const [isRefreshing, setIsRefreshing] = useState(false);

	/**
	 * Déclenche un rafraîchissement manuel des données
	 */
	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refreshData();
		setIsRefreshing(false);
	};

	// Affichage pendant le chargement
	if (isLoading) {
		return <LoadingState />;
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
						Guide de démarrage
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mb-2">
						{activeContext?.type === "organization"
							? `Formations disponibles pour ${activeContext.name}`
							: "Vos formations personnelles"}
					</p>
					{activeContext?.type === "organization" && (
						<p className="text-sm text-muted-foreground">
							Changez d'organisation via le sélecteur dans la
							barre latérale pour voir d'autres formations.
						</p>
					)}
				</div>
				<Button
					variant="outline"
					className="flex items-center gap-2"
					onClick={handleRefresh}
					disabled={isLoading || isRefreshing}
				>
					<RefreshCw
						className={`w-4 h-4 ${
							isRefreshing || isLoading ? "animate-spin" : ""
						}`}
					/>
					<span>
						{isRefreshing ? "Actualisation..." : "Actualiser"}
					</span>
				</Button>
			</div>

			{lastRefresh && (
				<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
					Dernière mise à jour: {formatDate(lastRefresh)}
					{process.env.NODE_ENV === "development" &&
						trainingStats && (
							<span className="ml-2">
								(Contexte: {activeContext?.type || "none"},
								Total: {trainingStats.total}, En cours:{" "}
								{trainingStats.inProgress}, Validées:{" "}
								{trainingStats.completed}, Échecs:{" "}
								{trainingStats.failed})
							</span>
						)}
				</p>
			)}

			{/* Affiche l'erreur s'il y en a une */}
			{error && (
				<ErrorState
					message={error}
					onRetry={handleRefresh}
					isRetrying={isRefreshing}
				/>
			)}

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="space-y-6"
			>
				{/* 1. Formations en cours */}
				<CurrentTrainingsPanel
					trainings={currentTrainings}
					isLoading={isLoading}
				/>

				{/* 2. Formations validées et en échec */}
				{allTrainings &&
					(allTrainings.completed.length > 0 ||
						allTrainings.failed.length > 0) && (
						<div className="space-y-4">
							{/* Formations validées */}
							{allTrainings.completed.length > 0 && (
								<div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
									<h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
										✅ Formations validées (
										{allTrainings.completed.length})
									</h3>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{allTrainings.completed.map(
											(training) => (
												<div
													key={training.compositeId}
													className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20"
												>
													<h4 className="font-medium text-gray-900 dark:text-white">
														{training.name}
													</h4>
													<p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
														{training.description}
													</p>
													<div className="flex items-center justify-between mt-3">
														<span className="text-sm font-medium text-green-600">
															Score:{" "}
															{training.score}%
														</span>
														<span className="text-xs text-gray-500">
															Terminée le{" "}
															{formatDate(
																training.completedAt
															)}
														</span>
													</div>
												</div>
											)
										)}
									</div>
								</div>
							)}

							{/* Formations en échec */}
							{allTrainings.failed.length > 0 && (
								<div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
									<h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
										❌ Formations en échec (
										{allTrainings.failed.length})
									</h3>
									<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
										{allTrainings.failed.map((training) => (
											<div
												key={training.compositeId}
												className="border rounded-lg p-4 bg-red-50 dark:bg-red-900/20"
											>
												<h4 className="font-medium text-gray-900 dark:text-white">
													{training.name}
												</h4>
												<p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
													{training.description}
												</p>
												<div className="flex items-center justify-between mt-3">
													<span className="text-sm font-medium text-red-600">
														Score: {training.score}%
													</span>
													{training.canRestart && (
														<button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
															Recommencer
														</button>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}

				{/* 3. Organisations avec leurs formations (seulement si on est en mode organisation) */}
				{activeContext?.type === "organization" && (
					<OrganizationsSection
						organizationsData={organizationsData}
					/>
				)}

				{/* Si pas d'organisation en mode personnel, afficher un guide spécifique */}
				{activeContext?.type === "personal" && !hasAnyTraining && (
					<NoOrganizationGuide />
				)}

				{/* Message si aucune formation n'est disponible */}
				{!hasAnyTraining && activeContext?.type === "organization" && (
					<NoTrainingsMessage />
				)}
			</motion.div>
		</div>
	);
}
