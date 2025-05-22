"use client";
import React from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGuideData } from "@/newlib/hooks";

// Composants
import CurrentTrainingsPanel from "@/components/guide/CurrentTrainingsPanel";
import OrganizationsSection from "@/components/guide/OrganizationsSection";
import NoOrganizationGuide from "@/components/guide/NoOrganizationGuide";
import NoTrainingsMessage from "@/components/guide/NoTrainingsMessage";
import LoadingState from "@/components/guide/LoadingState";
import ErrorState from "@/components/guide/ErrorState";

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
 * Page Guide refactorisée utilisant la nouvelle architecture
 * @returns {JSX.Element} - Page Guide
 */
export default function GuidePage() {
  // Utiliser le nouveau hook avec toutes les données nécessaires
  const {
    organizationsData,
    organizations,
    trainings: currentTrainings,
    isLoading,
    error,
    refreshData,
    lastRefresh,
    hasOrganizations,
    hasAnyTraining
  } = useGuideData();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Déclenche un rafraîchissement manuel des données
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
            Guide de démarrage
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Bienvenue sur WiseTwin. Voici les prochaines étapes pour votre
            parcours de formation.
          </p>
        </div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing || isLoading ? "animate-spin" : ""}`}
          />
          <span>{isRefreshing ? "Actualisation..." : "Actualiser"}</span>
        </Button>
      </div>

      {lastRefresh && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Dernière mise à jour: {formatDate(lastRefresh)}
          {process.env.NODE_ENV === 'development' && (
            <span className="ml-2">
              ({hasOrganizations ? `${organizations?.length || 0} orgs` : 'no orgs'}, 
              {hasAnyTraining ? `${currentTrainings?.length || 0} trainings` : 'no trainings'})
            </span>
          )}
        </p>
      )}

      {/* Affiche l'erreur s'il y en a une */}
      {error && (
        <ErrorState
          message={error}
          onRetry={handleRefresh}
          isRetrying={isRefreshing}
        />
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* 1. Formations en cours */}
        <CurrentTrainingsPanel
          trainings={currentTrainings}
          isLoading={isLoading}
        />

        {/* 2. Organisations avec leurs formations */}
        <OrganizationsSection organizationsData={organizationsData} />

        {/* Si pas d'organisation, afficher un guide spécifique */}
        {!hasOrganizations && <NoOrganizationGuide />}

        {/* Message si aucune formation n'est disponible */}
        {!hasAnyTraining && <NoTrainingsMessage />}
      </motion.div>
    </div>
  );
}