import React from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/lib/contexts/DashboardContext";
import StatCard from "./StatCard";
import CompletedTrainings from "./CompletedTrainings";
import TrainingTime from "./TrainingTime";
import AverageScore from "./AverageScore";
import TopScores from "./TopScores";

export default function StatsOverviewTab() {
	const { stats, trainings, isLoading } = useDashboard();

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

	// Filtrer les formations terminées
	const completedTrainings = trainings.filter(
		(training) => training.progress === 100
	);

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="space-y-6"
		>
			{/* Cartes des statistiques principales */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Formations terminées */}
				<motion.div variants={itemVariants}>
					<CompletedTrainings
						completedTrainings={completedTrainings.length}
						completedTrainingsTrend={
							stats?.completedTrainingsTrend || 0
						}
						isLoading={isLoading}
					/>
				</motion.div>

				{/* Score moyen */}
				<motion.div variants={itemVariants}>
					<AverageScore
						averageScore={stats?.averageScore || 0}
						averageScoreTrend={stats?.averageScoreTrend || 0}
						isLoading={isLoading}
					/>
				</motion.div>

				{/* Temps total */}
				<motion.div variants={itemVariants}>
					<TrainingTime
						totalTime={stats?.totalTime || 0}
						sessionCount={stats?.sessionCount || 0}
						isLoading={isLoading}
					/>
				</motion.div>
			</div>

			{/* Statistiques détaillées */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Dernières formations terminées */}
				<motion.div variants={itemVariants}>
					<CompletedTrainings.List
						completedTrainings={completedTrainings.slice(0, 5)}
						isLoading={isLoading}
					/>
				</motion.div>

				{/* Meilleurs scores */}
				<motion.div variants={itemVariants}>
					<TopScores
						topScores={stats?.topScores || []}
						isLoading={isLoading}
					/>
				</motion.div>
			</div>
		</motion.div>
	);
}
