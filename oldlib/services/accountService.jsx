"use client";
import axios from "axios";

/**
 * Service pour gérer les opérations liées au compte utilisateur
 */
export const accountService = {
  /**
   * Supprime le compte utilisateur et toutes les données associées
   * @returns {Promise<{success: boolean, message: string}>} Résultat de l'opération
   */
  async deleteAccount() {
    try {
      const response = await axios.delete("/api/user/delete-account");
      
      if (response.data.success) {
        // Rediriger vers la page de déconnexion d'Auth0
        window.location.href = "/api/auth/logout?returnTo=/";
        return { success: true };
      } else {
        throw new Error(response.data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.details || 
               error.message || 
               "Une erreur est survenue lors de la suppression du compte" 
      };
    }
  }
};