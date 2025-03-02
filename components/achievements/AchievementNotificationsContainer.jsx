//components/achievements/AchievementNotificationsContainer.jsx
"use client";
import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import AchievementUnlocked from "./AchievementUnlocked";
import { useDashboard } from "@/lib/contexts/DashboardContext";

/**
 * Conteneur pour gérer l'affichage des notifications d'accomplissements
 */
export default function AchievementNotificationsContainer() {
	const { newAchievements, handleAchievementNotificationClose } =
		useDashboard();
	const [queue, setQueue] = useState([]);
	const [current, setCurrent] = useState(null);

	// Gérer la file d'attente des accomplissements
	useEffect(() => {
		// Ajouter les nouveaux accomplissements à la file d'attente
		if (newAchievements.length > 0) {
			setQueue((prev) => [...prev, ...newAchievements]);
		}
	}, [newAchievements]);

	// Afficher les accomplissements un par un
	useEffect(() => {
		// Si aucun accomplissement n'est affiché et qu'il y en a dans la file d'attente
		if (!current && queue.length > 0) {
			// Prendre le premier accomplissement de la file
			const nextAchievement = queue[0];
			setCurrent(nextAchievement);
			setQueue((prev) => prev.slice(1));
		}
	}, [current, queue]);

	// Gérer la fermeture d'une notification
	const handleClose = () => {
		if (current) {
			handleAchievementNotificationClose(current.id);
			setCurrent(null);
		}
	};

	return (
		<AnimatePresence>
			{current && (
				<AchievementUnlocked
					achievement={current}
					onClose={handleClose}
					autoCloseDelay={6000}
				/>
			)}
		</AnimatePresence>
	);
}
