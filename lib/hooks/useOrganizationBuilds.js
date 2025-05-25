"use client";
import { useEffect, useCallback } from "react";
import { useOrganizationStore } from "../store/organizationStore";
import { useOrganization } from "./useOrganization";

/**
 * Hook composable pour gérer les builds (formations) d'une organisation
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les builds au montage (défaut: true)
 * @param {string} options.organizationId - ID de l'organisation (utilise l'organisation active par défaut)
 * @param {string} options.type - Type de builds à charger (all, wisetwin, wisetrainer)
 * @returns {Object} Données et fonctions pour gérer les builds
 */
export function useOrganizationBuilds({
  autoLoad = true,
  organizationId = null,
  type = "all" // "all", "wisetwin", "wisetrainer"
} = {}) {
  // Récupérer l'organisation active ou utilisée celle spécifiée
  const { currentOrganizationId } = useOrganization({ 
    autoLoad: false,
    organizationId
  });
  
  // ID de l'organisation à utiliser
  const orgId = organizationId || currentOrganizationId;
  
  // Récupérer l'état et les actions du store (sélection individuelle pour éviter les re-rendus)
  const builds = useOrganizationStore(state => state.builds);
  const buildsLoading = useOrganizationStore(state => state.buildsLoading);
  const buildsError = useOrganizationStore(state => state.buildsError);
  const fetchBuilds = useOrganizationStore(state => state.fetchBuilds);
  const getWiseTwinBuilds = useOrganizationStore(state => state.getWiseTwinBuilds);
  const getWiseTrainerBuilds = useOrganizationStore(state => state.getWiseTrainerBuilds);
  
  // Fonction pour charger les builds
  const loadBuilds = useCallback(async (force = false) => {
    if (!orgId) return [];
    
    try {
      switch (type) {
        case "wisetwin":
          return await getWiseTwinBuilds(orgId, force);
        case "wisetrainer":
          return await getWiseTrainerBuilds(orgId, force);
        case "all":
        default:
          return await fetchBuilds(orgId, force);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des builds:", error);
      return [];
    }
  }, [orgId, type, fetchBuilds, getWiseTwinBuilds, getWiseTrainerBuilds]);

  // Charger les builds au montage si nécessaire
  useEffect(() => {
    if (autoLoad && orgId) {
      loadBuilds();
    }
  }, [autoLoad, orgId, loadBuilds]);
  
  
  /**
   * Recharge les builds
   */
  const refreshBuilds = useCallback(() => {
    return loadBuilds(true);
  }, [loadBuilds]);
  
  /**
   * Filtre les builds par catégorie
   * @param {string} category - Catégorie à filtrer
   * @returns {Array} Liste des builds filtrés
   */
  const filterByCategory = useCallback((category) => {
    return builds.filter(build => build.category === category);
  }, [builds]);
  
  /**
   * Recherche des builds par nom ou description
   * @param {string} query - Terme de recherche
   * @returns {Array} Liste des builds correspondants
   */
  const searchBuilds = useCallback((query) => {
    if (!query) return builds;
    const searchTerm = query.toLowerCase();
    return builds.filter(build => 
      (build.name && build.name.toLowerCase().includes(searchTerm)) || 
      (build.description && build.description.toLowerCase().includes(searchTerm))
    );
  }, [builds]);
  
  // Compter les builds par type
  const wiseTwinBuilds = builds.filter(build => build.type === "wisetwin" || build.sourceType === "wisetwin");
  const wiseTrainerBuilds = builds.filter(build => build.type === "wisetrainer" || build.sourceType === "wisetrainer");
  
  // Catégories uniques
  const categories = [...new Set(builds.map(build => build.category))].filter(Boolean);
  
  return {
    // État
    builds,
    trainings: builds, // Alias pour compatibilité
    isLoading: buildsLoading,
    error: buildsError,
    
    // Builds filtrés
    wiseTwinBuilds,
    wiseTrainerBuilds,
    
    // Métadonnées
    categories,
    
    // Compteurs
    totalBuilds: builds.length,
    wiseTwinCount: wiseTwinBuilds.length,
    wiseTrainerCount: wiseTrainerBuilds.length,
    
    // Actions
    loadBuilds,
    refreshBuilds,
    filterByCategory,
    searchBuilds
  };
}

export default useOrganizationBuilds;