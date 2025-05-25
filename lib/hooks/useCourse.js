"use client";
import { useEffect, useCallback } from "react";
import { useCourseStore } from "../store/courseStore";
import { useRouter } from "next/navigation";

/**
 * Hook composable pour gérer un cours spécifique
 * 
 * @param {Object} options - Options du hook
 * @param {string} options.courseId - ID du cours
 * @param {string} options.organizationId - ID de l'organisation (pour les cours d'organisation)
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage
 * @returns {Object} Données et fonctions pour interagir avec un cours spécifique
 */
export function useCourse({
  courseId = null,
  organizationId = null,
  autoLoad = true
} = {}) {
  const router = useRouter();
  
  // Récupérer l'état et les actions du store
  const {
    currentCourse,
    currentCourseId,
    courseLoading,
    courseError,
    userCourses,
    isLoading: coursesLoading,
    setCurrentCourseId,
    fetchCourseDetails,
    enrollCourse,
    unenrollCourse,
    updateProgress
  } = useCourseStore(state => ({
    currentCourse: state.currentCourse,
    currentCourseId: state.currentCourseId,
    courseLoading: state.courseLoading,
    courseError: state.courseError,
    userCourses: state.userCourses,
    isLoading: state.isLoading,
    setCurrentCourseId: state.setCurrentCourseId,
    fetchCourseDetails: state.fetchCourseDetails,
    enrollCourse: state.enrollCourse,
    unenrollCourse: state.unenrollCourse,
    updateProgress: state.updateProgress
  }));
  
  // Si un ID de cours est fourni, le définir comme courant
  useEffect(() => {
    if (courseId && courseId !== currentCourseId) {
      setCurrentCourseId(courseId);
      
      // Charger les détails du cours si autoLoad est true
      if (autoLoad) {
        fetchCourseDetails(courseId, { organizationId });
      }
    }
  }, [courseId, currentCourseId, organizationId, autoLoad, setCurrentCourseId, fetchCourseDetails]);
  
  /**
   * Vérifie si l'utilisateur est inscrit à ce cours
   * @returns {boolean} True si l'utilisateur est inscrit
   */
  const isEnrolled = useCallback(() => {
    if (!courseId || userCourses.length === 0) return false;
    
    return userCourses.some(course => 
      course.id === courseId || 
      (course.compositeId && course.compositeId.includes(courseId))
    );
  }, [courseId, userCourses]);
  
  /**
   * Récupère le cours de la liste des cours utilisateur si disponible
   * @returns {Object|null} Cours avec les données utilisateur ou null
   */
  const getUserCourse = useCallback(() => {
    if (!courseId || userCourses.length === 0) return null;
    
    return userCourses.find(course => 
      course.id === courseId || 
      (course.compositeId && course.compositeId.includes(courseId))
    );
  }, [courseId, userCourses]);
  
  /**
   * Inscrit l'utilisateur au cours actuel
   * @param {Object} data - Données supplémentaires pour l'inscription
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const enrollCurrentCourse = useCallback(async (data = {}) => {
    if (!currentCourse) return null;
    
    const enrollmentData = {
      courseId: currentCourse.id,
      ...data
    };
    
    try {
      const result = await enrollCourse(enrollmentData);
      
      // Rediriger vers la page du cours si l'inscription a réussi
      if (result.success) {
        const courseUrl = organizationId
          ? `/wisetrainer/${organizationId}/${courseId}`
          : `/wisetrainer/${courseId}`;
          
        router.push(courseUrl);
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de l'inscription au cours:", error);
      return { success: false, error: error.message };
    }
  }, [currentCourse, organizationId, courseId, enrollCourse, router]);
  
  /**
   * Désinscrit l'utilisateur du cours actuel
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const unenrollCurrentCourse = useCallback(async (userId) => {
    if (!currentCourse || !userId) return null;
    
    try {
      const result = await unenrollCourse(userId, currentCourse.id);
      
      // Rediriger vers la page de guide si la désinscription a réussi
      if (result.success) {
        router.push('/guide');
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la désinscription du cours:", error);
      return { success: false, error: error.message };
    }
  }, [currentCourse, unenrollCourse, router]);
  
  /**
   * Met à jour la progression de l'utilisateur dans le cours
   * @param {Object} data - Données de progression
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const updateCourseProgress = useCallback(async (data) => {
    if (!currentCourse) return null;
    
    const progressData = {
      courseId: currentCourse.id,
      ...data
    };
    
    try {
      return await updateProgress(progressData);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la progression:", error);
      return { success: false, error: error.message };
    }
  }, [currentCourse, updateProgress]);
  
  return {
    // Cours actuel
    course: currentCourse,
    courseId: currentCourseId,
    isLoading: courseLoading || coursesLoading,
    error: courseError,
    
    // Données utilisateur
    userCourse: getUserCourse(),
    isEnrolled: isEnrolled(),
    
    // Données dérivées
    progress: getUserCourse()?.progress || 0,
    completedModules: getUserCourse()?.completedModules || 0,
    totalModules: currentCourse?.totalModules || getUserCourse()?.totalModules || 0,
    
    // Actions
    loadCourseDetails: (force = false) => fetchCourseDetails(courseId, { organizationId, force }),
    enroll: enrollCurrentCourse,
    unenroll: unenrollCurrentCourse,
    updateProgress: updateCourseProgress
  };
}

export default useCourse;