//components/overview/dashboard/RecentAchievementsSection.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Trophy,
	GraduationCap,
	Award,
	Layers,
	Calendar,
	Check,
} from "lucide-react";

export default function RecentAchievementsSection({
	achievements,
	isLoading,
	onViewAll,
}) {
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

	const unlockedAchievements = achievements.filter((a) => a.unlocked);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					<Trophy className="w-5 h-5 mr-2" />
					Réalisations Récentes
				</CardTitle>
				<CardDescription>
					Vos derniers badges et accomplissements
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<AchievementsSkeletonLoader />
				) : unlockedAchievements.length > 0 ? (
					<RecentAchievementsList
						achievements={unlockedAchievements}
						getAchievementIcon={getAchievementIcon}
						formatDate={formatDate}
					/>
				) : (
					<EmptyAchievementsState />
				)}
			</CardContent>
			<CardFooter>
				<Button
					variant="outline"
					className="w-full"
					onClick={onViewAll}
				>
					Voir toutes les réalisations
				</Button>
			</CardFooter>
		</Card>
	);
}

// Composant pour afficher la liste des réalisations
function RecentAchievementsList({
	achievements,
	getAchievementIcon,
	formatDate,
}) {
	// Afficher seulement les 3 premières réalisations
	const displayedAchievements = achievements.slice(0, 3);

	return (
		<div className="space-y-4">
			{displayedAchievements.map((achievement) => {
				const IconComponent = getAchievementIcon(achievement.iconName);
				return (
					<div key={achievement.id} className="flex items-start">
						<div className="bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 p-2 rounded-full mr-3">
							<IconComponent className="w-5 h-5 text-wisetwin-blue" />
						</div>
						<div>
							<h4 className="font-medium text-sm">
								{achievement.title}
							</h4>
							<p className="text-xs text-gray-500 dark:text-gray-400">
								{achievement.description}
							</p>
							{achievement.unlockedAt && (
								<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
									Débloqué le{" "}
									{formatDate(achievement.unlockedAt)}
								</p>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}

// Composant pour afficher l'état vide
function EmptyAchievementsState() {
	return (
		<div className="text-center py-6">
			<p className="text-gray-500 dark:text-gray-400 text-sm">
				Complétez des formations pour débloquer des réalisations
			</p>
		</div>
	);
}

// Composant pour afficher l'état de chargement
function AchievementsSkeletonLoader() {
	return (
		<div className="space-y-4">
			{[1, 2].map((i) => (
				<div key={i} className="animate-pulse flex items-center">
					<div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10 mr-3"></div>
					<div className="flex-1">
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
						<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
					</div>
				</div>
			))}
		</div>
	);
}
