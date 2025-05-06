// components/mon-profil/certifications/index.jsx
import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ArrowRight } from "lucide-react";
import CertificationCard from "./CertificationCard";

// Variants d'animation pour Framer Motion
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

/**
 * Composant principal des certifications
 * @param {Array} certifications - Liste des certifications/formations terminées
 * @param {boolean} isLoading - État de chargement
 * @param {function} onSelect - Callback pour sélectionner une certification
 * @param {function} onDownload - Callback pour télécharger une certification
 * @param {function} onDownloadAll - Callback pour télécharger toutes les certifications
 */
export default function Certifications({ 
  certifications = [], 
  isLoading = false, 
  onSelect, 
  onDownload, 
  onDownloadAll 
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center">
            <Award className="w-5 h-5 mr-2 text-wisetwin-blue" />
            Vos certifications et diplômes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDownloadAll}
            disabled={isLoading || certifications.length === 0}
            className="text-wisetwin-blue"
          >
            Télécharger le rapport
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Message si aucune certification */}
          {!isLoading && certifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Award className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Aucune certification disponible
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-4">
                Terminez des formations pour obtenir vos certifications et diplômes.
                Vous pourrez ensuite les télécharger et les partager.
              </p>
              <Button
                onClick={() => window.location.href = "/wisetrainer"}
                className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
              >
                Explorer les formations
              </Button>
            </div>
          ) : (
            <>
              {/* Liste des certifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading
                  ? // État de chargement
                    Array(3)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse"
                        >
                          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                          <div className="mt-2">
                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                          </div>
                        </div>
                      ))
                  : // Certifications réelles
                    certifications.map((certification) => (
                      <CertificationCard
                        key={certification.id}
                        certification={certification}
                        onClick={onSelect}
                        onDownload={onDownload}
                      />
                    ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}