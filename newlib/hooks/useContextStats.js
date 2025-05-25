"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveContext } from "./useActiveContext";
import { useContextCourses } from "./useContextCourses";
import { cacheManager } from "../utils/cache";

/**
 * Hook pour récupérer les statistiques selon le contexte actif
 * Fournit des statistiques adaptées au mode personnel ou organisation
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage
 * @returns {Object} Statistiques contextuelles
 */
export function useContextStats({ autoLoad = true } = {}) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    user,
    currentOrganization
  } = useActiveContext();
  
  const { courses } = useContextCourses({ autoLoad: false });
  
  /**
   * Calcule les statistiques basées sur les cours
   */
  const courseBasedStats = useMemo(() => {
    if (!courses || courses.length === 0) {
      return {
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        notStartedCourses: 0,
        completionRate: 0,
        averageProgress: 0,
        totalTrainingTime: 0
      };
    }
    
    const completed = courses.filter(c => c.progress === 100);
    const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100);
    const notStarted = courses.filter(c => c.progress === 0);
    
    // Calculer le temps total de formation (en minutes)
    const totalTime = courses.reduce((acc, course) => {
      // Si le cours a un temps estimé et un progress
      if (course.estimatedTime && course.progress > 0) {
        return acc + (course.estimatedTime * course.progress / 100);
      }
      return acc;
    }, 0);
    
    // Calculer la progression moyenne
    const avgProgress = courses.length > 0
      ? Math.round(courses.reduce((acc, c) => acc + c.progress, 0) / courses.length)
      : 0;
    
    return {
      totalCourses: courses.length,
      completedCourses: completed.length,
      inProgressCourses: inProgress.length,
      notStartedCourses: notStarted.length,
      completionRate: courses.length > 0 
        ? Math.round((completed.length / courses.length) * 100)
        : 0,
      averageProgress: avgProgress,
      totalTrainingTime: Math.round(totalTime)
    };
  }, [courses]);
  
  /**
   * Charge les statistiques depuis l'API selon le contexte
   */
  const loadStats = useCallback(async (force = false) => {
    if (!user?.id) return null;
    
    // Créer une clé de cache contextuelle
    const cacheKey = isPersonalMode
      ? `stats_personal_${user.id}`
      : `stats_org_${currentOrganization?.id}_${user.id}`;
    
    // Vérifier le cache
    if (!force && cacheManager.has(cacheKey, 300000)) { // 5 minutes
      const cachedStats = cacheManager.get(cacheKey);
      setStats(cachedStats);
      return cachedStats;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/db/stats/user/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contextType: activeContext.type,
          organizationId: isOrganizationMode ? currentOrganization?.id : null
        })
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const data = await response.json();
      
      // Enrichir avec les stats calculées
      const enrichedStats = {
        ...data.stats,
        ...courseBasedStats,
        contextType: activeContext.type,
        contextName: activeContext.name
      };
      
      setStats(enrichedStats);
      cacheManager.set(cacheKey, enrichedStats);
      
      return enrichedStats;
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError(err.message);
      
      // Fallback vers les stats calculées
      const fallbackStats = {
        ...courseBasedStats,
        contextType: activeContext.type,
        contextName: activeContext.name
      };
      
      setStats(fallbackStats);
      return fallbackStats;
    } finally {
      setIsLoading(false);
    }
  }, [
    user,
    isPersonalMode,
    isOrganizationMode,
    currentOrganization,
    activeContext,
    courseBasedStats
  ]);
  
  // Charger automatiquement au changement de contexte
  useEffect(() => {
    if (autoLoad && user?.id) {
      loadStats();
    }
  }, [autoLoad, user?.id, activeContext.type, activeContext.organizationId, loadStats]);
  
  /**
   * Rafraîchit les statistiques
   */
  const refreshStats = useCallback(() => {
    return loadStats(true);
  }, [loadStats]);
  
  /**
   * Récupère des statistiques spécifiques selon le contexte
   */
  const getContextualInsights = useCallback(() => {
    if (!stats) return null;
    
    if (isPersonalMode) {
      return {
        type: 'personal',
        insights: [
          {
            label: 'Formations complétées ce mois',
            value: stats.monthlyCompleted || 0,
            trend: stats.monthlyTrend || 'stable'
          },
          {
            label: 'Temps de formation total',
            value: `${Math.round(stats.totalTrainingTime / 60)}h`,
            description: 'Depuis le début'
          },
          {
            label: 'Série actuelle',
            value: stats.currentStreak || 0,
            unit: 'jours'
          }
        ]
      };
    } else {
      // Mode organisation
      return {
        type: 'organization',
        insights: [
          {
            label: 'Rang dans l\'organisation',
            value: stats.organizationRank || 'N/A',
            total: currentOrganization?.members?.length
          },
          {
            label: 'Formations requises complétées',
            value: `${stats.requiredCompleted || 0}/${stats.requiredTotal || 0}`,
            percentage: stats.requiredCompletionRate || 0
          },
          {
            label: 'Score moyen',
            value: `${stats.averageScore || 0}%`,
            comparison: stats.orgAverageScore ? `Org: ${stats.orgAverageScore}%` : null
          }
        ]
      };
    }
  }, [stats, isPersonalMode, currentOrganization]);
  
  return {
    // Statistiques principales
    stats: stats || courseBasedStats,
    
    // Statistiques détaillées
    courseStats: courseBasedStats,
    
    // Insights contextuels
    insights: getContextualInsights(),
    
    // État
    isLoading,
    error,
    hasStats: !!stats,
    
    // Actions
    refreshStats,
    
    // Contexte
    contextType: activeContext.type,
    contextName: activeContext.name
  };
}

export default useContextStats;