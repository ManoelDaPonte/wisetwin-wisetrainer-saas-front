// components/organizations/organization/dashboard/StatisticsOverview.jsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Users,
	Clock,
	Award,
	BookOpen,
	ArrowUpRight,
	ArrowDownRight,
	GraduationCap,
	CheckCircle,
	Brain,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Composant pour un graphique de courbe (simulé avec des divs pour l'instant)
const SimpleLineChart = ({ data, color }) => {
	const max = Math.max(...data);
	const min = Math.min(...data);
	const range = max - min || 1;

	return (
		<div className="flex items-end h-12 gap-1">
			{data.map((value, index) => (
				<div
					key={index}
					className={`w-1 rounded-sm ${color}`}
					style={{
						height: `${((value - min) / range) * 100}%`,
						minHeight: "10%",
					}}
				></div>
			))}
		</div>
	);
};

export default function StatisticsOverview({ data, timeRange }) {
	// Animation pour les cartes
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: "spring", stiffness: 100, damping: 15 },
		},
	};

	const timeRangeText = {
		week: "cette semaine",
		month: "ce mois-ci",
		quarter: "ce trimestre",
		year: "cette année",
	};

	return (
		<div className="space-y-6">
			<motion.div
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Carte: Utilisateurs actifs */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Utilisateurs actifs
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data.activeUsers}
							</div>
							<div className="flex items-center pt-1">
								{data.usersTrend > 0 ? (
									<>
										<ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+{data.usersTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								) : (
									<>
										<ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
										<span className="text-xs text-red-500">
											{data.usersTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								)}
							</div>
							<div className="mt-3">
								<SimpleLineChart
									data={data.usersHistory}
									color="bg-blue-500"
								/>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Carte: Temps de formation */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Temps de formation
							</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data.totalTrainingTime}h
							</div>
							<div className="flex items-center pt-1">
								{data.trainingTimeTrend > 0 ? (
									<>
										<ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+{data.trainingTimeTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								) : (
									<>
										<ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
										<span className="text-xs text-red-500">
											{data.trainingTimeTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								)}
							</div>
							<div className="mt-3">
								<SimpleLineChart
									data={data.trainingTimeHistory}
									color="bg-indigo-500"
								/>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Carte: Taux de complétion */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Taux de complétion
							</CardTitle>
							<CheckCircle className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data.completionRate}%
							</div>
							<div className="flex items-center pt-1">
								{data.completionRateTrend > 0 ? (
									<>
										<ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+{data.completionRateTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								) : (
									<>
										<ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
										<span className="text-xs text-red-500">
											{data.completionRateTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								)}
							</div>
							<div className="mt-3">
								<SimpleLineChart
									data={data.completionRateHistory}
									color="bg-green-500"
								/>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Carte: Score moyen */}
				<motion.div variants={itemVariants}>
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">
								Score moyen
							</CardTitle>
							<Award className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{data.averageScore}
							</div>
							<div className="flex items-center pt-1">
								{data.averageScoreTrend > 0 ? (
									<>
										<ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
										<span className="text-xs text-green-500">
											+{data.averageScoreTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								) : (
									<>
										<ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
										<span className="text-xs text-red-500">
											{data.averageScoreTrend}%{" "}
											{timeRangeText[timeRange]}
										</span>
									</>
								)}
							</div>
							<div className="mt-3">
								<SimpleLineChart
									data={data.averageScoreHistory}
									color="bg-amber-500"
								/>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>

			{/* Section des formations populaires */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center">
								<BookOpen className="h-5 w-5 mr-2" />
								Formations les plus populaires
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								{data.topTrainings
									.slice(0, 5)
									.map((training, index) => (
										<div key={index} className="space-y-2">
											<div className="flex justify-between items-center">
												<div>
													<span className="font-medium">
														{training.name}
													</span>
													<div className="text-sm text-muted-foreground flex items-center mt-1">
														<Users className="h-3 w-3 mr-1" />
														{training.enrolledUsers}{" "}
														inscrits
													</div>
												</div>
												<div className="text-sm font-medium">
													{training.completionRate}%
												</div>
											</div>
											<Progress
												value={training.completionRate}
												className="h-2"
											/>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Section des utilisateurs les plus actifs */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-lg flex items-center">
								<GraduationCap className="h-5 w-5 mr-2" />
								Top utilisateurs
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{data.topUsers
									.slice(0, 5)
									.map((user, index) => (
										<div
											key={index}
											className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800"
										>
											<div className="flex items-center">
												<div className="bg-gray-100 dark:bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
													<span className="text-xs font-bold">
														{index + 1}
													</span>
												</div>
												<div>
													<div className="font-medium">
														{user.name}
													</div>
													<div className="text-xs text-muted-foreground">
														{user.role}
													</div>
												</div>
											</div>
											<div className="flex items-center gap-3">
												<div className="text-sm text-right">
													<div>
														{
															user.completedTrainings
														}{" "}
														formations
													</div>
													<div className="text-muted-foreground">
														{user.trainingTime}h
													</div>
												</div>
												<div className="bg-wisetwin-blue text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
													{user.averageScore}
												</div>
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
