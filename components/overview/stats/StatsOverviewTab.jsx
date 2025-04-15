//components/overview/stats/StatsOverviewTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/lib/contexts/DashboardContext";
import StatCard from "./StatCard";
import CompletedTrainings from "./CompletedTrainings";
import TrainingTime from "./TrainingTime";
import AverageScore from "./AverageScore";
import TopScores from "./TopScores";
import ProgressionChart from "./ProgressionChart";
import RecentTrainings from "./RecentTrainings";

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

	// Calculer le score moyen à partir des formations
	const calculateAverageScore = () => {
		const completedTrainings = trainings.filter((t) => t.progress === 100);
		if (completedTrainings.length === 0) return stats?.averageScore || 0;

		// Moyenne des scores de modules pour chaque formation
		const totalScore = completedTrainings.reduce((sum, training) => {
			// Calculer le score moyen de cette formation
			const moduleScores =
				training.modules
					?.filter((m) => m.completed)
					.map((m) => m.score) || [];
			const trainingAvg =
				moduleScores.length > 0
					? Math.round(
							moduleScores.reduce((a, b) => a + b, 0) /
								moduleScores.length
					  )
					: 0;
			return sum + (trainingAvg || 0);
		}, 0);

		return (
			Math.round(totalScore / completedTrainings.length) ||
			stats?.averageScore ||
			0
		);
	};

	// Filtrer les formations terminées
	const completedTrainings = trainings.filter(
		(training) => training.progress === 100
	);

	// Calculer le score moyen
	const averageScore = calculateAverageScore();

	// Rediriger vers la page des formations
	const handleViewAllTrainings = () => {
		window.location.href = "/wisetrainer";
	};

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
						averageScore={averageScore}
						averageScoreTrend={stats?.averageScoreTrend || 0}
						isLoading={isLoading}
					/>
				</motion.div>

				{/* Temps total */}
				<motion.div variants={itemVariants}>
					<TrainingTime
						totalTime={stats?.totalTime || 0}
						sessionCount={stats?.sessionsCompleted || 0}
						isLoading={isLoading}
					/>
				</motion.div>
			</div>

			{/* Graphique de progression */}
			<motion.div variants={itemVariants}>
				<ProgressionChart
					trainingsData={trainings}
					isLoading={isLoading}
				/>
			</motion.div>

			{/* Statistiques détaillées */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Formations récentes */}
				<motion.div variants={itemVariants}>
					<RecentTrainings
						trainings={trainings}
						isLoading={isLoading}
						onViewAll={handleViewAllTrainings}
					/>
				</motion.div>

				{/* Dernières formations terminées */}
				<motion.div variants={itemVariants}>
					<CompletedTrainings.List
						completedTrainings={completedTrainings.slice(0, 5)}
						isLoading={isLoading}
					/>
				</motion.div>
			</div>
		</motion.div>
	);
}
