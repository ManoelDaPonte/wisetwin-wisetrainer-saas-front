"use client";
import { useEffect, useCallback } from "react";
import { useOrganizationStore } from "../store/organizationStore";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "./useUser";

/**
 * Hook composable pour accéder et gérer les données des organisations
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage (défaut: true)
 * @param {string} options.organizationId - ID de l'organisation à charger spécifiquement
 * @returns {Object} Données et fonctions pour interagir avec les organisations
 */
export function useOrganization({
  autoLoad = true,
  organizationId = null
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // S'assurer que l'utilisateur est chargé
  const { user, isAuthenticated } = useUser({ autoLoad: false });
  
  // Récupérer l'état et les actions du store
  // Correction: Au lieu d'utiliser un sélecteur qui crée un nouvel objet à chaque rendu,
  // nous sélectionnons individuellement chaque valeur
  
  // État global
  const organizations = useOrganizationStore(state => state.organizations);
  const isLoading = useOrganizationStore(state => state.isLoading);
  const error = useOrganizationStore(state => state.error);
  const lastFetched = useOrganizationStore(state => state.lastFetched);
  const fetchOrganizations = useOrganizationStore(state => state.fetchOrganizations);
  const createOrganization = useOrganizationStore(state => state.createOrganization);
  const resetState = useOrganizationStore(state => state.resetState);
  
  // État organisation active
  const currentOrganization = useOrganizationStore(state => state.currentOrganization);
  const currentOrganizationId = useOrganizationStore(state => state.currentOrganizationId);
  const organizationLoading = useOrganizationStore(state => state.organizationLoading);
  const organizationError = useOrganizationStore(state => state.organizationError);
  const setCurrentOrganizationId = useOrganizationStore(state => state.setCurrentOrganizationId);
  const fetchOrganizationDetails = useOrganizationStore(state => state.fetchOrganizationDetails);
  
  // Vérifier l'appartenance à l'organisation
  const checkMembership = useOrganizationStore(state => state.checkMembership);
  
  // Si un ID d'organisation est fourni, le définir comme courant
  useEffect(() => {
    if (organizationId && organizationId !== currentOrganizationId) {
      setCurrentOrganizationId(organizationId);
      
      // Charger les détails de l'organisation si autoLoad est true
      if (autoLoad) {
        fetchOrganizationDetails(organizationId);
      }
    }
  }, [organizationId, currentOrganizationId, setCurrentOrganizationId, autoLoad, fetchOrganizationDetails]);
  
  // Charger la liste des organisations au montage si nécessaire
  useEffect(() => {
    if (autoLoad && isAuthenticated && !organizationId) {
      fetchOrganizations();
    }
  }, [autoLoad, isAuthenticated, organizationId, fetchOrganizations]);
  
  /**
   * Crée une nouvelle organisation
   * @param {Object} data - Données de l'organisation
   * @returns {Promise<Object>} Organisation créée
   */
  const createNewOrganization = useCallback(async (data) => {
    const org = await createOrganization(data);
    if (org) {
      // Rediriger vers la page de l'organisation créée
      router.push(`/organization/${org.id}`);
    }
    return org;
  }, [createOrganization, router]);
  
  /**
   * Change l'organisation active et charge ses détails
   * @param {string} orgId - ID de l'organisation
   * @param {boolean} navigate - Indique s'il faut naviguer vers la page de l'organisation
   */
  const selectOrganization = useCallback((orgId, navigate = false) => {
    setCurrentOrganizationId(orgId);
    fetchOrganizationDetails(orgId);
    
    if (navigate) {
      router.push(`/organization/${orgId}`);
    }
  }, [setCurrentOrganizationId, fetchOrganizationDetails, router]);
  
  /**
   * Vérifie si l'utilisateur est membre d'une organisation
   * @param {string} orgId - ID de l'organisation à vérifier
   * @returns {Promise<Object>} Résultat de la vérification
   */
  const verifyMembership = useCallback(async (orgId = null) => {
    const idToCheck = orgId || currentOrganizationId;
    if (!idToCheck) return { isMember: false };
    
    return await checkMembership(idToCheck);
  }, [currentOrganizationId, checkMembership]);
  
  /**
   * Récupère le rôle de l'utilisateur dans l'organisation actuelle
   * @returns {string|null} Rôle de l'utilisateur ou null
   */
  const getUserRole = useCallback(() => {
    if (!currentOrganization || !user) return null;
    
    // Vérifier parmi les membres si l'utilisateur est présent
    const members = currentOrganization.members || [];
    const userMember = members.find(member => 
      member.userId === user.id || 
      member.email === user.email
    );
    
    return userMember ? userMember.role : null;
  }, [currentOrganization, user]);
  
  /**
   * Vérifie si l'utilisateur a un rôle spécifique ou supérieur
   * @param {string} requiredRole - Rôle requis ("OWNER", "ADMIN", "MEMBER")
   * @returns {boolean} True si l'utilisateur a le rôle requis ou supérieur
   */
  const hasRole = useCallback((requiredRole) => {
    const userRole = getUserRole();
    if (!userRole) return false;
    
    // Hiérarchie des rôles
    const roleHierarchy = {
      "OWNER": 3,
      "ADMIN": 2,
      "MEMBER": 1
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }, [getUserRole]);
  
  // Vérifier si l'organisation actuelle est la première de l'utilisateur
  const isFirstOrganization = organizations.length === 1 && currentOrganization?.id === organizations[0].id;
  
  // Extraire les informations utiles de l'organisation actuelle
  const {
    id: orgId,
    name: orgName,
    description: orgDescription,
    logoUrl: orgLogoUrl,
    azureContainer: orgAzureContainer,
    isActive: orgIsActive
  } = currentOrganization || {};
  
  return {
    // État des organisations
    organizations,
    isLoading: isLoading || organizationLoading,
    error: error || organizationError,
    hasOrganizations: organizations.length > 0,
    
    // Organisation actuelle
    currentOrganization,
    currentOrganizationId,
    isFirstOrganization,
    
    // Infos organisation actuelle
    orgId,
    orgName,
    orgDescription,
    orgLogoUrl,
    orgAzureContainer,
    orgIsActive,
    
    // Rôles et permissions
    userRole: getUserRole(),
    isOwner: hasRole("OWNER"),
    isAdmin: hasRole("ADMIN"),
    isMember: hasRole("MEMBER"),
    
    // Actions
    loadOrganizations: () => fetchOrganizations(true),
    loadOrganizationDetails: (id) => fetchOrganizationDetails(id || currentOrganizationId, true),
    createOrganization: createNewOrganization,
    selectOrganization,
    verifyMembership,
    hasRole
  };
}

export default useOrganization;