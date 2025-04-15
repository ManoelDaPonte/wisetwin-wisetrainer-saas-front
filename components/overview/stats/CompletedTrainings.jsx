//components/overview/stats/CompletedTrainings.jsx
import React from "react";
import {
	ArrowUpRight,
	ArrowDownRight,
	GraduationCap,
	CheckCircle,
} from "lucide-react";
import StatCard from "./StatCard";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

// Carte statistique principale pour formations terminées
function CompletedTrainings({
	completedTrainings,
	completedTrainingsTrend,
	isLoading,
}) {
	return (
		<StatCard
			title="Formations terminées"
			icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
		>
			<div className="text-2xl font-bold">
				{isLoading ? (
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
				) : (
					completedTrainings
				)}
			</div>
			<div className="flex items-center pt-1">
				{completedTrainingsTrend > 0 ? (
					<>
						<ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
						<span className="text-xs text-green-500">
							+{completedTrainingsTrend}% ce mois-ci
						</span>
					</>
				) : (
					<>
						<ArrowDownRight className="h-4 w-4 text-gray-500 mr-1" />
						<span className="text-xs text-gray-500">
							Aucune nouvelle formation terminée
						</span>
					</>
				)}
			</div>
		</StatCard>
	);
}

// Fonction utilitaire pour calculer le score moyen d'une formation
const calculateTrainingScore = (training) => {
	if (!training.modules || training.modules.length === 0) {
		return training.score || 0;
	}

	const completedModules = training.modules.filter((m) => m.completed);
	if (completedModules.length === 0) {
		return training.score || 0;
	}

	const totalScore = completedModules.reduce(
		(sum, module) => sum + (module.score || 0),
		0
	);
	return Math.round(totalScore / completedModules.length);
};

// Liste des dernières formations terminées
CompletedTrainings.List = function CompletedTrainingsList({
	completedTrainings,
	isLoading,
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg flex items-center">
					<CheckCircle className="w-5 h-5 mr-2 text-wisetwin-blue" />
					Dernières formations terminées
				</CardTitle>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
									<div className="flex-1">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
									</div>
									<div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
								</div>
							</div>
						))}
					</div>
				) : completedTrainings.length > 0 ? (
					<div className="space-y-4">
						{completedTrainings.map((training) => {
							// Calculer le score moyen de cette formation
							const averageScore =
								calculateTrainingScore(training);

							return (
								<div
									key={training.id}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
											<GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
										</div>
										<div>
											<div className="font-medium line-clamp-1">
												{training.name}
											</div>
											<div className="text-sm text-muted-foreground">
												Terminé le{" "}
												{formatDate(
													training.completedAt ||
														training.lastAccessed
												)}
											</div>
										</div>
									</div>
									<div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-bold dark:bg-green-900/30 dark:text-green-300">
										{averageScore}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-6 text-muted-foreground">
						Aucune formation terminée
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default CompletedTrainings;
