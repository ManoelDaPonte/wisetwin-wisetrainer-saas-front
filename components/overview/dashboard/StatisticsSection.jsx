//components/overview/dashboard/StatisticsSection.jsx
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
import { Clock, GraduationCap, Award, BarChart3 } from "lucide-react";

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
			route: "/overview?tab=trainings",
		},
		{
			title: "Temps total",
			value: `${stats.totalTime}h`,
			icon: Clock,
			description: "Temps de formation",
			action: "Analyser",
			route: null,
		},
		{
			title: "Taux de réussite",
			value: `${stats.successRate}%`,
			icon: Award,
			description: "Questions répondues",
			action: "Voir détails",
			route: null,
			additionalInfo: `${stats.correctAnswers}/${stats.questionsAnswered} réponses correctes`,
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

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
								<CardTitle className="text-base">
									{stat.title}
								</CardTitle>
								<div className="w-10 h-10 rounded-full bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 flex items-center justify-center">
									<stat.icon className="w-5 h-5 text-wisetwin-blue" />
								</div>
							</CardHeader>
							<CardContent className="py-2">
								{isLoading ? (
									<div className="animate-pulse space-y-2">
										<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
									</div>
								) : (
									<>
										<div className="text-2xl font-bold text-wisetwin-darkblue dark:text-white">
											{stat.value}
										</div>
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
											{stat.description}
										</p>
										{stat.additionalInfo && (
											<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
												{stat.additionalInfo}
											</p>
										)}
									</>
								)}
							</CardContent>
							<CardFooter className="pt-0 mt-auto">
								{stat.route && (
									<Button
										variant="outline"
										className="w-full text-sm"
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
