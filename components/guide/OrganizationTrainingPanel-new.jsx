"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Building, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrainingCard from "./TrainingCard";

// Variants d'animation pour Framer Motion
const panelVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      staggerChildren: 0.1 
    } 
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Composant pour afficher les formations d'une organisation
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.organization - Données de l'organisation
 * @param {Array} props.taggedTrainings - Formations associées aux tags de l'utilisateur
 * @param {Array} props.organizationTrainings - Toutes les formations de l'organisation
 * @param {boolean} props.hasCompletedTaggedTrainings - Indique si l'utilisateur a complété toutes ses formations taguées
 * @returns {JSX.Element} Panneau des formations d'une organisation
 */
export default function OrganizationTrainingPanel({
  organization,
  taggedTrainings = [],
  organizationTrainings = [],
  hasCompletedTaggedTrainings = false,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllTrainings, setShowAllTrainings] = useState(false);

  // Si pas de formations du tout, ne rien afficher
  if (
    (!taggedTrainings || taggedTrainings.length === 0) &&
    (!organizationTrainings || organizationTrainings.length === 0)
  ) {
    return null;
  }

  // Déterminer quelles formations afficher
  const shouldShowTaggedSection = taggedTrainings && taggedTrainings.length > 0;
  const shouldShowAllTrainings =
    showAllTrainings &&
    organizationTrainings &&
    organizationTrainings.length > 0;
  
  // Filtrer les formations déjà affichées dans la section taguée
  const filteredAllTrainings = shouldShowTaggedSection
    ? organizationTrainings.filter(
        (training) =>
          !taggedTrainings.some((taggedTraining) => taggedTraining.id === training.id)
      )
    : organizationTrainings;

  // Si pas de formations restantes après filtrage, ajuster l'affichage
  const hasFilteredTrainings = filteredAllTrainings && filteredAllTrainings.length > 0;

  return (
    <motion.section
      variants={panelVariants}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
    >
      {/* En-tête de l'organisation */}
      <div
        className="p-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-wisetwin-blue text-white p-2 rounded-md">
            <Building size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-wisetwin-darkblue dark:text-white">
              {organization.name}
            </h3>
            {organization.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {organization.description}
              </p>
            )}
          </div>
        </div>
        <div>
          {isExpanded ? (
            <ChevronDown className="text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronRight className="text-gray-500 dark:text-gray-400" />
          )}
        </div>
      </div>

      {/* Contenu (uniquement visible si développé) */}
      {isExpanded && (
        <div className="p-4">
          {/* 1. Formations taguées (si disponibles) */}
          {shouldShowTaggedSection && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="text-wisetwin-pink" size={16} />
                <h4 className="text-md font-medium text-wisetwin-darkblue dark:text-white">
                  Formations recommandées pour vous
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {taggedTrainings.map((training) => (
                  <motion.div key={training.id} variants={itemVariants}>
                    <TrainingCard training={training} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Message lorsque toutes les formations taguées sont complétées */}
          {hasCompletedTaggedTrainings && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md mb-4 border border-green-100 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                Félicitations ! Vous avez terminé toutes vos formations assignées.
              </p>
            </div>
          )}

          {/* 2. Toutes les autres formations (activé par un bouton) */}
          {hasFilteredTrainings && (
            <div className="mt-4">
              {showAllTrainings ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="text-wisetwin-blue" size={16} />
                    <h4 className="text-md font-medium text-wisetwin-darkblue dark:text-white">
                      Toutes les formations
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAllTrainings.map((training) => (
                      <motion.div key={training.id} variants={itemVariants}>
                        <TrainingCard training={training} />
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllTrainings(true)}
                  className="w-full text-sm"
                >
                  Voir toutes les formations ({filteredAllTrainings.length})
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}