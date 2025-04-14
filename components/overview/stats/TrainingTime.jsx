import React from "react";
import { Clock } from "lucide-react";
import StatCard from "./StatCard";

export default function TrainingTime({ totalTime, sessionCount, isLoading }) {
	return (
		<StatCard
			title="Temps de formation"
			icon={<Clock className="h-4 w-4 text-muted-foreground" />}
		>
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
		</StatCard>
	);
}
