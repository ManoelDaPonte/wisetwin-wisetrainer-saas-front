//app/(app)/overview/page.jsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// Import des composants principaux
import StatsOverviewTab from "@/components/overview/StatsOverviewTab";
import CertificationsTab from "@/components/overview/CertificationsTab";
import ActivityHistoryTab from "@/components/overview/ActivityHistoryTab";

import { useDashboard } from "@/lib/contexts/DashboardContext";

export default function OverviewPage() {
	const [activeTab, setActiveTab] = useState("stats");
	const { isLoading, refreshData, lastRefresh } = useDashboard();
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

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
						Mon profil
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Suivez vos statistiques, certifications et historique
						d'activités
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
				defaultValue="stats"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full mb-8"
			>
				<TabsList>
					<TabsTrigger value="stats">Statistiques</TabsTrigger>
					<TabsTrigger value="certifications">
						Certifications
					</TabsTrigger>
					<TabsTrigger value="activity">
						Historique d'activités
					</TabsTrigger>
				</TabsList>

				{/* Onglet Statistiques */}
				<TabsContent value="stats">
					<StatsOverviewTab />
				</TabsContent>

				{/* Onglet Certifications */}
				<TabsContent value="certifications">
					<CertificationsTab />
				</TabsContent>

				{/* Onglet Historique d'activités */}
				<TabsContent value="activity">
					<ActivityHistoryTab />
				</TabsContent>
			</Tabs>
		</div>
	);
}
