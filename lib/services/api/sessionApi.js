"use client";
import axios from "axios";

/**
 * Service API centralisé pour toutes les opérations liées aux sessions
 */
export const sessionApi = {
  /**
   * Démarre une nouvelle session
   * @param {Object} data - Données de la session
   * @param {string} data.type - Type de session (TRAINING, EXPLORATION)
   * @param {string} data.trainingId - ID de la formation (optionnel)
   * @param {string} data.buildId - ID du build (optionnel)
   * @returns {Promise<Object>} Session créée
   */
  startSession: async (data) => {
    try {
      const response = await axios.post("/api/v1/sessions", data);
      return response.data;
    } catch (error) {
      console.error("Erreur API startSession:", error);
      throw error;
    }
  },

  /**
   * Termine une session
   * @param {string} sessionId - ID de la session
   * @param {number} duration - Durée de la session en secondes
   * @returns {Promise<Object>} Session mise à jour
   */
  endSession: async (sessionId, duration) => {
    try {
      const response = await axios.patch("/api/v1/sessions", {
        sessionId,
        duration
      });
      return response.data;
    } catch (error) {
      console.error("Erreur API endSession:", error);
      throw error;
    }
  },

  /**
   * Récupère les sessions de l'utilisateur
   * @param {Object} options - Options de filtrage
   * @param {string} options.type - Type de session
   * @param {Date} options.startDate - Date de début
   * @param {Date} options.endDate - Date de fin
   * @returns {Promise<Array>} Liste des sessions
   */
  getUserSessions: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.startDate) params.append('startDate', options.startDate.toISOString());
      if (options.endDate) params.append('endDate', options.endDate.toISOString());
      
      const url = `/api/v1/sessions${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data.sessions || [];
    } catch (error) {
      console.error("Erreur API getUserSessions:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une session
   * @param {string} sessionId - ID de la session
   * @returns {Promise<Object>} Détails de la session
   */
  getSession: async (sessionId) => {
    try {
      const response = await axios.get(`/api/v1/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API getSession:", error);
      throw error;
    }
  },

  /**
   * Met à jour les données d'une session
   * @param {string} sessionId - ID de la session
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Session mise à jour
   */
  updateSession: async (sessionId, data) => {
    try {
      const response = await axios.patch(`/api/v1/sessions/${sessionId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur API updateSession:", error);
      throw error;
    }
  }
};

export default sessionApi;