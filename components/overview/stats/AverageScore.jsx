//components/overview/stats/AverageScore.jsx
import React from "react";
import { ArrowUpRight, ArrowDownRight, Award } from "lucide-react";
import StatCard from "./StatCard";

export default function AverageScore({
	averageScore,
	averageScoreTrend,
	isLoading,
}) {
	return (
		<StatCard
			title="Score moyen"
			icon={<Award className="h-4 w-4 text-muted-foreground" />}
		>
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
					<span className="text-xs text-gray-500">Score stable</span>
				)}
			</div>
		</StatCard>
	);
}
