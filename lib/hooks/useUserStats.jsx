//lib/hooks/useUserStats.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { usePathname } from "next/navigation";
import { useCurrentTraining } from "@/lib/hooks/useCurrentTraining";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

// Durée du cache en ms (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache global pour partager les données entre les instances du hook
let globalCache = {
  stats: null,
  lastFetched: null
};

export function useUserStats() {
  const { containerName, isLoading: containerLoading } = useAzureContainer();
  const { currentTrainings, ensureTrainings } = useCurrentTraining();
  const pathname = usePathname();
  const [stats, setStats] = useState(globalCache.stats || getDefaultStats());
  const [isLoading, setIsLoading] = useState(globalCache.stats === null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // Valeurs par défaut pour les statistiques
  function getDefaultStats() {
    return {
      digitalTwin: 0,
      wiseTrainer: 0,
      totalTime: 0,
      completionRate: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      successRate: 0,
      averageScore: 0,
      sessionsCompleted: 0
    };
  }

  // Fonction pour calculer le taux de complétion moyen
  const calculateCompletionRate = (trainings) => {
    if (!trainings || trainings.length === 0) return 0;

    const totalProgress = trainings.reduce(
      (sum, training) => sum + (training.progress || 0),
      0
    );
    return Math.round(totalProgress / trainings.length);
  };

  // Fonction pour calculer le score moyen à partir des formations
  const calculateAverageScore = (trainings) => {
    const completedTrainings = trainings.filter((t) => t.progress === 100);
    if (completedTrainings.length === 0) return 0;

    // Moyenne des scores de modules pour chaque formation
    const totalScore = completedTrainings.reduce((sum, training) => {
      // Calculer le score moyen de cette formation
      const moduleScores =
        training.modules
          ?.filter((m) => m.completed)
          .map((m) => m.score) || [];
      const trainingAvg =
        moduleScores.length > 0
          ? Math.round(
              moduleScores.reduce((a, b) => a + b, 0) /
                moduleScores.length
            )
          : 0;
      return sum + trainingAvg;
    }, 0);

    return Math.round(totalScore / completedTrainings.length);
  };

  // Fonction pour récupérer les statistiques utilisateur
  const fetchUserStats = useCallback(async (force = false) => {
    // Si aucun container, impossible de récupérer les données
    if (!containerName) return getDefaultStats();
    
    // Vérifier si nous avons déjà des données récentes en cache global
    if (
      !force &&
      globalCache.stats &&
      globalCache.lastFetched &&
      Date.now() - globalCache.lastFetched < CACHE_DURATION
    ) {
      setStats(globalCache.stats);
      setIsLoading(false);
      return globalCache.stats;
    }

    // Éviter les requêtes multiples simultanées
    if (isPending) return globalCache.stats || getDefaultStats();

    try {
      setIsPending(true);
      setIsLoading(true);
      setError(null);

      // S'assurer que nous avons les données de formations pour les calculs locaux
      const trainings = await ensureTrainings();

      // Récupérer les statistiques depuis l'API
      const response = await axios.get(
        `${WISETRAINER_CONFIG.API_ROUTES.STATS_USER}/${containerName}`
      );

      let userStats = getDefaultStats();

      if (response.data) {
        // Calculer le taux de réussite si disponible
        let successRate = 0;
        if (
          response.data.questionsAnswered &&
          response.data.questionsAnswered > 0
        ) {
          successRate = Math.round(
            (response.data.correctAnswers /
              response.data.questionsAnswered) *
              100
          );
        }

        // Calculer le temps total en heures
        const totalTimeInHours = response.data.totalTimeSpent
          ? Math.max(1, Math.round(response.data.totalTimeSpent / 60)) // Convertir minutes en heures, minimum 1h
          : 0;

        userStats = {
          digitalTwin: 0, // Pas encore implémenté
          wiseTrainer:
            trainings.length || response.data.activeCourses || 0,
          totalTime: totalTimeInHours,
          completionRate:
            response.data.completionRate ||
            calculateCompletionRate(trainings),
          questionsAnswered: response.data.questionsAnswered || 0,
          correctAnswers: response.data.correctAnswers || 0,
          successRate: successRate,
          // Calculer le score moyen à partir des formations
          averageScore:
            response.data.averageScore || calculateAverageScore(trainings),
          // Ajouter le nombre de sessions complétées
          sessionsCompleted: response.data.sessionsCompleted || 0,
        };
      } else {
        // En cas d'absence de données, calculer localement
        userStats = {
          digitalTwin: 0,
          wiseTrainer: trainings.length || 0,
          totalTime: 1, // Valeur minimale pour éviter de montrer 0h
          completionRate: calculateCompletionRate(trainings),
          questionsAnswered: 0,
          correctAnswers: 0,
          successRate: 0,
          averageScore: calculateAverageScore(trainings),
          sessionsCompleted: 0,
        };
      }

      // Mettre à jour le cache global et l'état local
      globalCache = {
        stats: userStats,
        lastFetched: Date.now()
      };
      
      setStats(userStats);
      return userStats;
    } catch (err) {
      console.error(
        "Erreur lors de la récupération des statistiques utilisateur:",
        err
      );
      setError(err);
      
      // En cas d'erreur, calculer les statistiques localement
      const localStats = {
        digitalTwin: 0,
        wiseTrainer: currentTrainings.length || 0,
        totalTime: 1,
        completionRate: calculateCompletionRate(currentTrainings),
        questionsAnswered: 0,
        correctAnswers: 0,
        successRate: 0,
        averageScore: calculateAverageScore(currentTrainings),
        sessionsCompleted: 0,
      };
      
      setStats(localStats);
      return localStats;
    } finally {
      setIsLoading(false);
      setIsPending(false);
    }
  }, [containerName, isPending, currentTrainings, ensureTrainings]);

  // Détermine si les statistiques doivent être chargées immédiatement
  const shouldLoadImmediately = useCallback(() => {
    // Pages qui nécessitent les statistiques dès le chargement
    const immediateLoadPages = [
      '/mon-profil',
    ];
    
    // Vérifier si le chemin actuel commence par l'un des préfixes ci-dessus
    return pathname && immediateLoadPages.some(page => pathname.startsWith(page));
  }, [pathname]);

  // Effet pour charger les statistiques uniquement lorsque nécessaire
  useEffect(() => {
    const needsLoading = shouldLoadImmediately();
    
    if (containerName && !containerLoading) {
      if (needsLoading) {
        // Charger les données immédiatement si on est sur une page qui en a besoin
        fetchUserStats();
      } else {
        // Sinon, utiliser le cache global s'il est disponible
        if (globalCache.stats) {
          setStats(globalCache.stats);
        }
        setIsLoading(false);
      }
    } else if (!containerLoading) {
      // Si le container n'est pas disponible, ne pas montrer de chargement
      setIsLoading(false);
    }
  }, [containerName, containerLoading, fetchUserStats, shouldLoadImmediately]);

  // Fonction pour rafraîchir manuellement les statistiques
  const refresh = useCallback(() => {
    if (containerName) {
      return fetchUserStats(true);
    }
  }, [containerName, fetchUserStats]);

  // Fonction pour garantir que les statistiques sont chargées avant utilisation
  const ensureStats = useCallback(async () => {
    // Si on a des données récentes dans le cache, les utiliser
    if (
      globalCache.stats && 
      globalCache.lastFetched && 
      Date.now() - globalCache.lastFetched < CACHE_DURATION
    ) {
      setStats(globalCache.stats);
      return globalCache.stats;
    }
    
    // Sinon, charger les données
    return await fetchUserStats();
  }, [fetchUserStats]);

  return {
    stats,
    isLoading: isLoading || containerLoading,
    error,
    refresh,
    lastRefresh: globalCache.lastFetched,
    ensureStats, // Fonction pour garantir que les statistiques sont chargées
  };
}

export default useUserStats;