// components/guide/index.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGuideData } from "@/lib/hooks/useGuideData";

// Composants
import CurrentTrainingsPanel from "./CurrentTrainingsPanel";
import OrganizationsSection from "./OrganizationsSection";
import NoOrganizationGuide from "./NoOrganizationGuide";
import NoTrainingsMessage from "./NoTrainingsMessage";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";

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
 * Composant principal de la page Guide
 * Utilise le hook optimisé useGuideData au lieu du contexte GuideContext
 * @returns {JSX.Element} - Composant Guide
 */
export default function Guide() {
  const {
    organizationsData,
    trainings: currentTrainings,
    isLoading,
    error,
    refreshData,
    lastRefresh
  } = useGuideData();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasOrganizations = organizationsData.length > 0;

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

  // Vérifier si nous avons des formations à afficher
  const hasAnyTraining =
    organizationsData.some(
      (org) => org.builds && org.builds.length > 0
    ) ||
    currentTrainings.length > 0;

  // Transformer les données pour être compatibles avec le composant OrganizationsSection
  const formattedOrganizationsData = organizationsData.map(org => {
    // Extracting tagged trainings based on user's tags
    let taggedTrainings = [];
    if (org.buildsByTag) {
      // Flatten all tagged trainings
      taggedTrainings = Object.values(org.buildsByTag)
        .flat()
        .map(training => ({
          ...training,
          organizationId: org.id,
          organizationName: org.name,
          source: {
            type: "organization",
            name: org.name,
            organizationId: org.id,
          }
        }));
    }
    
    // Format organization trainings
    const orgTrainings = (org.builds || []).map(build => ({
      ...build,
      organizationId: org.id,
      organizationName: org.name,
      source: {
        type: "organization",
        name: org.name,
        organizationId: org.id,
      }
    }));
    
    return {
      organization: {
        id: org.id,
        name: org.name,
        description: org.description,
        logoUrl: org.logoUrl
      },
      userTags: org.tags || [],
      taggedTrainings,
      orgTrainings,
      hasCompletedTaggedTrainings: false // This would need more logic to determine
    };
  });

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
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>Actualiser</span>
        </Button>
      </div>

      {lastRefresh && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Dernière mise à jour: {formatDate(lastRefresh)}
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
        <OrganizationsSection organizationsData={formattedOrganizationsData} />

        {/* Si pas d'organisation, afficher un guide spécifique */}
        {!hasOrganizations && <NoOrganizationGuide />}

        {/* Message si aucune formation n'est disponible */}
        {!hasAnyTraining && <NoTrainingsMessage />}
      </motion.div>
    </div>
  );
}