"use client";
import { useEffect, useCallback } from "react";
import { useOrganizationStore } from "../store/organizationStore";
import { useOrganization } from "./useOrganization";

/**
 * Hook composable pour gérer les invitations d'une organisation
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les invitations au montage (défaut: true)
 * @param {string} options.organizationId - ID de l'organisation (utilise l'organisation active par défaut)
 * @returns {Object} Données et fonctions pour gérer les invitations
 */
export function useOrganizationInvitations({
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
    invitations,
    invitationsLoading,
    invitationsError,
    fetchInvitations,
    createInvitation,
    cancelInvitation,
    resendInvitation
  } = useOrganizationStore(state => ({
    invitations: state.invitations,
    invitationsLoading: state.invitationsLoading,
    invitationsError: state.invitationsError,
    fetchInvitations: state.fetchInvitations,
    createInvitation: state.createInvitation,
    cancelInvitation: state.cancelInvitation,
    resendInvitation: state.resendInvitation
  }));
  
  // Charger les invitations au montage si nécessaire
  useEffect(() => {
    if (autoLoad && orgId) {
      fetchInvitations(orgId);
    }
  }, [autoLoad, orgId, fetchInvitations]);
  
  /**
   * Crée une nouvelle invitation
   * @param {Object} data - Données de l'invitation (email, role)
   * @returns {Promise<Object>} Invitation créée
   */
  const invite = useCallback(async (data) => {
    return await createInvitation(data);
  }, [createInvitation]);
  
  /**
   * Annule une invitation
   * @param {string} invitationId - ID de l'invitation
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const cancelInvite = useCallback(async (invitationId) => {
    return await cancelInvitation(invitationId);
  }, [cancelInvitation]);
  
  /**
   * Renvoie une invitation
   * @param {string} invitationId - ID de l'invitation
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const resendInvite = useCallback(async (invitationId) => {
    return await resendInvitation(invitationId);
  }, [resendInvitation]);
  
  /**
   * Recharge les invitations
   */
  const refreshInvitations = useCallback(() => {
    if (orgId) {
      fetchInvitations(orgId, true);
    }
  }, [orgId, fetchInvitations]);
  
  /**
   * Filtre les invitations par statut
   * @param {string} status - Statut à filtrer (PENDING, ACCEPTED, REJECTED, EXPIRED)
   * @returns {Array} Liste des invitations filtrées
   */
  const filterByStatus = useCallback((status) => {
    return invitations.filter(invitation => invitation.status === status);
  }, [invitations]);
  
  /**
   * Vérifie si une invitation est expirée
   * @param {Object} invitation - Invitation à vérifier
   * @returns {boolean} True si l'invitation est expirée
   */
  const isExpired = useCallback((invitation) => {
    if (invitation.status === "EXPIRED") return true;
    if (invitation.expiresAt) {
      return new Date(invitation.expiresAt) < new Date();
    }
    return false;
  }, []);
  
  // Invitations filtrées par statut
  const pendingInvitations = filterByStatus("PENDING");
  const acceptedInvitations = filterByStatus("ACCEPTED");
  const rejectedInvitations = filterByStatus("REJECTED");
  const expiredInvitations = filterByStatus("EXPIRED");
  
  // Invitations qui sont peut-être expirées mais pas encore marquées comme telles
  const actuallyExpiredInvitations = invitations.filter(inv => 
    inv.status === "PENDING" && isExpired(inv)
  );
  
  return {
    // État
    invitations,
    isLoading: invitationsLoading,
    error: invitationsError,
    
    // Invitations filtrées
    pendingInvitations,
    acceptedInvitations,
    rejectedInvitations,
    expiredInvitations,
    actuallyExpiredInvitations,
    
    // Compteurs
    totalInvitations: invitations.length,
    pendingCount: pendingInvitations.length,
    acceptedCount: acceptedInvitations.length,
    rejectedCount: rejectedInvitations.length,
    expiredCount: expiredInvitations.length,
    
    // Actions
    invite,
    cancelInvite,
    resendInvite,
    refreshInvitations,
    filterByStatus,
    isExpired
  };
}

export default useOrganizationInvitations;