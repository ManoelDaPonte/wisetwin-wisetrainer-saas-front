"use client";
import { create } from "zustand";
import { courseApi } from "../services/api/courseApi";
import cacheManager from "../utils/cache";

// Durée du cache pour les cours (5 minutes)
const COURSES_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Store Zustand pour la gestion de l'état des cours et formations
 * Centralise toutes les données et opérations liées aux cours
 */
export const useCourseStore = create((set, get) => ({
  // État pour les formations de l'utilisateur
  userCourses: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  
  // État pour la formation active
  currentCourse: null,
  currentCourseId: null,
  courseLoading: false,
  courseError: null,
  
  // État pour le scénario actif
  currentScenario: null,
  currentScenarioId: null,
  scenarioLoading: false,
  scenarioError: null,
  
  /**
   * Définit le container Azure utilisé pour les requêtes
   * @param {string} containerName - Nom du container Azure
   */
  setAzureContainer: (containerName) => {
    set({ azureContainer: containerName });
  },
  
  /**
   * Récupère toutes les formations de l'utilisateur
   * @param {string} containerName - Nom du container Azure
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des formations
   */
  fetchUserCourses: async (containerName, force = false) => {
    if (!containerName) return [];
    
    // Vérifier le cache
    const cacheKey = `user_courses_${containerName}`;
    if (!force && cacheManager.has(cacheKey, COURSES_CACHE_DURATION)) {
      const cachedCourses = cacheManager.get(cacheKey);
      set({ 
        userCourses: cachedCourses,
        isLoading: false
      });
      return cachedCourses;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Récupérer les formations de base
      const courses = await courseApi.getUserCourses(containerName);
      
      // Enrichir chaque formation avec ses détails
      const enrichedCourses = await Promise.all(
        courses.map(course => courseApi.enrichTrainingWithDetails(course))
      );
      
      // Mettre à jour le store et le cache
      set({ 
        userCourses: enrichedCourses, 
        isLoading: false, 
        lastFetched: Date.now(),
        error: null
      });
      
      cacheManager.set(cacheKey, enrichedCourses);
      
      return enrichedCourses;
    } catch (error) {
      set({ 
        error: error.message || "Erreur lors de la récupération des formations", 
        isLoading: false 
      });
      return [];
    }
  },
  
  /**
   * Définit le cours actif
   * @param {string} courseId - ID du cours à définir comme actif
   */
  setCurrentCourseId: (courseId) => {
    // Mettre à jour uniquement l'ID
    set({ currentCourseId: courseId });
    
    // Si le cours est déjà en cache dans la liste, le définir comme actuel
    const cachedCourse = get().userCourses.find(course => 
      course.id === courseId || course.compositeId?.includes(courseId)
    );
    
    if (cachedCourse) {
      set({ currentCourse: cachedCourse });
    } else {
      // Sinon réinitialiser le cours actif
      set({ currentCourse: null });
    }
  },
  
  /**
   * Récupère les détails d'un cours spécifique
   * @param {string} courseId - ID du cours
   * @param {Object} options - Options supplémentaires
   * @param {string} options.organizationId - ID de l'organisation si c'est un cours d'organisation
   * @param {boolean} options.force - Force le rechargement même si le cache est valide
   * @returns {Promise<Object>} - Détails du cours
   */
  fetchCourseDetails: async (courseId, { organizationId = null, force = false } = {}) => {
    if (!courseId) return null;
    
    // Créer une clé de cache qui prend en compte l'organisation
    const cacheKey = organizationId 
      ? `course_details_${organizationId}_${courseId}`
      : `course_details_${courseId}`;
    
    // Vérifier le cache
    if (!force && cacheManager.has(cacheKey)) {
      const cachedCourse = cacheManager.get(cacheKey);
      set({ 
        currentCourse: cachedCourse,
        currentCourseId: courseId,
        courseLoading: false 
      });
      return cachedCourse;
    }
    
    set({ courseLoading: true, courseError: null });
    
    try {
      // Récupérer les détails du cours
      const courseDetails = await courseApi.getCourseDetails(courseId, { organizationId });
      
      set({ 
        currentCourse: courseDetails, 
        currentCourseId: courseId,
        courseLoading: false,
        courseError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, courseDetails);
      
      return courseDetails;
    } catch (error) {
      set({ 
        courseError: error.message || "Erreur lors de la récupération des détails du cours", 
        courseLoading: false 
      });
      return null;
    }
  },
  
  /**
   * S'inscrit à un cours
   * @param {Object} data - Données d'inscription
   * @returns {Promise<Object>} Résultat de l'opération
   */
  enrollCourse: async (data) => {
    try {
      const result = await courseApi.enrollCourse(data);
      
      // Invalider le cache des formations utilisateur
      if (result.success) {
        cacheManager.invalidateByPrefix('user_courses_');
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de l'inscription au cours:", error);
      throw error;
    }
  },
  
  /**
   * Se désinscrit d'un cours
   * @param {string} userId - ID de l'utilisateur
   * @param {string} courseId - ID du cours
   * @returns {Promise<Object>} Résultat de l'opération
   */
  unenrollCourse: async (userId, courseId) => {
    try {
      const result = await courseApi.unenrollCourse(userId, courseId);
      
      // Invalider le cache des formations utilisateur
      if (result.success) {
        cacheManager.invalidateByPrefix('user_courses_');
        
        // Mettre à jour la liste des formations si elle existe déjà
        if (get().userCourses.length > 0) {
          set(state => ({
            userCourses: state.userCourses.filter(course => 
              course.id !== courseId && !course.compositeId?.includes(courseId)
            )
          }));
        }
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la désinscription du cours:", error);
      throw error;
    }
  },
  
  /**
   * Récupère un scénario spécifique
   * @param {string} courseId - ID du cours
   * @param {string} scenarioId - ID du scénario
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Object>} Données du scénario
   */
  fetchScenario: async (courseId, scenarioId, force = false) => {
    if (!courseId || !scenarioId) return null;
    
    const cacheKey = `scenario_${courseId}_${scenarioId}`;
    
    // Vérifier le cache
    if (!force && cacheManager.has(cacheKey)) {
      const cachedScenario = cacheManager.get(cacheKey);
      set({ 
        currentScenario: cachedScenario,
        currentScenarioId: scenarioId,
        scenarioLoading: false 
      });
      return cachedScenario;
    }
    
    set({ scenarioLoading: true, scenarioError: null });
    
    try {
      const scenario = await courseApi.getScenario(courseId, scenarioId);
      
      set({ 
        currentScenario: scenario, 
        currentScenarioId: scenarioId,
        scenarioLoading: false,
        scenarioError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, scenario);
      
      return scenario;
    } catch (error) {
      set({ 
        scenarioError: error.message || "Erreur lors de la récupération du scénario", 
        scenarioLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Met à jour la progression de l'utilisateur
   * @param {Object} data - Données de progression
   * @returns {Promise<Object>} Résultat de l'opération
   */
  updateProgress: async (data) => {
    try {
      const result = await courseApi.updateProgress(data);
      
      // Invalider le cache des formations
      if (result.success) {
        cacheManager.invalidateByPrefix('user_courses_');
        
        // Mettre à jour la progression dans la liste actuelle si disponible
        if (get().userCourses.length > 0) {
          set(state => {
            const updatedCourses = state.userCourses.map(course => {
              if (course.id === data.courseId) {
                return {
                  ...course,
                  progress: data.progress,
                  modules: course.modules.map(module => {
                    if (module.id === data.moduleId) {
                      return {
                        ...module,
                        completed: data.completed || module.completed,
                        score: data.score || module.score
                      };
                    }
                    return module;
                  })
                };
              }
              return course;
            });
            
            return { userCourses: updatedCourses };
          });
        }
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la progression:", error);
      throw error;
    }
  },
  
  /**
   * Sauvegarde les réponses d'un utilisateur au questionnaire
   * @param {Object} data - Données du questionnaire
   * @returns {Promise<Object>} Résultat de l'opération
   */
  saveQuestionnaire: async (data) => {
    try {
      const result = await courseApi.saveQuestionnaire(data);
      
      // Invalider le cache des formations et du scénario
      if (result.success) {
        cacheManager.invalidateByPrefix('user_courses_');
        cacheManager.invalidate(`scenario_${data.courseId}_${data.scenarioId}`);
      }
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du questionnaire:", error);
      throw error;
    }
  },
  
  /**
   * Récupère les formations WiseTwin disponibles
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} Liste des formations
   */
  fetchWiseTwinTrainings: async (force = false) => {
    const cacheKey = 'wisetwin_trainings';
    
    // Vérifier le cache
    if (!force && cacheManager.has(cacheKey)) {
      return cacheManager.get(cacheKey);
    }
    
    try {
      const trainings = await courseApi.getWiseTwinTrainings();
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, trainings);
      
      return trainings;
    } catch (error) {
      console.error("Erreur lors de la récupération des formations WiseTwin:", error);
      throw error;
    }
  },
  
  /**
   * Récupère les formations recommandées
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} Liste des formations recommandées
   */
  fetchRecommendedTrainings: async (force = false) => {
    const cacheKey = 'recommended_trainings';
    
    // Vérifier le cache
    if (!force && cacheManager.has(cacheKey)) {
      return cacheManager.get(cacheKey);
    }
    
    try {
      const trainings = await courseApi.getRecommendedTrainings();
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, trainings);
      
      return trainings;
    } catch (error) {
      console.error("Erreur lors de la récupération des formations recommandées:", error);
      throw error;
    }
  },
  
  /**
   * Réinitialise l'état du store
   */
  resetState: () => {
    set({
      userCourses: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      currentCourse: null,
      currentCourseId: null,
      courseLoading: false,
      courseError: null,
      currentScenario: null,
      currentScenarioId: null,
      scenarioLoading: false,
      scenarioError: null,
      azureContainer: null
    });
  }
}));

export default useCourseStore;