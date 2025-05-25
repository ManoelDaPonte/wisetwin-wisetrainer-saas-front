"use client";
import { useEffect, useCallback } from "react";
import { useUserStore } from "../store/userStore";
import { useUser } from "./useUser";

/**
 * Hook composable pour accéder aux statistiques de l'utilisateur
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les stats au montage (défaut: true)
 * @returns {Object} Statistiques et fonctions associées
 */
export function useUserStats({ autoLoad = true } = {}) {
  const { user } = useUser({ autoLoad: false }); // Éviter la duplication de chargement
  
  // Récupérer l'état et les actions liés aux statistiques
  const {
    stats,
    statsLoading,
    statsError,
    fetchUserStats
  } = useUserStore(state => ({
    stats: state.stats,
    statsLoading: state.statsLoading,
    statsError: state.statsError,
    fetchUserStats: state.fetchUserStats
  }));
  
  // Charger les statistiques au montage si l'utilisateur est disponible
  useEffect(() => {
    if (autoLoad && user?.id) {
      fetchUserStats();
    }
  }, [autoLoad, user?.id, fetchUserStats]);
  
  /**
   * Recharge les statistiques de l'utilisateur
   */
  const refreshStats = useCallback(() => {
    if (user?.id) {
      return fetchUserStats(true);
    }
    return null;
  }, [user?.id, fetchUserStats]);
  
  // Calcul des statistiques dérivées
  const averageScore = stats?.questionsAnswered > 0 
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) 
    : 0;
  
  const formattedTimeSpent = stats?.totalTimeSpent 
    ? formatTimeSpent(stats.totalTimeSpent) 
    : "0 min";
  
  // Fonction utilitaire pour formater le temps passé
  function formatTimeSpent(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours}h ${remainingMinutes}min` 
        : `${hours}h`;
    }
  }
  
  return {
    // État brut
    stats,
    isLoading: statsLoading,
    error: statsError,
    
    // Statistiques formatées
    averageScore,
    formattedTimeSpent,
    
    // Statistiques individuelles
    totalTimeSpent: stats?.totalTimeSpent || 0,
    sessionsCompleted: stats?.sessionsCompleted || 0,
    questionsAnswered: stats?.questionsAnswered || 0,
    correctAnswers: stats?.correctAnswers || 0,
    lastActivity: stats?.lastActivity,
    
    // Actions
    refreshStats
  };
}

export default useUserStats;