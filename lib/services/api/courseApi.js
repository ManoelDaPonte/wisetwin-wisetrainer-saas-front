"use client";
import axios from "axios";

/**
 * Service API centralisé pour toutes les opérations liées aux cours et formations
 */
export const courseApi = {
  /**
   * Récupère tous les cours disponibles
   * @param {Object} options - Options de filtrage
   * @param {string} options.type - Type de cours (wisetrainer, wisetwin)
   * @param {string} options.organizationId - ID de l'organisation
   * @param {string} options.status - Statut des cours (active, archived)
   * @returns {Promise<Array>} Liste des cours
   */
  getAllCourses: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.organizationId) params.append('organizationId', options.organizationId);
      if (options.status) params.append('status', options.status);
      
      const url = `/api/v1/courses${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data.courses || [];
    } catch (error) {
      console.error("Erreur API getAllCourses:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un cours
   * @param {string} courseId - ID du cours
   * @returns {Promise<Object>} Détails du cours
   */
  getCourseDetails: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API getCourseDetails:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau cours
   * @param {Object} data - Données du cours
   * @returns {Promise<Object>} Cours créé
   */
  createCourse: async (data) => {
    try {
      const response = await axios.post('/api/v1/courses', data);
      return response.data;
    } catch (error) {
      console.error("Erreur API createCourse:", error);
      throw error;
    }
  },

  /**
   * Met à jour un cours
   * @param {string} courseId - ID du cours
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Cours mis à jour
   */
  updateCourse: async (courseId, data) => {
    try {
      const response = await axios.patch(`/api/v1/courses/${courseId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur API updateCourse:", error);
      throw error;
    }
  },

  /**
   * Supprime un cours
   * @param {string} courseId - ID du cours
   * @returns {Promise<Object>} Résultat de l'opération
   */
  deleteCourse: async (courseId) => {
    try {
      const response = await axios.delete(`/api/v1/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API deleteCourse:", error);
      throw error;
    }
  },

  /**
   * Inscrit l'utilisateur actuel à un cours
   * @param {string} courseId - ID du cours
   * @returns {Promise<Object>} Résultat de l'inscription
   */
  enrollCourse: async (courseId) => {
    try {
      const response = await axios.post(`/api/v1/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      console.error("Erreur API enrollCourse:", error);
      throw error;
    }
  },

  /**
   * Désinscrit l'utilisateur actuel d'un cours
   * @param {string} courseId - ID du cours
   * @returns {Promise<Object>} Résultat de la désinscription
   */
  unenrollCourse: async (courseId) => {
    try {
      const response = await axios.delete(`/api/v1/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      console.error("Erreur API unenrollCourse:", error);
      throw error;
    }
  },

  /**
   * Récupère la progression de l'utilisateur dans un cours
   * @param {string} courseId - ID du cours
   * @returns {Promise<Object>} Progression de l'utilisateur
   */
  getUserProgress: async (courseId) => {
    try {
      const response = await axios.get(`/api/v1/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      console.error("Erreur API getUserProgress:", error);
      throw error;
    }
  },

  /**
   * Met à jour la progression de l'utilisateur dans un cours
   * @param {string} courseId - ID du cours
   * @param {Object} progressData - Données de progression
   * @returns {Promise<Object>} Progression mise à jour
   */
  updateProgress: async (courseId, progressData) => {
    try {
      const response = await axios.patch(`/api/v1/courses/${courseId}/progress`, progressData);
      return response.data;
    } catch (error) {
      console.error("Erreur API updateProgress:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un scénario
   * @param {string} courseId - ID du cours
   * @param {string} scenarioId - ID du scénario
   * @returns {Promise<Object>} Détails du scénario
   */
  getScenario: async (courseId, scenarioId) => {
    try {
      const response = await axios.get(`/api/v1/courses/${courseId}/scenarios/${scenarioId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API getScenario:", error);
      throw error;
    }
  },

  /**
   * Soumet les réponses à un scénario
   * @param {string} courseId - ID du cours
   * @param {string} scenarioId - ID du scénario
   * @param {Object} answers - Réponses au scénario
   * @returns {Promise<Object>} Résultat de la soumission
   */
  submitScenarioAnswers: async (courseId, scenarioId, answers) => {
    try {
      const response = await axios.post(`/api/v1/courses/${courseId}/scenarios/${scenarioId}`, { answers });
      return response.data;
    } catch (error) {
      console.error("Erreur API submitScenarioAnswers:", error);
      throw error;
    }
  },

  /**
   * Récupère les cours d'un utilisateur
   * @param {string} userId - ID de l'utilisateur (optionnel, utilise l'utilisateur actuel si non fourni)
   * @param {string} status - Statut des cours (active, completed)
   * @returns {Promise<Array>} Liste des cours de l'utilisateur
   */
  getUserCourses: async (userId = 'me', status = null) => {
    try {
      let url = `/api/v1/users/${userId}/courses`;
      if (status) {
        url += `?status=${status}`;
      }
      const response = await axios.get(url);
      return response.data.courses || [];
    } catch (error) {
      console.error("Erreur API getUserCourses:", error);
      throw error;
    }
  }
};

export default courseApi;