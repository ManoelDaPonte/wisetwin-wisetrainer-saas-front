"use client";
import axios from "axios";

/**
 * Service API centralisé pour toutes les opérations liées au stockage Azure
 */
export const storageApi = {
  /**
   * Vérifie si un container existe
   * @param {string} containerName - Nom du container
   * @returns {Promise<boolean>} true si le container existe
   */
  checkContainerExists: async (containerName) => {
    try {
      const response = await axios.get(`/api/v1/storage/containers/${containerName}`);
      return true; // If we get a response, container exists
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      console.error("Erreur API checkContainerExists:", error);
      return false;
    }
  },

  /**
   * Crée un nouveau container
   * @param {string} containerName - Nom du container
   * @param {Object} options - Options de création
   * @returns {Promise<Object>} Résultat de l'opération
   */
  createContainer: async (containerName, options = {}) => {
    try {
      const response = await axios.post(`/api/v1/storage/containers/${containerName}`, options);
      return response.data;
    } catch (error) {
      console.error("Erreur API createContainer:", error);
      throw error;
    }
  },

  /**
   * Supprime un container
   * @param {string} containerName - Nom du container
   * @returns {Promise<Object>} Résultat de l'opération
   */
  deleteContainer: async (containerName) => {
    try {
      const response = await axios.delete(`/api/v1/storage/containers/${containerName}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API deleteContainer:", error);
      throw error;
    }
  },

  /**
   * Récupère les détails d'un container
   * @param {string} containerName - Nom du container
   * @returns {Promise<Object>} Détails du container
   */
  getContainer: async (containerName) => {
    try {
      const response = await axios.get(`/api/v1/storage/containers/${containerName}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API getContainer:", error);
      throw error;
    }
  },

  /**
   * Liste tous les blobs d'un container
   * @param {string} containerName - Nom du container
   * @param {Object} options - Options de filtrage
   * @returns {Promise<Array>} Liste des blobs
   */
  listBlobs: async (containerName, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.prefix) params.append('prefix', options.prefix);
      
      const url = `/api/v1/storage/containers/${containerName}/blobs${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data.blobs || [];
    } catch (error) {
      console.error("Erreur API listBlobs:", error);
      throw error;
    }
  },

  /**
   * Vérifie si un blob existe
   * @param {string} containerName - Nom du container
   * @param {string} blobName - Nom du blob
   * @returns {Promise<boolean>} true si le blob existe
   */
  checkBlobExists: async (containerName, blobName) => {
    try {
      const response = await axios.get(`/api/v1/storage/containers/${containerName}/blobs/${blobName}`);
      return true; // If we get a response, blob exists
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      console.error("Erreur API checkBlobExists:", error);
      return false;
    }
  },

  /**
   * Upload un blob
   * @param {string} containerName - Nom du container
   * @param {string} blobName - Nom du blob
   * @param {File|Blob} file - Fichier à uploader
   * @param {Object} options - Options d'upload
   * @returns {Promise<Object>} Résultat de l'upload
   */
  uploadBlob: async (containerName, blobName, file, options = {}) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }
      
      const response = await axios.post(
        `/api/v1/storage/containers/${containerName}/blobs/${blobName}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur API uploadBlob:", error);
      throw error;
    }
  },

  /**
   * Télécharge un blob
   * @param {string} containerName - Nom du container
   * @param {string} blobPath - Chemin du blob
   * @returns {Promise<string>} URL de téléchargement
   */
  getDownloadUrl: (containerName, blobPath) => {
    return `/api/v1/storage/containers/${containerName}/blobs/${blobPath}`;
  },

  /**
   * Supprime un blob
   * @param {string} containerName - Nom du container
   * @param {string} blobName - Nom du blob
   * @returns {Promise<Object>} Résultat de l'opération
   */
  deleteBlob: async (containerName, blobName) => {
    try {
      const response = await axios.delete(`/api/v1/storage/containers/${containerName}/blobs/${blobName}`);
      return response.data;
    } catch (error) {
      console.error("Erreur API deleteBlob:", error);
      throw error;
    }
  },

  /**
   * Récupère la liste des builds disponibles
   * @param {Object} options - Options de recherche
   * @param {string} options.type - Type de build (wisetrainer, wisetwin)
   * @param {string} options.organizationId - ID de l'organisation
   * @returns {Promise<Array>} Liste des builds
   */
  searchBuilds: async (options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.organizationId) params.append('organizationId', options.organizationId);
      
      const url = `/api/v1/storage/builds${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await axios.get(url);
      return response.data.builds || [];
    } catch (error) {
      console.error("Erreur API searchBuilds:", error);
      throw error;
    }
  },

  /**
   * Récupère l'URL SAS pour un blob
   * @param {string} containerName - Nom du container
   * @param {string} blobName - Nom du blob
   * @param {string} permissions - Permissions (par défaut 'r' pour lecture)
   * @returns {Promise<string>} URL SAS
   */
  getSasUrl: async (containerName, blobName, permissions = 'r') => {
    try {
      // TODO: Implement SAS URL generation in v1 API
      // For now, return direct download URL
      return `/api/v1/storage/containers/${containerName}/blobs/${blobName}`;
    } catch (error) {
      console.error("Erreur API getSasUrl:", error);
      throw error;
    }
  }
};

export default storageApi;