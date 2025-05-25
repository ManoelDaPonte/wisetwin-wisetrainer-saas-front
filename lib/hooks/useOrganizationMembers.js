"use client";
import { useEffect, useCallback } from "react";
import { useOrganizationStore } from "../store/organizationStore";
import { useOrganization } from "./useOrganization";

/**
 * Hook composable pour gérer les membres d'une organisation
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les membres au montage (défaut: true)
 * @param {boolean} options.withTags - Charge les membres avec leurs tags (défaut: false)
 * @param {string} options.organizationId - ID de l'organisation (utilise l'organisation active par défaut)
 * @returns {Object} Données et fonctions pour gérer les membres
 */
export function useOrganizationMembers({
  autoLoad = true,
  withTags = false,
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
    members,
    membersWithTags,
    membersLoading,
    membersError,
    fetchMembers,
    fetchMembersWithTags,
    addMember,
    removeMember
  } = useOrganizationStore(state => ({
    members: state.members,
    membersWithTags: state.membersWithTags,
    membersLoading: state.membersLoading,
    membersError: state.membersError,
    fetchMembers: state.fetchMembers,
    fetchMembersWithTags: state.fetchMembersWithTags,
    addMember: state.addMember,
    removeMember: state.removeMember
  }));
  
  // Charger les membres au montage si nécessaire
  useEffect(() => {
    if (autoLoad && orgId) {
      if (withTags) {
        fetchMembersWithTags(orgId);
      } else {
        fetchMembers(orgId);
      }
    }
  }, [autoLoad, orgId, withTags, fetchMembers, fetchMembersWithTags]);
  
  /**
   * Ajoute un nouveau membre à l'organisation
   * @param {Object} data - Données du membre (email, role)
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const inviteMember = useCallback(async (data) => {
    return await addMember(data);
  }, [addMember]);
  
  /**
   * Supprime un membre de l'organisation
   * @param {string} memberId - ID du membre à supprimer
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const deleteMember = useCallback(async (memberId) => {
    return await removeMember(memberId);
  }, [removeMember]);
  
  /**
   * Recharge les membres (avec ou sans tags)
   */
  const refreshMembers = useCallback(() => {
    if (orgId) {
      if (withTags) {
        fetchMembersWithTags(orgId, true);
      } else {
        fetchMembers(orgId, true);
      }
    }
  }, [orgId, withTags, fetchMembers, fetchMembersWithTags]);
  
  // Liste des membres à retourner (avec ou sans tags)
  const membersList = withTags ? membersWithTags : members;
  
  /**
   * Filtre les membres par rôle
   * @param {string} role - Rôle à filtrer ("OWNER", "ADMIN", "MEMBER")
   * @returns {Array} Liste des membres filtrés
   */
  const filterByRole = useCallback((role) => {
    return membersList.filter(member => member.role === role);
  }, [membersList]);
  
  // Compteurs par rôle
  const ownersCount = membersList.filter(m => m.role === "OWNER").length;
  const adminsCount = membersList.filter(m => m.role === "ADMIN").length;
  const membersCount = membersList.filter(m => m.role === "MEMBER").length;
  
  return {
    // État
    members: membersList,
    isLoading: membersLoading,
    error: membersError,
    
    // Compteurs
    totalMembers: membersList.length,
    ownersCount,
    adminsCount,
    membersCount,
    
    // Listes filtrées
    owners: filterByRole("OWNER"),
    admins: filterByRole("ADMIN"),
    regularMembers: filterByRole("MEMBER"),
    
    // Actions
    inviteMember,
    deleteMember,
    refreshMembers,
    filterByRole
  };
}

export default useOrganizationMembers;