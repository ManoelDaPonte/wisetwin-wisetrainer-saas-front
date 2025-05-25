"use client";
import { useEffect, useCallback } from "react";
import { useContextStore } from "../store/contextStore";
import { useUser } from "./useUser";
import { useOrganization } from "./useOrganization";

/**
 * Hook principal pour gérer le contexte actif de l'application
 * Centralise la logique de changement entre mode personnel et organisation
 * 
 * @returns {Object} État et actions du contexte actif
 */
export function useActiveContext() {
  // État du contexte
  const {
    activeContext,
    isInitialized,
    initializeContext,
    setContext,
    resetToPersonal,
    setOrganizationContext,
    isPersonalMode,
    isOrganizationMode,
    getActiveOrganizationId,
    getActiveContainer
  } = useContextStore();
  
  // Données utilisateur
  const { user, isLoading: userLoading } = useUser({ autoLoad: false });
  
  // Données organisation (chargées uniquement si nécessaire)
  const shouldLoadOrg = isOrganizationMode && activeContext.organizationId;
  const { 
    currentOrganization,
    organizations,
    fetchOrganizationDetails,
    isLoading: orgLoading
  } = useOrganization({ 
    autoLoad: false
  });
  
  // Initialiser le contexte au montage
  useEffect(() => {
    if (!isInitialized) {
      initializeContext();
    }
  }, [isInitialized, initializeContext]);
  
  // Charger les détails de l'organisation si nécessaire
  useEffect(() => {
    if (shouldLoadOrg && activeContext.organizationId && !currentOrganization) {
      fetchOrganizationDetails(activeContext.organizationId);
    }
  }, [shouldLoadOrg, activeContext.organizationId, currentOrganization, fetchOrganizationDetails]);
  
  /**
   * Change le contexte vers une organisation spécifique
   * @param {Object} organization - Organisation à activer
   */
  const switchToOrganization = useCallback(async (organization) => {
    if (!organization) return;
    
    // Vérifier que l'utilisateur a accès à cette organisation
    const hasAccess = organizations.some(org => org.id === organization.id);
    if (!hasAccess) {
      console.error("L'utilisateur n'a pas accès à cette organisation");
      return false;
    }
    
    // Mettre à jour le contexte
    setOrganizationContext(organization);
    
    // Charger les détails si nécessaire
    await fetchOrganizationDetails(organization.id);
    
    return true;
  }, [organizations, setOrganizationContext, fetchOrganizationDetails]);
  
  /**
   * Change le contexte vers le mode personnel
   */
  const switchToPersonal = useCallback(() => {
    resetToPersonal();
  }, [resetToPersonal]);
  
  /**
   * Change le contexte de manière générique
   * @param {string} type - "personal" ou "organization"
   * @param {Object} data - Données du contexte (organisation si type = "organization")
   */
  const switchContext = useCallback(async (type, data = null) => {
    if (type === "personal") {
      switchToPersonal();
      return true;
    } else if (type === "organization" && data) {
      return await switchToOrganization(data);
    }
    return false;
  }, [switchToPersonal, switchToOrganization]);
  
  /**
   * Récupère les données complètes du contexte actif
   */
  const getContextData = useCallback(() => {
    if (isPersonalMode) {
      return {
        type: "personal",
        id: user?.id,
        name: "Mode Personnel",
        data: user,
        container: user?.azureContainer,
        isLoading: userLoading
      };
    } else {
      return {
        type: "organization",
        id: activeContext.organizationId,
        name: activeContext.name,
        data: currentOrganization,
        container: currentOrganization?.azureContainer || activeContext.azureContainer,
        isLoading: orgLoading
      };
    }
  }, [
    isPersonalMode, 
    user, 
    userLoading, 
    activeContext, 
    currentOrganization, 
    orgLoading
  ]);
  
  /**
   * Vérifie si l'utilisateur peut accéder aux données selon le contexte
   */
  const canAccessData = useCallback(() => {
    if (isPersonalMode) {
      return !!user && !userLoading;
    } else {
      // En mode organisation, vérifier que l'organisation est chargée
      // et que l'utilisateur y a toujours accès
      return !!currentOrganization && 
             !orgLoading && 
             organizations.some(org => org.id === activeContext.organizationId);
    }
  }, [
    isPersonalMode, 
    user, 
    userLoading, 
    currentOrganization, 
    orgLoading, 
    organizations, 
    activeContext.organizationId
  ]);
  
  /**
   * Récupère le container Azure actif avec fallback
   */
  const getActiveContainerSafe = useCallback(() => {
    const contextData = getContextData();
    // Fallback vers le container utilisateur si nécessaire
    return contextData.container || user?.azureContainer || null;
  }, [getContextData, user]);
  
  // Écouter les changements de contexte externes (autres onglets)
  useEffect(() => {
    const handleContextChange = (event) => {
      console.log("Contexte changé (externe):", event.detail);
      // Le store se met à jour automatiquement via zustand persist
    };
    
    window.addEventListener('context-changed', handleContextChange);
    return () => window.removeEventListener('context-changed', handleContextChange);
  }, []);
  
  return {
    // État du contexte
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    isInitialized,
    
    // Données du contexte
    contextData: getContextData(),
    activeContainer: getActiveContainerSafe(),
    canAccess: canAccessData(),
    
    // Données pour l'UI
    contextName: activeContext.name,
    contextType: activeContext.type,
    contextId: isPersonalMode ? user?.id : activeContext.organizationId,
    
    // État de chargement
    isLoading: isPersonalMode ? userLoading : orgLoading,
    
    // Actions
    switchContext,
    switchToPersonal,
    switchToOrganization,
    
    // Données supplémentaires
    user,
    currentOrganization,
    organizations
  };
}

export default useActiveContext;