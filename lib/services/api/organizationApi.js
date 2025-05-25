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
      const response = await axios.get("/api/v1/organizations");
      return response.data.organizations || [];
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
      const response = await axios.get(`/api/v1/organizations/${organizationId}`);
      return response.data;
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
      const response = await axios.post("/api/v1/organizations", data);
      return response.data;
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
      const response = await axios.get(`/api/v1/organizations/${organizationId}/members`);
      return response.data.members || [];
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
      // This endpoint might need to be implemented in v1 API
      // For now, get members and tags separately
      const [membersResponse, tagsResponse] = await Promise.all([
        axios.get(`/api/v1/organizations/${organizationId}/members`),
        axios.get(`/api/v1/organizations/${organizationId}/tags`)
      ]);
      
      // TODO: Implement member-tag associations in v1 API
      return membersResponse.data.members || [];
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
      const response = await axios.post(`/api/v1/organizations/${organizationId}/members`, data);
      return response.data;
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
      const response = await axios.delete(`/api/v1/organizations/${organizationId}/members/${memberId}`);
      return response.data;
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
      const response = await axios.patch(`/api/v1/organizations/${organizationId}/members/${memberId}`, data);
      return response.data;
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
      const response = await axios.get(`/api/v1/organizations/${organizationId}/tags`);
      return response.data.tags || [];
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
      const response = await axios.post(`/api/v1/organizations/${organizationId}/tags`, data);
      return response.data;
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
      const response = await axios.patch(`/api/v1/organizations/${organizationId}/tags/${tagId}`, data);
      return response.data;
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
      const response = await axios.delete(`/api/v1/organizations/${organizationId}/tags/${tagId}`);
      return response.data;
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
      // TODO: This endpoint needs to be implemented in v1 API
      const response = await axios.get(`/api/v1/organizations/${organizationId}/tags/${tagId}`);
      return response.data.trainings || [];
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
      // TODO: This endpoint needs to be implemented in v1 API
      const response = await axios.patch(`/api/v1/organizations/${organizationId}/tags/${tagId}`, { trainingIds });
      return response.data;
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
      const response = await axios.get(`/api/v1/organizations/${organizationId}/invitations`);
      return response.data.invitations || [];
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
      const response = await axios.post(`/api/v1/organizations/${organizationId}/invitations`, data);
      return response.data;
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
      const response = await axios.delete(`/api/v1/organizations/${organizationId}/invitations/${invitationId}`);
      return response.data;
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
      const response = await axios.post(`/api/v1/organizations/${organizationId}/invitations/${invitationId}`);
      return response.data;
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
      // Get organization details which includes member info
      const response = await axios.get(`/api/v1/organizations/${organizationId}`);
      // TODO: Implement proper membership check in v1 API
      return { isMember: true, role: 'MEMBER' };
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
      const response = await axios.get(`/api/v1/organizations/${organizationId}/courses`);
      return response.data.courses || [];
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
      const response = await axios.get(`/api/v1/organizations/${organizationId}/courses?type=wisetwin`);
      return response.data.courses || [];
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
      const response = await axios.get(`/api/v1/organizations/${organizationId}/courses?type=wisetrainer`);
      return response.data.courses || [];
    } catch (error) {
      console.error("Erreur API getWiseTrainerBuilds:", error);
      throw error;
    }
  },

  /**
   * Met à jour une organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} Organisation mise à jour
   */
  updateOrganization: async (organizationId, data) => {
    try {
      const response = await axios.patch(`/api/v1/organizations/${organizationId}`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur API updateOrganization:", error);
      throw error;
    }
  }
};

export default organizationApi;