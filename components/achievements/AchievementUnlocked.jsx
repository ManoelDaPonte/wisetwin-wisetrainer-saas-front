//components/achievements/AchievementUnlocked.jsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Trophy,
	GraduationCap,
	Award,
	Layers,
	Calendar,
	Check,
	X,
} from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

/**
 * Composant de notification pour les réalisations débloquées
 * @param {Object} achievement - Détails de la réalisation débloquée
 * @param {Function} onClose - Fonction à appeler lors de la fermeture
 */
export default function AchievementUnlocked({ achievement, onClose }) {
	const { toast } = useToast();

	useEffect(() => {
		if (achievement) {
			// Créer un toast pour l'achievement débloqué
			toast({
				title: "Réalisation débloquée!",
				description: `${achievement.title} - ${achievement.description}`,
				variant: "success",
				action: (
					<div className="bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 p-2 rounded-full mr-3">
						{getAchievementIcon(
							achievement.iconName,
							"w-5 h-5 text-wisetwin-blue"
						)}
					</div>
				),
			});

			// Fermer la notification après l'avoir affichée
			if (onClose) {
				onClose();
			}
		}
	}, [achievement]);

	// Fonction pour obtenir l'icône d'achievement
	const getAchievementIcon = (iconName, className) => {
		const iconProps = { className };

		switch (iconName) {
			case "Trophy":
				return <Trophy {...iconProps} />;
			case "GraduationCap":
				return <GraduationCap {...iconProps} />;
			case "Award":
				return <Award {...iconProps} />;
			case "Layers":
				return <Layers {...iconProps} />;
			case "Calendar":
				return <Calendar {...iconProps} />;
			case "Check":
				return <Check {...iconProps} />;
			default:
				return <Trophy {...iconProps} />;
		}
	};

	// Comme nous utilisons maintenant les toasts, ce composant n'a plus besoin de rendu visuel
	return null;
}
