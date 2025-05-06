// components/mon-profil/statistiques/index.jsx
import React from "react";
import { motion } from "framer-motion";
import FormationsTerminees from "./FormationsTerminees";
import ScoreMoyen from "./ScoreMoyen";
import TempsFormation from "./TempsFormation";
/**
 * Calcule le score moyen à partir des formations terminées
 * @param {Array} formations - Liste des formations
 * @param {Object} stats - Statistiques globales
 * @returns {number} Score moyen calculé
 */
const calculerScoreMoyen = (formations, stats) => {
	const formationsTerminees = formations.filter((t) => t.progress === 100);
	if (formationsTerminees.length === 0) return stats?.averageScore || 0;

	// Moyenne des scores de modules pour chaque formation
	const scoreTotal = formationsTerminees.reduce((sum, formation) => {
		// Calculer le score moyen de cette formation
		const scoresModules =
			formation.modules?.filter((m) => m.completed).map((m) => m.score) ||
			[];
		const moyenneFormation =
			scoresModules.length > 0
				? Math.round(
						scoresModules.reduce((a, b) => a + b, 0) /
							scoresModules.length
				  )
				: 0;
		return sum + (moyenneFormation || 0);
	}, 0);

	return (
		Math.round(scoreTotal / formationsTerminees.length) ||
		stats?.averageScore ||
		0
	);
};

// Variants d'animation pour Framer Motion
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
		transition: { duration: 0.4 },
	},
};

/**
 * Composant principal pour la section statistiques
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.formations - Liste des formations
 * @param {Object} props.stats - Statistiques globales
 * @param {boolean} props.isLoading - État de chargement
 * @param {function} props.onViewAll - Callback pour le bouton "Voir tout"
 */
export default function Statistiques({
	formations = [],
	stats = {},
	isLoading = false,
	onViewAll,
}) {
	// Filtrer les formations terminées
	const formationsTerminees = React.useMemo(() => {
		return formations.filter((formation) => formation.progress === 100);
	}, [formations]);

	// Calculer le score moyen
	const scoreMoyen = React.useMemo(() => {
		return calculerScoreMoyen(formations, stats);
	}, [formations, stats]);

	return (
		<section>
			{/* Cartes des statistiques principales */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
				{/* Formations terminées */}
				<motion.div variants={itemVariants}>
					<FormationsTerminees
						nombreFormations={formationsTerminees.length}
						tendance={stats?.completedTrainingsTrend || 0}
						isLoading={isLoading}
					/>
				</motion.div>

				{/* Score moyen */}
				<motion.div variants={itemVariants}>
					<ScoreMoyen
						score={scoreMoyen}
						tendance={stats?.averageScoreTrend || 0}
						isLoading={isLoading}
					/>
				</motion.div>

				{/* Temps total */}
				<motion.div variants={itemVariants}>
					<TempsFormation
						tempsTotal={stats?.totalTime || 0}
						nombreSessions={stats?.sessionsCompleted || 0}
						isLoading={isLoading}
					/>
				</motion.div>
			</div>
		</section>
	);
}
