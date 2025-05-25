"use client";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

/**
 * Service API centralisé pour toutes les opérations liées aux cours et formations
 */
export const courseApi = {
  /**
   * Récupère toutes les formations de l'utilisateur
   * @param {string} containerName - Nom du container Azure de l'utilisateur
   * @param {Object} options - Options de filtrage
   * @param {string} options.contextType - Type de contexte ('personal' ou 'organization')
   * @param {string} options.sourceContainer - Container source pour filtrage
   * @returns {Promise<Array>} Liste des formations
   */
  getUserCourses: async (containerName, options = {}) => {
    if (!containerName) {
      return [];
    }
    
    try {
      let url = `${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${containerName}`;
      
      // Ajouter les paramètres de contexte si fournis
      const params = new URLSearchParams();
      if (options.contextType) {
        params.append('contextType', options.contextType);
      }
      if (options.sourceContainer) {
        params.append('sourceContainer', options.sourceContainer);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.trainings) {
        return response.data.trainings || [];
      }
      
      throw new Error(response.data.error || "Échec de récupération des formations");
    } catch (error) {
      console.error("Erreur API getUserCourses:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un cours
   * @param {string} courseId - ID du cours
   * @param {Object} options - Options supplémentaires
   * @param {string} options.organizationId - ID de l'organisation si c'est un cours d'organisation
   * @returns {Promise<Object>} Détails du cours
   */
  getCourseDetails: async (courseId, { organizationId } = {}) => {
    try {
      let url;
      
      if (organizationId) {
        // Cours d'une organisation
        url = `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/organization/${organizationId}/${courseId}`;
      } else {
        // Cours standard
        url = `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${courseId}`;
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Erreur API getCourseDetails pour ${courseId}:`, error);
      throw error;
    }
  },

  /**
   * Enrichit les données d'une formation avec ses détails complets
   * @param {Object} training - Formation à enrichir
   * @returns {Promise<Object>} Formation enrichie
   */
  enrichTrainingWithDetails: async (training) => {
    if (!training) return null;
    
    try {
      // Déterminer la source de la formation
      let source = {
        type: "wisetwin",
        name: "WiseTwin",
        containerName: WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE,
      };

      // Vérifier si c'est une formation d'organisation
      if (training.source && training.source.type === "organization") {
        source = {
          type: "organization",
          name: training.source.name || "Organisation",
          organizationId: training.source.organizationId,
          containerName: training.source.containerName || null,
        };
      }

      // Récupérer les détails du cours
      const courseDetails = await courseApi.getCourseDetails(
        training.id, 
        { organizationId: source.type === "organization" ? source.organizationId : null }
      );

      // Récupérer l'image et les modules
      const imageUrl = courseDetails?.imageUrl || 
                      training.imageUrl || 
                      WISETRAINER_CONFIG.DEFAULT_IMAGE;

      const availableModules = courseDetails?.modules || [];

      // Fusionner avec les modules déjà complétés par l'utilisateur
      const mergedModules = availableModules.map((module) => {
        const userModule = training.modules?.find(m => m.id === module.id);
        return {
          ...module,
          completed: userModule ? userModule.completed : false,
          score: userModule ? userModule.score : 0,
        };
      });

      // Génération d'un ID composite qui inclut la source
      const compositeId = `${training.id}__${source.type}__${
        source.organizationId || "wisetwin"
      }`;

      // Formater le nom du cours si nécessaire
      const formatCourseName = (id) => {
        return id
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };

      return {
        ...training,
        compositeId,
        imageUrl,
        name: courseDetails?.name || training.name || formatCourseName(training.id),
        modules: mergedModules.length > 0 ? mergedModules : training.modules || [],
        totalModules: availableModules.length || training.modules?.length || 3,
        completedModules: training.modules?.filter(m => m.completed).length || 0,
        source,
        trainingUrl: source.type === "organization"
          ? `/wisetrainer/${source.organizationId}/${training.id}`
          : `/wisetrainer/${training.id}`,
      };
    } catch (error) {
      console.error(`Erreur lors de l'enrichissement du cours ${training.id}:`, error);
      
      // Créer une version minimale enrichie en cas d'erreur
      const source = training.source || {
        type: "wisetwin",
        name: "WiseTwin",
        containerName: WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE,
      };
      
      const compositeId = `${training.id}__${source.type}__${source.organizationId || "wisetwin"}`;
      
      const formatCourseName = (id) => {
        return id
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      };
      
      return {
        ...training,
        compositeId,
        name: training.name || formatCourseName(training.id),
        source,
        trainingUrl: source.type === "organization"
          ? `/wisetrainer/${source.organizationId}/${training.id}`
          : `/wisetrainer/${training.id}`,
      };
    }
  },

  /**
   * Inscrit un utilisateur à un cours
   * @param {Object} data - Données d'inscription
   * @param {string} data.courseId - ID du cours
   * @param {string} data.userId - ID de l'utilisateur (optionnel, utilise l'utilisateur courant par défaut)
   * @param {string} data.source - Informations sur la source du cours
   * @returns {Promise<Object>} Résultat de l'opération
   */
  enrollCourse: async (data) => {
    try {
      const response = await axios.post(WISETRAINER_CONFIG.API_ROUTES.ENROLL_COURSE, data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec d'inscription au cours");
    } catch (error) {
      console.error("Erreur API enrollCourse:", error);
      throw error;
    }
  },

  /**
   * Désinscrit un utilisateur d'un cours
   * @param {string} userId - ID de l'utilisateur
   * @param {string} courseId - ID du cours
   * @returns {Promise<Object>} Résultat de l'opération
   */
  unenrollCourse: async (userId, courseId) => {
    try {
      const response = await axios.delete(
        `${WISETRAINER_CONFIG.API_ROUTES.UNENROLL_COURSE}/${userId}/${courseId}`
      );
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec de désinscription du cours");
    } catch (error) {
      console.error("Erreur API unenrollCourse:", error);
      throw error;
    }
  },

  /**
   * Met à jour la progression d'un utilisateur dans un cours
   * @param {Object} data - Données de progression
   * @returns {Promise<Object>} Résultat de l'opération
   */
  updateProgress: async (data) => {
    try {
      const response = await axios.post(WISETRAINER_CONFIG.API_ROUTES.UPDATE_PROGRESS, data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec de mise à jour de la progression");
    } catch (error) {
      console.error("Erreur API updateProgress:", error);
      throw error;
    }
  },

  /**
   * Initialise la progression d'un utilisateur dans un cours
   * @param {Object} data - Données d'initialisation
   * @returns {Promise<Object>} Résultat de l'opération
   */
  initializeProgress: async (data) => {
    try {
      const response = await axios.post(WISETRAINER_CONFIG.API_ROUTES.INITIALIZE_PROGRESS, data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec d'initialisation de la progression");
    } catch (error) {
      console.error("Erreur API initializeProgress:", error);
      throw error;
    }
  },

  /**
   * Récupère un scénario spécifique d'un cours
   * @param {string} courseId - ID du cours
   * @param {string} scenarioId - ID du scénario
   * @returns {Promise<Object>} Données du scénario
   */
  getScenario: async (courseId, scenarioId) => {
    try {
      const response = await axios.get(
        `${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${courseId}/${scenarioId}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur API getScenario:", error);
      throw error;
    }
  },

  /**
   * Sauvegarde les réponses d'un utilisateur à un questionnaire
   * @param {Object} data - Données du questionnaire
   * @returns {Promise<Object>} Résultat de l'opération
   */
  saveQuestionnaire: async (data) => {
    try {
      const response = await axios.post(WISETRAINER_CONFIG.API_ROUTES.SAVE_QUESTIONNAIRE, data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec de sauvegarde du questionnaire");
    } catch (error) {
      console.error("Erreur API saveQuestionnaire:", error);
      throw error;
    }
  },

  /**
   * Récupère la liste des formations WiseTwin disponibles
   * @returns {Promise<Array>} Liste des formations
   */
  getWiseTwinTrainings: async () => {
    try {
      const response = await axios.get(WISETRAINER_CONFIG.API_ROUTES.WISETWIN_TRAININGS);
      return response.data.trainings || [];
    } catch (error) {
      console.error("Erreur API getWiseTwinTrainings:", error);
      throw error;
    }
  },

  /**
   * Récupère les formations recommandées pour l'utilisateur
   * @returns {Promise<Array>} Liste des formations recommandées
   */
  getRecommendedTrainings: async () => {
    try {
      const response = await axios.get(WISETRAINER_CONFIG.API_ROUTES.RECOMMENDED_TRAININGS);
      return response.data.trainings || [];
    } catch (error) {
      console.error("Erreur API getRecommendedTrainings:", error);
      throw error;
    }
  }
};

export default courseApi;