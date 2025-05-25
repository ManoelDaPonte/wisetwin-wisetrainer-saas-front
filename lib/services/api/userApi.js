"use client";
import axios from "axios";

/**
 * Service API centralisé pour toutes les opérations liées aux utilisateurs
 */
export const userApi = {
  /**
   * Récupère le profil complet de l'utilisateur
   * @returns {Promise<Object>} Données de l'utilisateur
   */
  getProfile: async () => {
    try {
      const response = await axios.get("/api/v1/users/me");
      return response.data;
    } catch (error) {
      console.error("Erreur API getProfile:", error);
      throw error;
    }
  },

  /**
   * Initialise l'utilisateur après connexion
   * @returns {Promise<Object>} Données de l'utilisateur
   */
  initializeUser: async () => {
    try {
      const response = await axios.post("/api/v1/auth/initialize");
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error(response.data.error || "Échec d'initialisation de l'utilisateur");
    } catch (error) {
      console.error("Erreur API initializeUser:", error);
      throw error;
    }
  },

  /**
   * Met à jour le profil de l'utilisateur
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Données utilisateur mises à jour
   */
  updateProfile: async (data) => {
    try {
      const response = await axios.patch("/api/v1/users/me", data);
      return response.data;
    } catch (error) {
      console.error("Erreur API updateProfile:", error);
      throw error;
    }
  },

  /**
   * Met à jour le nom de l'utilisateur
   * @param {string} name - Nouveau nom
   * @returns {Promise<Object>} Données utilisateur mises à jour
   */
  updateName: async (name) => {
    try {
      const response = await axios.patch("/api/v1/users/me", { name });
      return response.data;
    } catch (error) {
      console.error("Erreur API updateName:", error);
      throw error;
    }
  },

  /**
   * Supprime le compte utilisateur
   * @returns {Promise<Object>} Résultat de l'opération
   */
  deleteAccount: async () => {
    try {
      // First get current user to get their ID
      const userResponse = await axios.get("/api/v1/users/me");
      const userId = userResponse.data.id;
      
      const response = await axios.delete(`/api/v1/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API deleteAccount:", error);
      throw error;
    }
  },

  /**
   * Récupère les statistiques de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @returns {Promise<Object>} Statistiques de l'utilisateur
   */
  getUserStats: async (userId) => {
    try {
      const response = await axios.get(`/api/v1/users/${userId}/stats`);
      return response.data;
    } catch (error) {
      console.error("Erreur API getUserStats:", error);
      throw error;
    }
  },

  /**
   * Récupère les cours de l'utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} status - Statut des cours (active, completed)
   * @returns {Promise<Array>} Liste des cours
   */
  getUserCourses: async (userId, status = null) => {
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

export default userApi;