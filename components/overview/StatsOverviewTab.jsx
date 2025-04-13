//components/overview/StatsOverviewTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/lib/contexts/DashboardContext";
import {
	GraduationCap,
	Award,
	CheckCircle,
	Clock,
	ArrowUpRight,
	ArrowDownRight,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function StatsOverviewTab() {
	const { stats, isLoading } = useDashboard();

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.4 },
		},
	};

	// Vérifier que les propriétés existent avec des valeurs par défaut
	const moduleStats = stats?.moduleStats || [];
	const topScores = stats?.topScores || [];
	const completedTrainings = stats?.completedTrainings || 0;
	const completedTrainingsTrend = stats?.completedTrainingsTrend || 0;
	const averageScore = stats?.averageScore || 0;
	const averageScoreTrend = stats?.averageScoreTrend || 0;
	const completionRate = stats?.completionRate || 0;
	const totalTime = stats?.totalTime || 0;
	const sessionCount = stats?.sessionCount || 0;

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="space-y-6"
		>
			{/* Cartes des statistiques principales */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Formations terminées */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Formations terminées
							</CardTitle>
							<GraduationCap className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
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
											+{completedTrainingsTrend}% ce
											mois-ci
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
						</CardContent>
					</Card>
				</motion.div>

				{/* Score moyen */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Score moyen
							</CardTitle>
							<Award className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{isLoading ? (
									<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
								) : (
									averageScore
								)}
							</div>
							<div className="flex items-center pt-1">
								{averageScoreTrend > 0 ? (
									<>
										<ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+{averageScoreTrend}% d'amélioration
										</span>
									</>
								) : averageScoreTrend < 0 ? (
									<>
										<ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
										<span className="text-xs text-red-500">
											{averageScoreTrend}% de baisse
										</span>
									</>
								) : (
									<span className="text-xs text-gray-500">
										Score stable
									</span>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Taux de complétion */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Taux de complétion
							</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{isLoading ? (
									<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
								) : (
									`${completionRate}%`
								)}
							</div>
							<Progress
								value={completionRate}
								className="h-1.5 mt-2"
							/>
							<div className="flex justify-between text-xs text-muted-foreground mt-1">
								<span>En cours</span>
								<span>Terminé</span>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Temps total */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Temps de formation
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{isLoading ? (
									<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
								) : (
									`${totalTime}h`
								)}
							</div>
							<div className="text-xs text-muted-foreground mt-1">
								{sessionCount} sessions de formation
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Statistiques détaillées */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Statistiques par module */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center">
							<CheckCircle className="w-5 h-5 mr-2 text-wisetwin-blue" />
							Progression par module
						</CardTitle>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="space-y-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="animate-pulse">
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
										<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
										<div className="flex justify-between">
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
											<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
										</div>
									</div>
								))}
							</div>
						) : moduleStats.length > 0 ? (
							<div className="space-y-4">
								{moduleStats.map((module, index) => (
									<div key={index} className="space-y-1">
										<div className="flex justify-between">
											<span className="font-medium">
												{module.name}
											</span>
											<span>
												{module.completionRate}%
											</span>
										</div>
										<Progress
											value={module.completionRate}
											className="h-2"
										/>
										<div className="flex justify-between text-xs text-muted-foreground">
											<span>
												{module.completedModules}/
												{module.totalModules} modules
												terminés
											</span>
											<span>
												Score: {module.averageScore}
											</span>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-6 text-muted-foreground">
								Aucune donnée de progression par module
								disponible
							</div>
						)}
					</CardContent>
				</Card>

				{/* Meilleurs scores */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg flex items-center">
							<Award className="w-5 h-5 mr-2 text-wisetwin-blue" />
							Meilleurs scores
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
						) : topScores.length > 0 ? (
							<div className="space-y-4">
								{topScores.map((score, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-wisetwin-blue/10 flex items-center justify-center">
												<span className="font-bold text-wisetwin-blue">
													{index + 1}
												</span>
											</div>
											<div>
												<div className="font-medium">
													{score.moduleName}
												</div>
												<div className="text-sm text-muted-foreground">
													{score.trainingName}
												</div>
											</div>
										</div>
										<div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 font-bold">
											{score.score}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-6 text-muted-foreground">
								Aucun score disponible
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</motion.div>
	);
}
