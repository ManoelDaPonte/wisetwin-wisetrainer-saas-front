//app/(app)/overview/page.jsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

import StatisticsSection from "@/components/overview/StatisticsSection";
import RecentProjectsSection from "@/components/overview/RecentProjectsSection";
import { useDashboard } from "@/lib/contexts/DashboardContext";

export default function OverviewPage() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("dashboard");
	const {
		trainings,
		stats,
		achievements,
		recentProjects,
		isLoading,
		refreshData,
		lastRefresh,
	} = useDashboard();
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Gérer le rafraîchissement manuel des données
	const handleRefresh = async () => {
		setIsRefreshing(true);
		await refreshData();
		setIsRefreshing(false);
	};

	// Formatage des dates
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.4 },
		},
	};

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
						Tableau de bord
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Retrouvez ici toutes vos statistiques et vos formations
						en cours.
					</p>
				</div>
				<Button
					variant="outline"
					className="flex items-center gap-2"
					onClick={handleRefresh}
					disabled={isLoading || isRefreshing}
				>
					<RefreshCw
						className={`w-4 h-4 ${
							isRefreshing ? "animate-spin" : ""
						}`}
					/>
					<span>Actualiser</span>
				</Button>
			</div>

			{lastRefresh && (
				<p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
					Dernière mise à jour: {formatDate(lastRefresh)}
				</p>
			)}

			<Tabs
				defaultValue="dashboard"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full mb-8"
			>
				<TabsList>
					<TabsTrigger value="dashboard">Vue d'ensemble</TabsTrigger>
					<TabsTrigger value="trainings">Formations</TabsTrigger>
					<TabsTrigger value="achievements">Réalisations</TabsTrigger>
				</TabsList>

				{/* Onglet Vue d'ensemble */}
				<TabsContent value="dashboard">
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="space-y-8"
					>
						<motion.div variants={itemVariants}>
							<StatisticsSection
								stats={stats}
								isLoading={isLoading}
							/>
						</motion.div>

						<motion.div variants={itemVariants}>
							<RecentProjectsSection
								projects={recentProjects}
								isLoading={isLoading}
							/>
						</motion.div>

						<motion.div variants={itemVariants}>
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
								<Card className="lg:col-span-2">
									<CardHeader>
										<CardTitle className="flex items-center">
											Progression des Formations
										</CardTitle>
										<CardDescription>
											État d'avancement de vos formations
											en cours
										</CardDescription>
									</CardHeader>
									<CardContent>
										{isLoading ? (
											<div className="space-y-4">
												{[1, 2].map((i) => (
													<div
														key={i}
														className="animate-pulse"
													>
														<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
														<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
													</div>
												))}
											</div>
										) : trainings.length > 0 ? (
											<div className="space-y-6">
												{trainings
													.slice(0, 3)
													.map((training) => (
														<div
															key={training.id}
															className="space-y-2"
														>
															{/* Contenu de formation similaire à celui défini précédemment */}
															{/* ... */}
														</div>
													))}
											</div>
										) : (
											<div className="text-center py-8">
												<p className="text-gray-500 dark:text-gray-400 mb-4">
													Vous n'avez pas encore
													commencé de formation
												</p>
												<Button
													onClick={() =>
														router.push(
															"/wisetrainer"
														)
													}
												>
													Découvrir les formations
												</Button>
											</div>
										)}
									</CardContent>
									{trainings.length > 0 && (
										<CardFooter>
											<Button
												variant="outline"
												className="w-full"
												onClick={() =>
													setActiveTab("trainings")
												}
											>
												Voir toutes les formations
											</Button>
										</CardFooter>
									)}
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											Réalisations Récentes
										</CardTitle>
										<CardDescription>
											Vos derniers badges et
											accomplissements
										</CardDescription>
									</CardHeader>
									<CardContent>
										{isLoading ? (
											<div className="space-y-4">
												{[1, 2].map((i) => (
													<div
														key={i}
														className="animate-pulse flex items-center"
													>
														<div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10 mr-3"></div>
														<div className="flex-1">
															<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
															<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
														</div>
													</div>
												))}
											</div>
										) : achievements.filter(
												(a) => a.unlocked
										  ).length > 0 ? (
											<div className="space-y-4">
												{achievements
													.filter((a) => a.unlocked)
													.slice(0, 3)
													.map((achievement) => (
														<div
															key={achievement.id}
															className="flex items-start"
														>
															{/* Contenu d'accomplissement similaire à celui défini précédemment */}
															{/* ... */}
														</div>
													))}
											</div>
										) : (
											<div className="text-center py-6">
												<p className="text-gray-500 dark:text-gray-400 text-sm">
													Complétez des formations
													pour débloquer des
													réalisations
												</p>
											</div>
										)}
									</CardContent>
									<CardFooter>
										<Button
											variant="outline"
											className="w-full"
											onClick={() =>
												setActiveTab("achievements")
											}
										>
											Voir toutes les réalisations
										</Button>
									</CardFooter>
								</Card>
							</div>
						</motion.div>
					</motion.div>
				</TabsContent>

				{/* Onglet Formations (même contenu que précédemment) */}
				<TabsContent value="trainings">{/* ... */}</TabsContent>

				{/* Onglet Réalisations (même contenu que précédemment) */}
				<TabsContent value="achievements">{/* ... */}</TabsContent>
			</Tabs>
		</div>
	);
}
