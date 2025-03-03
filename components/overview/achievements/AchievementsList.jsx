//components/overview/achievements/AchievementsList.jsx
import React from "react";
import { motion } from "framer-motion";
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Trophy,
	GraduationCap,
	Award,
	Layers,
	Calendar,
	Check,
	Lock,
} from "lucide-react";

function AchievementsList({ achievements }) {
	// Animation variants
	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.4 },
		},
	};

	// Obtenir l'icône correspondante
	const getAchievementIcon = (iconName) => {
		switch (iconName) {
			case "Trophy":
				return Trophy;
			case "GraduationCap":
				return GraduationCap;
			case "Award":
				return Award;
			case "Layers":
				return Layers;
			case "Calendar":
				return Calendar;
			case "Check":
				return Check;
			default:
				return Trophy;
		}
	};

	// Formatage des dates
	const formatDate = (dateString) => {
		if (!dateString) return null;
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Grouper les achievements par catégorie
	const groupedAchievements = {
		unlocked: achievements.filter((a) => a.unlocked),
		locked: achievements.filter((a) => !a.unlocked),
	};

	return (
		<div className="space-y-8">
			{/* Achievements débloqués */}
			{groupedAchievements.unlocked.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-4 text-wisetwin-darkblue dark:text-white">
						Réalisations débloquées
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{groupedAchievements.unlocked.map((achievement) => {
							const IconComponent = getAchievementIcon(
								achievement.iconName
							);
							return (
								<motion.div
									key={achievement.id}
									variants={itemVariants}
								>
									<Card className="hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light transition-colors">
										<CardHeader className="flex flex-row items-center gap-4">
											<div className="rounded-full p-3 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20">
												<IconComponent className="w-6 h-6 text-wisetwin-blue" />
											</div>
											<div>
												<CardTitle className="text-base">
													{achievement.title}
												</CardTitle>
												<CardDescription>
													Débloqué le{" "}
													{formatDate(
														achievement.unlockedAt
													)}
												</CardDescription>
											</div>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-gray-600 dark:text-gray-300">
												{achievement.description}
											</p>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				</div>
			)}

			{/* Achievements verrouillés */}
			{groupedAchievements.locked.length > 0 && (
				<div>
					<h3 className="text-lg font-semibold mb-4 text-wisetwin-darkblue dark:text-white">
						Réalisations à débloquer
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{groupedAchievements.locked.map((achievement) => {
							const IconComponent = getAchievementIcon(
								achievement.iconName
							);
							return (
								<motion.div
									key={achievement.id}
									variants={itemVariants}
								>
									<Card className="opacity-60">
										<CardHeader className="flex flex-row items-center gap-4">
											<div className="rounded-full p-3 bg-gray-100 dark:bg-gray-800">
												<Lock className="w-6 h-6 text-gray-400 dark:text-gray-500" />
											</div>
											<div>
												<CardTitle className="text-base">
													{achievement.title}
												</CardTitle>
												<CardDescription>
													Verrouillé
												</CardDescription>
											</div>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-gray-600 dark:text-gray-300">
												{achievement.description}
											</p>
										</CardContent>
									</Card>
								</motion.div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

// Composant pour l'état de chargement
AchievementsList.Skeleton = function AchievementsListSkeleton() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{[1, 2, 3].map((i) => (
				<div key={i} className="animate-pulse">
					<Card>
						<CardHeader className="flex flex-row items-center gap-4">
							<div className="rounded-full bg-gray-200 dark:bg-gray-700 h-12 w-12"></div>
							<div className="flex-1">
								<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
						</CardContent>
					</Card>
				</div>
			))}
		</div>
	);
};

export default AchievementsList;
