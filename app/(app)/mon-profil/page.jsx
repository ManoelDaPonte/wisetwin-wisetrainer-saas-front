//app/(app)/mon-profil/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useCurrentTraining } from "@/lib/hooks/useCurrentTraining";
import { useUserStats } from "@/lib/hooks/useUserStats";
import MonProfil from "@/components/mon-profil";

/**
 * Page Mon Profil
 * Présente les statistiques de l'utilisateur et ses certifications
 * Utilise les nouveaux hooks optimisés pour éviter les chargements redondants
 */
export default function MonProfilPage() {
	const { currentTrainings, isLoading: trainingsLoading, refresh: refreshTrainings, lastRefresh: trainingsLastRefresh } = useCurrentTraining();
	const { stats, isLoading: statsLoading, refresh: refreshStats, lastRefresh: statsLastRefresh } = useUserStats();
	
	// États combinés
	const isLoading = trainingsLoading || statsLoading;
	const lastRefresh = statsLastRefresh || trainingsLastRefresh;
	
	// Fonction de rafraîchissement combinée
	const refreshData = async () => {
		await Promise.all([
			refreshTrainings(),
			refreshStats()
		]);
	};

	return (
		<MonProfil
			formations={currentTrainings}
			stats={stats}
			isLoading={isLoading}
			onRefresh={refreshData}
			lastRefresh={lastRefresh}
		/>
	);
}