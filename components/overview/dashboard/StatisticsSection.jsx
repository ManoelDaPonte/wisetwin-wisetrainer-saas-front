//components/overview/StatisticsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Clock, GraduationCap, Box, BarChart3 } from "lucide-react";

export default function StatisticsSection({ stats, isLoading }) {
	const statCards = [
		{
			title: "Formations",
			value: stats.wiseTrainer,
			icon: GraduationCap,
			description: "Formations actives",
			action: "Voir tout",
			route: "/wisetrainer",
		},
		{
			title: "Taux de complétion",
			value: `${stats.completionRate}%`,
			icon: BarChart3,
			description: "Progression moyenne",
			action: "Détails",
			route: null,
		},
		{
			title: "Temps total",
			value: `${stats.totalTime}h`,
			icon: Clock,
			description: "Temps de formation",
			action: "Analyser",
			route: null,
		},
	];

	// Animation variants
	const variants = {
		hidden: { opacity: 0, y: 20 },
		visible: (i) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: i * 0.1,
				duration: 0.4,
			},
		}),
	};

	return (
		<div>
			<div className="flex items-baseline justify-between mb-4">
				<h2 className="text-xl font-bold text-wisetwin-darkblue dark:text-white">
					Statistiques
				</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{statCards.map((stat, index) => (
					<motion.div
						key={index}
						custom={index}
						variants={variants}
						initial="hidden"
						animate="visible"
					>
						<Card className="flex flex-col h-full">
							<CardHeader className="pb-2 flex flex-row items-center justify-between">
								<CardTitle className="text-lg">
									{stat.title}
								</CardTitle>
								<div className="w-10 h-10 rounded-full bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 flex items-center justify-center">
									<stat.icon className="w-5 h-5 text-wisetwin-blue" />
								</div>
							</CardHeader>
							<CardContent className="py-4">
								{isLoading ? (
									<div className="animate-pulse space-y-2">
										<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
									</div>
								) : (
									<>
										<div className="text-3xl font-bold text-wisetwin-darkblue dark:text-white">
											{stat.value}
										</div>
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
											{stat.description}
										</p>
									</>
								)}
							</CardContent>
							<CardFooter className="pt-0 mt-auto">
								{stat.route && (
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											window.location.href = stat.route;
										}}
										disabled={isLoading}
									>
										{stat.action}
									</Button>
								)}
							</CardFooter>
						</Card>
					</motion.div>
				))}
			</div>
		</div>
	);
}
