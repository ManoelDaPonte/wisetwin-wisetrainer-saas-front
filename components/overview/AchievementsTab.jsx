AchievementsTab; //components/overview/AchievementsTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/lib/contexts/DashboardContext";

// Import des sous-composants
import AchievementsHeader from "@/components/overview/achievements/AchievementsHeader";
import AchievementsList from "@/components/overview/achievements/AchievementsList";
import AchievementsPromotionBanner from "@/components/overview/achievements/AchievementsPromotionBanner";

export default function AchievementsTab() {
	const { achievements, isLoading } = useDashboard();

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
			<AchievementsHeader />

			{isLoading ? (
				<AchievementsList.Skeleton />
			) : (
				<>
					<AchievementsList achievements={achievements} />

					{achievements.length > 0 && <AchievementsPromotionBanner />}
				</>
			)}
		</motion.div>
	);
}
