// components/wisetrainer/LoadingScreen.jsx
"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, ShieldAlert, FileSymlink } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const stages = [
  {
    id: "auth",
    title: "Vérification des droits d'accès",
    icon: <ShieldAlert className="h-6 w-6" />,
    progressStart: 0,
    progressEnd: 20,
  },
  {
    id: "course",
    title: "Chargement des données du cours",
    icon: <FileSymlink className="h-6 w-6" />,
    progressStart: 20,
    progressEnd: 40,
  },
  {
    id: "files",
    title: "Téléchargement des fichiers 3D",
    icon: <Loader2 className="h-6 w-6" />,
    progressStart: 40,
    progressEnd: 70,
  },
  {
    id: "unity",
    title: "Initialisation de l'environnement 3D",
    icon: <Loader2 className="h-6 w-6" />,
    progressStart: 70,
    progressEnd: 100,
  },
];

export default function LoadingScreen({
  currentStage = "auth",
  stageProgress = 0,
  error = null,
  onRetry = () => {},
  onBack = () => {},
}) {
  const [progress, setProgress] = useState(0);

  // Calcul du progrès global en fonction de l'étape actuelle
  useEffect(() => {
    const currentStageInfo = stages.find((s) => s.id === currentStage);
    if (currentStageInfo) {
      const { progressStart, progressEnd } = currentStageInfo;
      const stageWidth = progressEnd - progressStart;
      const calculatedProgress = progressStart + (stageProgress * stageWidth) / 100;
      setProgress(calculatedProgress);
    }
  }, [currentStage, stageProgress]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
      >
        {/* En-tête */}
        <div className="bg-gradient-to-r from-wisetwin-blue to-blue-600 p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">Préparation de votre formation</h2>
            <p className="text-blue-100 mt-1">
              Veuillez patienter pendant que nous préparons votre environnement de formation
            </p>
          </div>
          {/* Éléments décoratifs d'arrière-plan */}
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute left-10 bottom-0 w-24 h-24 bg-white/10 rounded-full -mb-12"></div>
        </div>

        {/* Contenu principal */}
        <div className="p-6">
          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm">
              <span>Progression globale</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Liste des étapes */}
          <div className="space-y-4">
            {stages.map((stage) => {
              const isActive = currentStage === stage.id;
              const isCompleted = stages.findIndex((s) => s.id === currentStage) > 
                                 stages.findIndex((s) => s.id === stage.id);
              
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0.7 }}
                  animate={{ 
                    opacity: 1,
                    scale: isActive ? 1.02 : 1
                  }}
                  className={`flex items-center p-3 rounded-lg ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                      : "bg-gray-50 dark:bg-gray-800/50"
                  }`}
                >
                  {/* Icône de l'étape */}
                  <div className={`rounded-full p-2 mr-4 ${
                    isCompleted ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
                    isActive ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse" :
                    "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <motion.div
                        animate={isActive ? { rotate: 360 } : {}}
                        transition={isActive ? { 
                          repeat: Infinity, 
                          duration: 2,
                          ease: "linear"
                        } : {}}
                      >
                        {stage.icon}
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Texte de l'étape */}
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      isActive ? "text-blue-700 dark:text-blue-300" : 
                      isCompleted ? "text-green-700 dark:text-green-300" :
                      "text-gray-500 dark:text-gray-400"
                    }`}>
                      {stage.title}
                    </h3>
                    
                    {/* Afficher des infos supplémentaires pour l'étape active */}
                    {isActive && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {stage.id === 'auth' && "Vérification de vos droits d'accès..."}
                        {stage.id === 'course' && "Chargement des détails et modules du cours..."}
                        {stage.id === 'files' && "Téléchargement des ressources 3D..."}
                        {stage.id === 'unity' && "Initialisation de l'environnement immersif..."}
                      </p>
                    )}
                  </div>
                  
                  {/* Indicateur d'état */}
                  {isCompleted && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Complété
                    </span>
                  )}
                  
                  {isActive && !error && (
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse">
                      En cours
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Affichage des erreurs */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <h3 className="text-red-700 dark:text-red-300 font-medium mb-2">
                  Erreur lors du chargement
                </h3>
                <p className="text-sm text-red-600 dark:text-red-400 mb-3">
                  {error}
                </p>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onBack}
                    className="text-gray-600 border-gray-300"
                  >
                    Retour
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={onRetry}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Réessayer
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}