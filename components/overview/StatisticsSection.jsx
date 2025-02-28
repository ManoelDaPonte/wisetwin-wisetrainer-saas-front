//components/overview/StatisticsSection.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function StatisticsSection({ stats, isLoading }) {
	const statCards = [
		{
			title: "Digital Twins",
			value: stats.digitalTwin,
			action: "View All",
			route: "/digital-twin",
		},
		{
			title: "Training Programs",
			value: stats.wiseTrainer,
			action: "View All",
			route: "/wisetrainer",
		},
		{
			title: "Total Platform Time",
			value: `${stats.totalTime}h`,
			action: "View Details",
			route: null,
			disabled: true,
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
			{statCards.map((stat, index) => (
				<Card key={index} className="flex flex-col h-full">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg">{stat.title}</CardTitle>
					</CardHeader>
					<CardContent className="flex-grow flex items-center justify-center">
						{isLoading ? (
							<div className="flex items-center justify-center">
								<div className="animate-pulse h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
							</div>
						) : (
							<span className="text-4xl font-bold text-wisetwin-darkblue dark:text-wisetwin-blue">
								{stat.value}
							</span>
						)}
					</CardContent>
					<CardFooter>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => {
								if (stat.route)
									window.location.href = stat.route;
							}}
							disabled={stat.disabled || false}
						>
							{stat.action}
						</Button>
					</CardFooter>
				</Card>
			))}
		</div>
	);
}
