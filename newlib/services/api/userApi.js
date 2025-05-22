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
      const response = await axios.get("/api/user/initialize");
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error(response.data.error || "Échec de récupération des données utilisateur");
    } catch (error) {
      console.error("Erreur API getProfile:", error);
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
      const response = await axios.put("/api/user/update-profile", data);
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error(response.data.error || "Échec de mise à jour du profil");
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
      const response = await axios.post("/api/user/update-name", { name });
      if (response.data.success) {
        return response.data.user;
      }
      throw new Error(response.data.error || "Échec de mise à jour du nom");
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
      const response = await axios.delete("/api/user/delete-account");
      if (response.data.success) {
        return { success: true };
      }
      throw new Error(response.data.error || "Échec de suppression du compte");
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
      const response = await axios.get(`/api/db/stats/user/${userId}`);
      if (response.data.success) {
        return response.data.stats;
      }
      throw new Error(response.data.error || "Échec de récupération des statistiques");
    } catch (error) {
      console.error("Erreur API getUserStats:", error);
      throw error;
    }
  }
};

export default userApi;