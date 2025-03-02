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

/**
 * Composant de notification pour les réalisations débloquées
 * @param {Object} achievement - Détails de la réalisation débloquée
 * @param {Function} onClose - Fonction à appeler lors de la fermeture
 * @param {number} autoCloseDelay - Délai avant fermeture automatique (en ms)
 */
export default function AchievementUnlocked({
	achievement,
	onClose,
	autoCloseDelay = 5000,
}) {
	const [visible, setVisible] = useState(true);

	// Fermeture automatique après un délai
	useEffect(() => {
		if (achievement && autoCloseDelay > 0) {
			const timer = setTimeout(() => {
				setVisible(false);
			}, autoCloseDelay);

			return () => clearTimeout(timer);
		}
	}, [achievement, autoCloseDelay]);

	// Gérer l'animation de sortie
	const handleAnimationComplete = () => {
		if (!visible && onClose) {
			onClose();
		}
	};

	// Icône correspondant à la réalisation
	const getAchievementIcon = () => {
		const iconName = achievement?.iconName || "";

		switch (iconName) {
			case "Trophy":
				return Trophy;
			case "GraduationCap":
				return GraduationCap;
			case "Award":
				return Award;
			case "Layers":
				return Layers;
			case "Calendar":
				return Calendar;
			case "Check":
				return Check;
			default:
				return Trophy;
		}
	};

	const IconComponent = getAchievementIcon();

	if (!achievement) return null;

	return (
		<AnimatePresence>
			{visible && (
				<motion.div
					initial={{ x: 300, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					exit={{ x: 300, opacity: 0 }}
					transition={{ type: "spring", damping: 20 }}
					onAnimationComplete={handleAnimationComplete}
					className="fixed top-20 right-4 z-50 shadow-lg rounded-lg overflow-hidden max-w-sm w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
				>
					<div className="p-4">
						<div className="flex items-start">
							<div className="flex-shrink-0 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 p-3 rounded-full">
								<IconComponent className="w-8 h-8 text-wisetwin-blue" />
							</div>

							<div className="ml-4 flex-1">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="text-lg font-medium text-gray-900 dark:text-white">
											Réalisation débloquée!
										</h3>
										<p className="mt-1 text-sm font-bold text-gray-800 dark:text-gray-200">
											{achievement.title}
										</p>
									</div>

									<button
										className="bg-transparent rounded-md p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
										onClick={() => setVisible(false)}
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								<p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
									{achievement.description}
								</p>

								<div className="mt-3 flex justify-end">
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{
											delay: 0.2,
											type: "spring",
											stiffness: 200,
										}}
									>
										<div className="px-3 py-1 bg-wisetwin-blue text-white text-xs font-semibold rounded-full">
											+100 points
										</div>
									</motion.div>
								</div>
							</div>
						</div>
					</div>

					{/* Barre de progression pour l'auto-fermeture */}
					<motion.div
						initial={{ width: "100%" }}
						animate={{ width: "0%" }}
						transition={{
							duration: autoCloseDelay / 1000,
							ease: "linear",
						}}
						className="h-1 bg-wisetwin-blue"
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
