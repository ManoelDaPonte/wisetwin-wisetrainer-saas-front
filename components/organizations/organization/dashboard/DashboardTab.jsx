//components/organizations/organization/dashboard/DashboardTab.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDashboard } from "@/lib/contexts/DashboardContext";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

// Import des sous-composants
import StatisticsOverview from "./StatisticsOverview";
import UserProgressTable from "./UserProgressTable";
import TrainingAnalytics from "./TrainingAnalytics";
import ActivityTimeline from "./ActivityTimeline";

// Data fictives pour simulation
import { getDashboardData } from "@/lib/data/dashboardData";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Users, BookOpen, Calendar } from "lucide-react";

export default function DashboardTab({ organization }) {
	const [dashboardData, setDashboardData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [activeView, setActiveView] = useState("overview");
	const [timeRange, setTimeRange] = useState("month"); // 'week', 'month', 'quarter', 'year'
	const [organizationTags, setOrganizationTags] = useState([]);
	const { toast } = useToast();

	useEffect(() => {
		// Simulation de chargement des données
		const loadData = async () => {
			setIsLoading(true);
			try {
				// Simuler un délai de chargement
				await new Promise((resolve) => setTimeout(resolve, 800));

				// Charger des données fictives basées sur l'ID d'organisation
				const data = getDashboardData(organization.id, timeRange);

				// Charger les tags de l'organisation
				const tagsResponse = await axios.get(
					`/api/organization/${organization.id}/tags`
				);
				setOrganizationTags(tagsResponse.data.tags || []);

				// Charger les tags pour chaque utilisateur
				const usersWithTags = await Promise.all(
					data.users.map(async (user) => {
						try {
							// Simuler l'ajout de tags aux utilisateurs
							// Dans un vrai environnement, cela proviendrait de l'API
							const randomTagCount = Math.floor(
								Math.random() * 3
							); // 0 à 2 tags
							const randomTags = tagsResponse.data.tags
								.sort(() => 0.5 - Math.random())
								.slice(0, randomTagCount);

							return {
								...user,
								tags: randomTags,
							};
						} catch (error) {
							console.error(
								`Erreur lors du chargement des tags pour ${user.name}:`,
								error
							);
							return { ...user, tags: [] };
						}
					})
				);

				setDashboardData({
					...data,
					users: usersWithTags,
				});
			} catch (error) {
				console.error(
					"Erreur lors du chargement des données du dashboard:",
					error
				);
				toast({
					title: "Erreur",
					description:
						"Impossible de charger les données du dashboard",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [organization.id, timeRange]);

	const handleTimeRangeChange = (range) => {
		setTimeRange(range);
	};

	// Si chargement en cours, afficher un skeleton loader
	if (isLoading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
					<div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-bold text-wisetwin-darkblue dark:text-white">
					Tableau de bord administrateur
				</h2>

				{/* Sélecteur de période */}
				<div className="bg-background border border-input rounded-md p-1 inline-flex">
					<button
						onClick={() => handleTimeRangeChange("week")}
						className={`px-3 py-1 text-sm rounded-sm ${
							timeRange === "week"
								? "bg-wisetwin-blue text-white"
								: "hover:bg-muted"
						}`}
					>
						Semaine
					</button>
					<button
						onClick={() => handleTimeRangeChange("month")}
						className={`px-3 py-1 text-sm rounded-sm ${
							timeRange === "month"
								? "bg-wisetwin-blue text-white"
								: "hover:bg-muted"
						}`}
					>
						Mois
					</button>
					<button
						onClick={() => handleTimeRangeChange("quarter")}
						className={`px-3 py-1 text-sm rounded-sm ${
							timeRange === "quarter"
								? "bg-wisetwin-blue text-white"
								: "hover:bg-muted"
						}`}
					>
						Trimestre
					</button>
					<button
						onClick={() => handleTimeRangeChange("year")}
						className={`px-3 py-1 text-sm rounded-sm ${
							timeRange === "year"
								? "bg-wisetwin-blue text-white"
								: "hover:bg-muted"
						}`}
					>
						Année
					</button>
				</div>
			</div>

			<div>
				<Tabs
					defaultValue="overview"
					className="w-full"
					onValueChange={setActiveView}
					value={activeView}
				>
					<TabsList className="mb-4">
						<TabsTrigger value="overview">
							<BarChart className="h-4 w-4 mr-2" />
							Vue d'ensemble
						</TabsTrigger>
						<TabsTrigger value="users">
							<Users className="h-4 w-4 mr-2" />
							Utilisateurs
						</TabsTrigger>
						<TabsTrigger value="trainings">
							<BookOpen className="h-4 w-4 mr-2" />
							Formations
						</TabsTrigger>
						<TabsTrigger value="activity">
							<Calendar className="h-4 w-4 mr-2" />
							Activité
						</TabsTrigger>
					</TabsList>

					<TabsContent value="overview">
						{dashboardData && (
							<StatisticsOverview
								data={dashboardData}
								timeRange={timeRange}
							/>
						)}
					</TabsContent>

					<TabsContent value="users">
						{dashboardData && (
							<UserProgressTable
								users={dashboardData.users}
								trainings={dashboardData.trainings}
								tags={organizationTags}
							/>
						)}
					</TabsContent>

					<TabsContent value="trainings">
						{dashboardData && (
							<TrainingAnalytics
								trainings={dashboardData.trainings}
								users={dashboardData.users}
							/>
						)}
					</TabsContent>
					<TabsContent value="activity">
						{dashboardData && (
							<ActivityTimeline
								activities={dashboardData.activities}
								timeRange={timeRange}
							/>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
