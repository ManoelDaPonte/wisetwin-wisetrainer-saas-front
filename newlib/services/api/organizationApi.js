"use client";
import axios from "axios";

/**
 * Service API centralisé pour toutes les opérations liées aux organisations
 */
export const organizationApi = {
  /**
   * Récupère toutes les organisations de l'utilisateur
   * @returns {Promise<Array>} Liste des organisations
   */
  getUserOrganizations: async () => {
    try {
      const response = await axios.get("/api/organization");
      // Vérifier que la réponse contient des organisations (le champ success n'est pas utilisé par l'API)
      if (response.data && response.data.organizations) {
        return response.data.organizations || [];
      }
      // Vérifier si la réponse contient une erreur
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
      // Si aucun des cas ci-dessus, retourner un tableau vide
      console.log("Aucune organisation trouvée, tableau vide retourné");
      return [];
    } catch (error) {
      console.error("Erreur API getUserOrganizations:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'une organisation spécifique
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Object>} Détails de l'organisation
   */
  getOrganizationDetails: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}`);
      // Vérifier que la réponse contient les détails de l'organisation
      if (response.data && response.data.organization) {
        return response.data.organization;
      }
      // Vérifier si la réponse contient une erreur
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
      throw new Error("Échec de récupération des détails de l'organisation");
    } catch (error) {
      console.error("Erreur API getOrganizationDetails:", error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle organisation
   * @param {Object} data - Données de l'organisation
   * @returns {Promise<Object>} Organisation créée
   */
  createOrganization: async (data) => {
    try {
      const response = await axios.post("/api/organization", data);
      if (response.data.success) {
        return response.data.organization;
      }
      throw new Error(response.data.error || "Échec de création de l'organisation");
    } catch (error) {
      console.error("Erreur API createOrganization:", error);
      throw error;
    }
  },

  /**
   * Récupère les membres d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des membres
   */
  getOrganizationMembers: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/members`);
      if (response.data.success) {
        return response.data.members || [];
      }
      throw new Error(response.data.error || "Échec de récupération des membres");
    } catch (error) {
      console.error("Erreur API getOrganizationMembers:", error);
      throw error;
    }
  },

  /**
   * Récupère les membres avec leurs tags
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des membres avec leurs tags
   */
  getMembersWithTags: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/members-with-tags`);
      if (response.data.success) {
        return response.data.members || [];
      }
      throw new Error(response.data.error || "Échec de récupération des membres avec tags");
    } catch (error) {
      console.error("Erreur API getMembersWithTags:", error);
      throw error;
    }
  },

  /**
   * Ajoute un membre à l'organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {Object} data - Données du membre (email, role)
   * @returns {Promise<Object>} Résultat de l'opération
   */
  addMember: async (organizationId, data) => {
    try {
      const response = await axios.post(`/api/organization/${organizationId}/members`, data);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec d'ajout du membre");
    } catch (error) {
      console.error("Erreur API addMember:", error);
      throw error;
    }
  },

  /**
   * Supprime un membre de l'organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {string} memberId - ID du membre
   * @returns {Promise<Object>} Résultat de l'opération
   */
  removeMember: async (organizationId, memberId) => {
    try {
      const response = await axios.delete(`/api/organization/${organizationId}/members/${memberId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec de suppression du membre");
    } catch (error) {
      console.error("Erreur API removeMember:", error);
      throw error;
    }
  },

  /**
   * Met à jour le rôle d'un membre
   * @param {string} organizationId - ID de l'organisation
   * @param {string} memberId - ID du membre
   * @param {Object} data - Nouvelles données (role)
   * @returns {Promise<Object>} Membre mis à jour
   */
  updateMember: async (organizationId, memberId, data) => {
    try {
      const response = await axios.put(`/api/organization/${organizationId}/members/${memberId}`, data);
      if (response.data.success) {
        return response.data.member;
      }
      throw new Error(response.data.error || "Échec de mise à jour du membre");
    } catch (error) {
      console.error("Erreur API updateMember:", error);
      throw error;
    }
  },

  /**
   * Récupère les tags d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des tags
   */
  getOrganizationTags: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/tags`);
      if (response.data.success) {
        return response.data.tags || [];
      }
      throw new Error(response.data.error || "Échec de récupération des tags");
    } catch (error) {
      console.error("Erreur API getOrganizationTags:", error);
      throw error;
    }
  },

  /**
   * Crée un nouveau tag
   * @param {string} organizationId - ID de l'organisation
   * @param {Object} data - Données du tag (name, color, description)
   * @returns {Promise<Object>} Tag créé
   */
  createTag: async (organizationId, data) => {
    try {
      const response = await axios.post(`/api/organization/${organizationId}/tags`, data);
      if (response.data.success) {
        return response.data.tag;
      }
      throw new Error(response.data.error || "Échec de création du tag");
    } catch (error) {
      console.error("Erreur API createTag:", error);
      throw error;
    }
  },

  /**
   * Met à jour un tag
   * @param {string} organizationId - ID de l'organisation
   * @param {string} tagId - ID du tag
   * @param {Object} data - Nouvelles données du tag
   * @returns {Promise<Object>} Tag mis à jour
   */
  updateTag: async (organizationId, tagId, data) => {
    try {
      const response = await axios.put(`/api/organization/${organizationId}/tags/${tagId}`, data);
      if (response.data.success) {
        return response.data.tag;
      }
      throw new Error(response.data.error || "Échec de mise à jour du tag");
    } catch (error) {
      console.error("Erreur API updateTag:", error);
      throw error;
    }
  },

  /**
   * Supprime un tag
   * @param {string} organizationId - ID de l'organisation
   * @param {string} tagId - ID du tag
   * @returns {Promise<Object>} Résultat de l'opération
   */
  deleteTag: async (organizationId, tagId) => {
    try {
      const response = await axios.delete(`/api/organization/${organizationId}/tags/${tagId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec de suppression du tag");
    } catch (error) {
      console.error("Erreur API deleteTag:", error);
      throw error;
    }
  },

  /**
   * Récupère les formations associées à un tag
   * @param {string} organizationId - ID de l'organisation
   * @param {string} tagId - ID du tag
   * @returns {Promise<Array>} Liste des formations
   */
  getTagTrainings: async (organizationId, tagId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/tags/${tagId}/training`);
      if (response.data.success) {
        return response.data.trainings || [];
      }
      throw new Error(response.data.error || "Échec de récupération des formations du tag");
    } catch (error) {
      console.error("Erreur API getTagTrainings:", error);
      throw error;
    }
  },

  /**
   * Associe des formations à un tag
   * @param {string} organizationId - ID de l'organisation
   * @param {string} tagId - ID du tag
   * @param {Array} trainingIds - Liste d'IDs de formations
   * @returns {Promise<Object>} Résultat de l'opération
   */
  associateTrainingsToTag: async (organizationId, tagId, trainingIds) => {
    try {
      const response = await axios.post(`/api/organization/${organizationId}/tags/${tagId}/training`, { trainingIds });
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec d'association des formations au tag");
    } catch (error) {
      console.error("Erreur API associateTrainingsToTag:", error);
      throw error;
    }
  },

  /**
   * Récupère les invitations d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des invitations
   */
  getInvitations: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/invitations`);
      if (response.data.success) {
        return response.data.invitations || [];
      }
      throw new Error(response.data.error || "Échec de récupération des invitations");
    } catch (error) {
      console.error("Erreur API getInvitations:", error);
      throw error;
    }
  },

  /**
   * Crée une invitation pour rejoindre l'organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {Object} data - Données de l'invitation (email, role)
   * @returns {Promise<Object>} Invitation créée
   */
  createInvitation: async (organizationId, data) => {
    try {
      const response = await axios.post(`/api/organization/${organizationId}/invite`, data);
      if (response.data.success) {
        return response.data.invitation;
      }
      throw new Error(response.data.error || "Échec de création de l'invitation");
    } catch (error) {
      console.error("Erreur API createInvitation:", error);
      throw error;
    }
  },

  /**
   * Annule une invitation
   * @param {string} organizationId - ID de l'organisation
   * @param {string} invitationId - ID de l'invitation
   * @returns {Promise<Object>} Résultat de l'opération
   */
  cancelInvitation: async (organizationId, invitationId) => {
    try {
      const response = await axios.delete(`/api/organization/${organizationId}/invitations/${invitationId}`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec d'annulation de l'invitation");
    } catch (error) {
      console.error("Erreur API cancelInvitation:", error);
      throw error;
    }
  },

  /**
   * Renvoie une invitation
   * @param {string} organizationId - ID de l'organisation
   * @param {string} invitationId - ID de l'invitation
   * @returns {Promise<Object>} Résultat de l'opération
   */
  resendInvitation: async (organizationId, invitationId) => {
    try {
      const response = await axios.post(`/api/organization/${organizationId}/invitations/${invitationId}/resend`);
      if (response.data.success) {
        return response.data;
      }
      throw new Error(response.data.error || "Échec de renvoi de l'invitation");
    } catch (error) {
      console.error("Erreur API resendInvitation:", error);
      throw error;
    }
  },

  /**
   * Vérifie si l'utilisateur est membre d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Object>} Résultat de la vérification
   */
  checkMembership: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/check-membership`);
      return response.data;
    } catch (error) {
      console.error("Erreur API checkMembership:", error);
      return { isMember: false, role: null };
    }
  },

  /**
   * Récupère les builds/formations d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des builds
   */
  getOrganizationBuilds: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/builds`);
      if (response.data.success) {
        return response.data.courses || response.data.builds || [];
      }
      throw new Error(response.data.error || "Échec de récupération des builds");
    } catch (error) {
      console.error("Erreur API getOrganizationBuilds:", error);
      throw error;
    }
  },

  /**
   * Récupère les builds WiseTwin d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des builds WiseTwin
   */
  getWiseTwinBuilds: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/wisetwin-builds`);
      if (response.data.success) {
        return response.data.builds || [];
      }
      throw new Error(response.data.error || "Échec de récupération des builds WiseTwin");
    } catch (error) {
      console.error("Erreur API getWiseTwinBuilds:", error);
      throw error;
    }
  },

  /**
   * Récupère les builds WiseTrainer d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des builds WiseTrainer
   */
  getWiseTrainerBuilds: async (organizationId) => {
    try {
      const response = await axios.get(`/api/organization/${organizationId}/wisetrainer-builds`);
      if (response.data.success) {
        return response.data.courses || response.data.builds || [];
      }
      throw new Error(response.data.error || "Échec de récupération des builds WiseTrainer");
    } catch (error) {
      console.error("Erreur API getWiseTrainerBuilds:", error);
      throw error;
    }
  }
};

export default organizationApi;