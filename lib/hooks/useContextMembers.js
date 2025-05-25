"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useActiveContext } from "./useActiveContext";
import { useOrganizationMembers } from "./useOrganizationMembers";
import { useOrganizationTags } from "./useOrganizationTags";
import { usePermissions } from "./usePermissions";

/**
 * Hook pour gérer les membres selon le contexte actif
 * En mode personnel : retourne uniquement l'utilisateur actuel
 * En mode organisation : retourne les membres de l'organisation avec leurs tags
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage
 * @param {boolean} options.withTags - Inclure les tags des membres
 * @returns {Object} Membres et fonctions selon le contexte
 */
export function useContextMembers({ autoLoad = true, withTags = true } = {}) {
  const [contextMembers, setContextMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    user,
    currentOrganization
  } = useActiveContext();
  
  const { can } = usePermissions();
  
  // Hook pour les membres d'organisation
  const {
    members: orgMembers,
    membersWithTags,
    isLoading: orgMembersLoading,
    error: orgMembersError,
    loadMembers,
    loadMembersWithTags,
    inviteMember,
    removeMember,
    updateMemberRole
  } = useOrganizationMembers({
    organizationId: isOrganizationMode ? currentOrganization?.id : null,
    autoLoad: false
  });
  
  // Hook pour les tags
  const {
    tags,
    loadTags,
    assignTagsToMember,
    removeTagFromMember
  } = useOrganizationTags({
    organizationId: isOrganizationMode ? currentOrganization?.id : null,
    autoLoad: false
  });
  
  /**
   * Charge les membres selon le contexte
   */
  const loadContextMembers = useCallback(async (force = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isPersonalMode) {
        // En mode personnel, le seul "membre" est l'utilisateur
        const personalMember = {
          id: user?.id,
          userId: user?.id,
          name: user?.name,
          email: user?.email,
          profileImage: user?.profileImage,
          role: 'OWNER',
          joinedAt: user?.createdAt,
          tags: [],
          isCurrentUser: true
        };
        
        setContextMembers([personalMember]);
        return [personalMember];
      } else if (isOrganizationMode && currentOrganization) {
        // En mode organisation, charger les membres
        if (!can('canViewMembers')) {
          throw new Error("Vous n'avez pas la permission de voir les membres");
        }
        
        let members;
        if (withTags) {
          members = await loadMembersWithTags(force);
          // Charger aussi les tags disponibles
          await loadTags(force);
        } else {
          members = await loadMembers(force);
        }
        
        // Enrichir avec l'indicateur utilisateur actuel
        const enrichedMembers = members.map(member => ({
          ...member,
          isCurrentUser: member.userId === user?.id || 
                        member.email?.toLowerCase() === user?.email?.toLowerCase()
        }));
        
        setContextMembers(enrichedMembers);
        return enrichedMembers;
      }
      
      setContextMembers([]);
      return [];
    } catch (err) {
      console.error('Erreur lors du chargement des membres:', err);
      setError(err.message);
      setContextMembers([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [
    isPersonalMode,
    isOrganizationMode,
    user,
    currentOrganization,
    can,
    withTags,
    loadMembers,
    loadMembersWithTags,
    loadTags
  ]);
  
  // Charger automatiquement au changement de contexte
  useEffect(() => {
    if (autoLoad && user) {
      loadContextMembers();
    }
  }, [autoLoad, user, activeContext.type, activeContext.organizationId, loadContextMembers]);
  
  /**
   * Invite un nouveau membre (organisation uniquement)
   */
  const inviteContextMember = useCallback(async (email, role = 'MEMBER') => {
    if (!isOrganizationMode || !can('canInviteMembers')) {
      throw new Error("Action non autorisée dans ce contexte");
    }
    
    const result = await inviteMember(email, role);
    
    // Recharger les membres
    if (result) {
      await loadContextMembers(true);
    }
    
    return result;
  }, [isOrganizationMode, can, inviteMember, loadContextMembers]);
  
  /**
   * Retire un membre (organisation uniquement)
   */
  const removeContextMember = useCallback(async (memberId) => {
    if (!isOrganizationMode || !can('canRemoveMembers')) {
      throw new Error("Action non autorisée dans ce contexte");
    }
    
    const result = await removeMember(memberId);
    
    // Recharger les membres
    if (result) {
      await loadContextMembers(true);
    }
    
    return result;
  }, [isOrganizationMode, can, removeMember, loadContextMembers]);
  
  /**
   * Met à jour le rôle d'un membre (organisation uniquement)
   */
  const updateContextMemberRole = useCallback(async (memberId, newRole) => {
    if (!isOrganizationMode || !can('canEditMemberRoles')) {
      throw new Error("Action non autorisée dans ce contexte");
    }
    
    const result = await updateMemberRole(memberId, newRole);
    
    // Recharger les membres
    if (result) {
      await loadContextMembers(true);
    }
    
    return result;
  }, [isOrganizationMode, can, updateMemberRole, loadContextMembers]);
  
  /**
   * Assigne des tags à un membre (organisation uniquement)
   */
  const assignContextMemberTags = useCallback(async (memberId, tagIds) => {
    if (!isOrganizationMode || !can('canAssignTags')) {
      throw new Error("Action non autorisée dans ce contexte");
    }
    
    const result = await assignTagsToMember(memberId, tagIds);
    
    // Recharger les membres avec tags
    if (result && withTags) {
      await loadContextMembers(true);
    }
    
    return result;
  }, [isOrganizationMode, can, assignTagsToMember, withTags, loadContextMembers]);
  
  /**
   * Statistiques des membres
   */
  const memberStats = useMemo(() => {
    const total = contextMembers.length;
    const admins = contextMembers.filter(m => m.role === 'ADMIN').length;
    const owners = contextMembers.filter(m => m.role === 'OWNER').length;
    const regularMembers = contextMembers.filter(m => m.role === 'MEMBER').length;
    
    // Compter les tags uniques
    const uniqueTags = new Set();
    contextMembers.forEach(member => {
      (member.tags || []).forEach(tag => uniqueTags.add(tag.id));
    });
    
    return {
      total,
      byRole: {
        owners,
        admins,
        members: regularMembers
      },
      uniqueTagsCount: uniqueTags.size,
      averageTagsPerMember: total > 0 
        ? Math.round(contextMembers.reduce((acc, m) => acc + (m.tags?.length || 0), 0) / total * 10) / 10
        : 0
    };
  }, [contextMembers]);
  
  /**
   * Filtre les membres par tag
   */
  const getMembersByTag = useCallback((tagId) => {
    return contextMembers.filter(member => 
      member.tags?.some(tag => tag.id === tagId)
    );
  }, [contextMembers]);
  
  /**
   * Recherche des membres
   */
  const searchMembers = useCallback((query) => {
    const lowerQuery = query.toLowerCase();
    return contextMembers.filter(member => 
      member.name?.toLowerCase().includes(lowerQuery) ||
      member.email?.toLowerCase().includes(lowerQuery) ||
      member.tags?.some(tag => tag.name.toLowerCase().includes(lowerQuery))
    );
  }, [contextMembers]);
  
  return {
    // Données
    members: contextMembers,
    isLoading: isLoading || orgMembersLoading,
    error: error || orgMembersError,
    
    // Métadonnées
    contextType: activeContext.type,
    contextName: activeContext.name,
    canManageMembers: can('canInviteMembers'),
    
    // Statistiques
    stats: memberStats,
    
    // Actions (disponibles uniquement en mode organisation)
    inviteMember: isOrganizationMode ? inviteContextMember : null,
    removeMember: isOrganizationMode ? removeContextMember : null,
    updateMemberRole: isOrganizationMode ? updateContextMemberRole : null,
    assignMemberTags: isOrganizationMode ? assignContextMemberTags : null,
    
    // Utilitaires
    refreshMembers: () => loadContextMembers(true),
    getMembersByTag,
    searchMembers,
    
    // Tags disponibles (organisation uniquement)
    availableTags: isOrganizationMode ? tags : [],
    
    // Membre actuel
    currentMember: contextMembers.find(m => m.isCurrentUser)
  };
}

export default useContextMembers;