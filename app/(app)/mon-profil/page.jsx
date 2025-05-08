//app/(app)/mon-profil/page.jsx
"use client";
import React from "react";
import { useDashboard } from "@/lib/contexts/DashboardContext";
import MonProfil from "@/components/mon-profil";

/**
 * Page Mon Profil
 * Présente les statistiques de l'utilisateur et ses certifications
 */
export default function MonProfilPage() {
	const { stats, trainings, isLoading, refreshData, lastRefresh } =
		useDashboard();

	return (
		<MonProfil
			formations={trainings}
			stats={stats}
			isLoading={isLoading}
			onRefresh={refreshData}
			lastRefresh={lastRefresh}
		/>
	);
}
