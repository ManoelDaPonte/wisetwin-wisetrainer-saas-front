//components/overview/DashboardTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/lib/contexts/DashboardContext";

// Import des sous-composants
import StatisticsSection from "@/components/overview/dashboard/StatisticsSection";
import RecentProjectsSection from "@/components/overview/dashboard/RecentProjectsSection";
import TrainingProgressSection from "@/components/overview/dashboard/TrainingProgressSection";

export default function DashboardTab({ setActiveTab }) {
	const { stats, recentProjects, trainings, isLoading } = useDashboard();

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
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

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="space-y-8"
		>
			<motion.div variants={itemVariants}>
				<StatisticsSection stats={stats} isLoading={isLoading} />
			</motion.div>

			<motion.div variants={itemVariants}>
				<RecentProjectsSection
					projects={recentProjects}
					isLoading={isLoading}
				/>
			</motion.div>

			<motion.div variants={itemVariants}>
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2">
						<TrainingProgressSection
							trainings={trainings}
							isLoading={isLoading}
							onViewAll={() => setActiveTab("trainings")}
						/>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}
