// components/mon-profil/index.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import Statistiques from "./statistiques";
import Certifications from "./certifications";
import CertificationModal from "./certifications/CertificationModal";
import Formations from "./formations";

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

/**
 * Formatage des dates
 * @param {Date|string} dateString - Date à formater
 * @returns {string} Date formatée
 */
const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

/**
 * Composant principal de la page Mon Profil
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.formations - Liste des formations
 * @param {Object} props.stats - Statistiques globales
 * @param {boolean} props.isLoading - État de chargement
 * @param {function} props.onRefresh - Callback pour rafraîchir les données
 * @param {Date|string} props.lastRefresh - Date de la dernière mise à jour
 */
export default function MonProfil({
	formations = [],
	stats = {},
	isLoading = false,
	onRefresh,
	lastRefresh,
}) {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [selectedCertification, setSelectedCertification] = useState(null);

	// Filtrer les formations terminées (pour les certifications)
	const formationsTerminees = React.useMemo(() => {
		return formations.filter((formation) => formation.progress === 100);
	}, [formations]);

	// Gérer le rafraîchissement manuel des données
	const handleRefresh = async () => {
		setIsRefreshing(true);
		await onRefresh();
		setIsRefreshing(false);
	};

	// Fonction pour télécharger un certificat
	const handleDownloadCertificate = (formation) => {
		// Cette fonction serait remplacée par la véritable génération de PDF
		console.log("Téléchargement du certificat pour:", formation.name);
	};

	// Fonction pour générer le rapport complet de toutes les formations
	const handleDownloadFullReport = () => {
		// Cette fonction serait remplacée par la véritable génération de PDF
		console.log("Téléchargement du rapport complet");
	};

	// Rediriger vers la page des formations
	const handleViewAllTrainings = () => {
		window.location.href = "/wisetrainer";
	};

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
						Mon profil
					</h1>
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

			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="space-y-10"
			>
				{/* Section Statistiques */}
				<Statistiques
					formations={formations}
					stats={stats}
					isLoading={isLoading}
					onViewAll={handleViewAllTrainings}
				/>

				{/* Section Formations */}
				<Formations
					formations={formations}
					isLoading={isLoading}
					onViewAll={handleViewAllTrainings}
				/>

				{/* Section Certifications */}
				<Certifications
					certifications={formationsTerminees}
					isLoading={isLoading}
					onSelect={setSelectedCertification}
					onDownload={handleDownloadCertificate}
					onDownloadAll={handleDownloadFullReport}
				/>
			</motion.div>

			{/* Modal de certification (affiché si une certification est sélectionnée) */}
			{selectedCertification && (
				<CertificationModal
					certification={selectedCertification}
					onClose={() => setSelectedCertification(null)}
					onDownload={handleDownloadCertificate}
				/>
			)}
		</div>
	);
}
