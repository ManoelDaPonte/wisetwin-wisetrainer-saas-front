"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveContext } from "./useActiveContext";
import { useContextCourses } from "./useContextCourses";
import { useUserStats } from "./useUserStats";
import { useToast } from "@/lib/hooks/useToast";

/**
 * Hook simplifié pour la page guide utilisant les hooks contextuels
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage
 * @returns {Object} Données et fonctions pour la page guide
 */
export function useGuideData({ autoLoad = true } = {}) {
  const [lastRefresh, setLastRefresh] = useState(null);
  const { toast } = useToast();
  
  // Contexte actif et données utilisateur
  const {
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    user,
    currentOrganization,
    organizations,
    isLoading: contextLoading,
    canAccess
  } = useActiveContext();
  
  // Cours selon le contexte
  const {
    courses,
    stats: courseStats,
    isLoading: coursesLoading,
    error: coursesError,
    refreshCourses
  } = useContextCourses({ autoLoad });
  
  // Statistiques utilisateur
  const {
    stats: userStats,
    isLoading: statsLoading,
    refreshStats
  } = useUserStats({ autoLoad });
  
  /**
   * Catégorise les formations par statut
   */
  const categorizedTrainings = useMemo(() => {
    if (!courses) {
      return {
        inProgress: [],
        completed: [],
        notStarted: [],
        all: []
      };
    }
    
    const inProgress = courses.filter(c => c.progress > 0 && c.progress < 100);
    const completed = courses.filter(c => c.progress === 100);
    const notStarted = courses.filter(c => c.progress === 0);
    
    return {
      inProgress,
      completed,
      notStarted,
      all: courses
    };
  }, [courses]);
  
  /**
   * Formate les données pour les composants existants
   * (Compatible avec l'ancienne structure)
   */
  const formattedOrganizationData = useMemo(() => {
    if (!isOrganizationMode || !currentOrganization) {
      return [];
    }
    
    // Récupérer les tags de l'utilisateur dans l'organisation
    const userMember = currentOrganization.members?.find(m => m.userId === user?.id);
    const userTags = userMember?.tags || [];
    
    // Filtrer les formations selon les tags
    const taggedTrainings = courses.filter(course => {
      // Si pas de tags sur le cours, il est accessible à tous
      if (!course.tags || course.tags.length === 0) return true;
      
      // Sinon vérifier si l'utilisateur a un tag correspondant
      return course.tags.some(courseTag => 
        userTags.some(userTag => userTag.id === courseTag.id)
      );
    });
    
    return [{
      organization: {
        id: currentOrganization.id,
        name: currentOrganization.name,
        description: currentOrganization.description,
        logoUrl: currentOrganization.logoUrl
      },
      userTags,
      taggedTrainings,
      orgTrainings: courses, // Toutes les formations de l'organisation
      hasCompletedTaggedTrainings: taggedTrainings.some(t => t.progress === 100)
    }];
  }, [isOrganizationMode, currentOrganization, courses, user]);
  
  /**
   * Rafraîchit toutes les données
   */
  const refreshData = useCallback(async () => {
    try {
      console.log("Rafraîchissement des données démarré");
      
      // Rafraîchir en parallèle
      await Promise.all([
        refreshCourses(),
        refreshStats()
      ]);
      
      setLastRefresh(new Date());
      
      toast({
        title: "Données actualisées",
        description: "Les données ont été mises à jour avec succès."
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors du rafraîchissement des données.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [refreshCourses, refreshStats, toast]);
  
  // État de chargement global
  const isLoading = contextLoading || coursesLoading || statsLoading;
  
  // Erreur globale
  const error = coursesError;
  
  return {
    // Contexte actif
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    
    // Données utilisateur
    user,
    
    // Organisations
    organizations: isOrganizationMode ? [currentOrganization] : [],
    organizationsData: formattedOrganizationData,
    hasOrganizations: organizations.length > 0,
    
    // Formations
    trainings: categorizedTrainings.inProgress,
    allTrainings: categorizedTrainings,
    hasAnyTraining: courses.length > 0,
    
    // Statistiques
    trainingStats: {
      ...userStats,
      ...courseStats
    },
    
    // État
    isLoading,
    error,
    canAccess,
    
    // Actions
    refreshData,
    
    // Métadonnées
    lastRefresh
  };
}

export default useGuideData;