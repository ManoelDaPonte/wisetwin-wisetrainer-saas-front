"use client";
import React from "react";
import { motion } from "framer-motion";
import TrainingCard from "./TrainingCard";

// Variants d'animation pour Framer Motion
const sectionVariants = {
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
 * Composant pour afficher les formations en cours
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.trainings - Liste des formations en cours
 * @param {boolean} props.isLoading - État de chargement
 * @returns {JSX.Element} Panneau des formations en cours
 */
export default function CurrentTrainingsPanel({ trainings = [], isLoading = false }) {
  // Pas de formations à afficher
  if (!trainings || trainings.length === 0) {
    return null;
  }

  return (
    <motion.section
      variants={sectionVariants}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8"
    >
      <h2 className="text-2xl font-semibold text-wisetwin-darkblue dark:text-white mb-4">
        Poursuivez votre apprentissage
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Continuez vos formations en cours ou explorez de nouveaux modules.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trainings.map((training) => (
          <motion.div key={training.compositeId || training.id} variants={itemVariants}>
            <TrainingCard training={training} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}