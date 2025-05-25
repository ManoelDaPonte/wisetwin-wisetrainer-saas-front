"use client";
import { useEffect, useCallback, useMemo } from "react";
import { useCourseStore } from "../store/courseStore";
import { useActiveContext } from "./useActiveContext";
import { useOrganization } from "./useOrganization";

/**
 * Hook pour récupérer les cours selon le contexte actif
 * S'adapte automatiquement entre mode personnel et organisation
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage
 * @returns {Object} Données et actions pour les cours contextuels
 */
export function useContextCourses({ autoLoad = true } = {}) {
  const {
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    activeContainer,
    user,
    currentOrganization,
    canAccess
  } = useActiveContext();
  
  // Actions du store de cours
  const {
    userCourses,
    isLoading,
    error,
    fetchUserCourses,
    setCurrentCourseId,
    enrollCourse,
    unenrollCourse,
    updateProgress,
    fetchCourseDetails
  } = useCourseStore();
  
  // Hook organisation pour les builds et tags
  const { 
    organizationBuilds,
    fetchOrganizationBuilds,
    organizationTags,
    fetchOrganizationTags
  } = useOrganization({ autoLoad: false });
  
  /**
   * Charge les cours selon le contexte actif
   * @param {boolean} force - Force le rechargement
   */
  const loadContextCourses = useCallback(async (force = false) => {
    if (!canAccess || !activeContainer) {
      console.log("Cannot load courses: missing access or container");
      return [];
    }
    
    if (isPersonalMode) {
      // Mode personnel : charger les cours personnels de l'utilisateur
      return await fetchUserCourses(user.id, activeContainer, force);
    } else if (isOrganizationMode && currentOrganization) {
      // Mode organisation : charger les builds de l'organisation
      await fetchOrganizationBuilds(currentOrganization.id, force);
      
      // Charger aussi les tags pour filtrer les cours
      await fetchOrganizationTags(currentOrganization.id, force);
      
      // Les cours de l'organisation sont dans organizationBuilds
      // On devrait mapper les builds vers le format de cours
      return organizationBuilds.wisetrainer || [];
    }
    
    return [];
  }, [
    canAccess,
    activeContainer,
    isPersonalMode,
    isOrganizationMode,
    user,
    currentOrganization,
    fetchUserCourses,
    fetchOrganizationBuilds,
    fetchOrganizationTags,
    organizationBuilds
  ]);
  
  /**
   * Filtre les cours selon les tags de l'utilisateur (en mode organisation)
   */
  const getFilteredCourses = useCallback(() => {
    if (isPersonalMode) {
      // En mode personnel, tous les cours sont accessibles
      return userCourses;
    }
    
    if (!currentOrganization || !organizationBuilds.wisetrainer) {
      return [];
    }
    
    // Récupérer les tags de l'utilisateur dans cette organisation
    const userMember = currentOrganization.members?.find(m => m.userId === user?.id);
    const userTagIds = userMember?.tags?.map(t => t.id) || [];
    
    // Si l'utilisateur n'a pas de tags, il voit tous les cours
    if (userTagIds.length === 0) {
      return organizationBuilds.wisetrainer;
    }
    
    // Filtrer les cours selon les tags
    return organizationBuilds.wisetrainer.filter(course => {
      // Vérifier si le cours a des tags associés
      const courseTagAssociations = organizationTags
        .filter(tag => userTagIds.includes(tag.id))
        .flatMap(tag => tag.trainingAssociations || []);
      
      // Le cours est accessible si :
      // 1. Il n'a pas de tags (accessible à tous)
      // 2. Il a au moins un tag en commun avec l'utilisateur
      return courseTagAssociations.length === 0 || 
             courseTagAssociations.some(assoc => assoc.trainingId === course.id);
    });
  }, [
    isPersonalMode,
    userCourses,
    currentOrganization,
    organizationBuilds,
    organizationTags,
    user
  ]);
  
  // Charger automatiquement les cours au changement de contexte
  useEffect(() => {
    if (autoLoad && canAccess) {
      loadContextCourses();
    }
  }, [autoLoad, canAccess, activeContext.type, activeContext.organizationId, loadContextCourses]);
  
  /**
   * S'inscrire à un cours selon le contexte
   * @param {string} courseId - ID du cours
   */
  const enrollInContextCourse = useCallback(async (courseId) => {
    if (!user?.id) return null;
    
    const enrollmentData = {
      userId: user.id,
      courseId,
      organizationId: isOrganizationMode ? currentOrganization?.id : null,
      sourceType: isPersonalMode ? 'personal' : 'organization'
    };
    
    const result = await enrollCourse(enrollmentData);
    
    // Recharger les cours après inscription
    if (result.success) {
      await loadContextCourses(true);
    }
    
    return result;
  }, [
    user,
    isPersonalMode,
    isOrganizationMode,
    currentOrganization,
    enrollCourse,
    loadContextCourses
  ]);
  
  /**
   * Se désinscrire d'un cours
   * @param {string} courseId - ID du cours
   */
  const unenrollFromContextCourse = useCallback(async (courseId) => {
    if (!user?.id) return null;
    
    const result = await unenrollCourse(user.id, courseId);
    
    // Recharger les cours après désinscription
    if (result.success) {
      await loadContextCourses(true);
    }
    
    return result;
  }, [user, unenrollCourse, loadContextCourses]);
  
  /**
   * Récupère les cours filtrés et enrichis avec les métadonnées du contexte
   */
  const contextCourses = useMemo(() => {
    const filteredCourses = getFilteredCourses();
    
    // Enrichir les cours avec les informations du contexte
    return filteredCourses.map(course => ({
      ...course,
      // Ajouter l'identifiant composite pour le routage
      compositeId: isPersonalMode 
        ? `${course.id}__personal__${user?.id}`
        : `${course.id}__organization__${currentOrganization?.id}`,
      // Ajouter les informations de source
      source: {
        type: isPersonalMode ? "personal" : "organization",
        name: isPersonalMode ? "Mode Personnel" : currentOrganization?.name,
        organizationId: isOrganizationMode ? currentOrganization?.id : null,
        containerName: activeContainer
      }
    }));
  }, [
    getFilteredCourses,
    isPersonalMode,
    isOrganizationMode,
    user,
    currentOrganization,
    activeContainer
  ]);
  
  /**
   * Statistiques des cours
   */
  const courseStats = useMemo(() => {
    const total = contextCourses.length;
    const completed = contextCourses.filter(c => c.progress === 100).length;
    const inProgress = contextCourses.filter(c => c.progress > 0 && c.progress < 100).length;
    const notStarted = contextCourses.filter(c => c.progress === 0).length;
    
    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [contextCourses]);
  
  return {
    // Données
    courses: contextCourses,
    isLoading,
    error,
    
    // Métadonnées du contexte
    contextType: activeContext.type,
    contextName: activeContext.name,
    contextId: isPersonalMode ? user?.id : currentOrganization?.id,
    
    // Statistiques
    stats: courseStats,
    
    // Actions
    refreshCourses: () => loadContextCourses(true),
    enrollCourse: enrollInContextCourse,
    unenrollCourse: unenrollFromContextCourse,
    selectCourse: setCurrentCourseId,
    
    // Utilitaires
    getCourseById: (courseId) => contextCourses.find(c => c.id === courseId),
    hasCourses: contextCourses.length > 0,
    canEnroll: canAccess && !isLoading
  };
}

export default useContextCourses;