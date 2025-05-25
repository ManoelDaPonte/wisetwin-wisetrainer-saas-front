"use client";
import { useEffect, useCallback } from "react";
import { useOrganizationStore } from "../store/organizationStore";
import { useOrganization } from "./useOrganization";

/**
 * Hook composable pour gérer les tags d'une organisation
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les tags au montage (défaut: true)
 * @param {string} options.organizationId - ID de l'organisation (utilise l'organisation active par défaut)
 * @returns {Object} Données et fonctions pour gérer les tags
 */
export function useOrganizationTags({
  autoLoad = true,
  organizationId = null
} = {}) {
  // Récupérer l'organisation active ou utilisée celle spécifiée
  const { currentOrganizationId } = useOrganization({ 
    autoLoad: false,
    organizationId
  });
  
  // ID de l'organisation à utiliser
  const orgId = organizationId || currentOrganizationId;
  
  // Récupérer l'état et les actions du store
  const {
    tags,
    tagsLoading,
    tagsError,
    fetchTags,
    createTag
  } = useOrganizationStore(state => ({
    tags: state.tags,
    tagsLoading: state.tagsLoading,
    tagsError: state.tagsError,
    fetchTags: state.fetchTags,
    createTag: state.createTag
  }));
  
  // Charger les tags au montage si nécessaire
  useEffect(() => {
    if (autoLoad && orgId) {
      fetchTags(orgId);
    }
  }, [autoLoad, orgId, fetchTags]);
  
  /**
   * Crée un nouveau tag
   * @param {Object} data - Données du tag (name, color, description)
   * @returns {Promise<Object>} Tag créé
   */
  const addTag = useCallback(async (data) => {
    return await createTag(data);
  }, [createTag]);
  
  /**
   * Recharge les tags
   */
  const refreshTags = useCallback(() => {
    if (orgId) {
      fetchTags(orgId, true);
    }
  }, [orgId, fetchTags]);
  
  /**
   * Filtre les tags par couleur
   * @param {string} color - Couleur à filtrer
   * @returns {Array} Liste des tags filtrés
   */
  const filterByColor = useCallback((color) => {
    return tags.filter(tag => tag.color === color);
  }, [tags]);
  
  /**
   * Recherche des tags par nom (recherche insensible à la casse)
   * @param {string} query - Terme de recherche
   * @returns {Array} Liste des tags correspondants
   */
  const searchTags = useCallback((query) => {
    if (!query) return tags;
    const searchTerm = query.toLowerCase();
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(searchTerm) || 
      (tag.description && tag.description.toLowerCase().includes(searchTerm))
    );
  }, [tags]);
  
  /**
   * Génère une couleur au format hexadécimal aléatoire
   * @returns {string} Couleur au format hexadécimal (#RRGGBB)
   */
  const generateRandomColor = useCallback(() => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }, []);
  
  return {
    // État
    tags,
    isLoading: tagsLoading,
    error: tagsError,
    
    // Compteurs
    totalTags: tags.length,
    
    // Actions
    addTag,
    refreshTags,
    filterByColor,
    searchTags,
    generateRandomColor
  };
}

export default useOrganizationTags;