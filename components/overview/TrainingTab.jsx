//components/overview/TrainingTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/lib/contexts/DashboardContext";

// Import des sous-composants
import TrainingHeader from "@/components/overview/training/TrainingHeader";
import TrainingList from "@/components/overview/training/TrainingList";
import TrainingEmptyState from "@/components/overview/training/TrainingEmptyState";

export default function TrainingTab() {
	const { trainings, isLoading } = useDashboard();

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
		>
			<TrainingHeader />

			{isLoading ? (
				<TrainingList.Skeleton />
			) : trainings.length > 0 ? (
				<TrainingList trainings={trainings} />
			) : (
				<TrainingEmptyState />
			)}
		</motion.div>
	);
}
