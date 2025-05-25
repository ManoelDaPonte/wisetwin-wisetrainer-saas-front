"use client";
import { useMemo } from "react";
import { useActiveContext } from "./useActiveContext";

/**
 * Hook pour gérer les permissions selon le contexte et le rôle utilisateur
 * Centralise toute la logique de permissions de l'application
 * 
 * @returns {Object} Permissions et fonctions utilitaires
 */
export function usePermissions() {
  const {
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    user,
    currentOrganization
  } = useActiveContext();
  
  /**
   * Détermine le rôle de l'utilisateur dans l'organisation active
   */
  const userRole = useMemo(() => {
    if (isPersonalMode) return 'OWNER'; // En mode personnel, l'utilisateur a tous les droits
    
    if (!currentOrganization || !user) return null;
    
    // Trouver le membre correspondant à l'utilisateur
    const member = currentOrganization.members?.find(m => 
      m.userId === user.id || 
      m.email?.toLowerCase() === user.email?.toLowerCase()
    );
    
    return member?.role || null;
  }, [isPersonalMode, currentOrganization, user]);
  
  /**
   * Vérifie si l'utilisateur a un rôle spécifique ou supérieur
   * @param {string} requiredRole - Rôle requis (MEMBER, ADMIN, OWNER)
   */
  const hasRole = useMemo(() => {
    const roleHierarchy = {
      MEMBER: 1,
      ADMIN: 2,
      OWNER: 3
    };
    
    return (requiredRole) => {
      if (!userRole) return false;
      
      const userLevel = roleHierarchy[userRole] || 0;
      const requiredLevel = roleHierarchy[requiredRole] || 0;
      
      return userLevel >= requiredLevel;
    };
  }, [userRole]);
  
  /**
   * Permissions calculées selon le contexte et le rôle
   */
  const permissions = useMemo(() => ({
    // Gestion de l'organisation
    canViewOrganization: isOrganizationMode && userRole !== null,
    canEditOrganization: isOrganizationMode && hasRole('ADMIN'),
    canDeleteOrganization: isOrganizationMode && hasRole('OWNER'),
    
    // Gestion des membres
    canViewMembers: isOrganizationMode && userRole !== null,
    canInviteMembers: isOrganizationMode && hasRole('ADMIN'),
    canRemoveMembers: isOrganizationMode && hasRole('ADMIN'),
    canEditMemberRoles: isOrganizationMode && hasRole('OWNER'),
    
    // Gestion des tags
    canViewTags: isOrganizationMode && userRole !== null,
    canCreateTags: isOrganizationMode && hasRole('ADMIN'),
    canEditTags: isOrganizationMode && hasRole('ADMIN'),
    canDeleteTags: isOrganizationMode && hasRole('ADMIN'),
    canAssignTags: isOrganizationMode && hasRole('ADMIN'),
    
    // Gestion des formations
    canViewCourses: true, // Tout le monde peut voir les formations
    canEnrollCourses: true, // Tout le monde peut s'inscrire
    canCreateCourses: isPersonalMode || (isOrganizationMode && hasRole('ADMIN')),
    canEditCourses: isPersonalMode || (isOrganizationMode && hasRole('ADMIN')),
    canDeleteCourses: isPersonalMode || (isOrganizationMode && hasRole('ADMIN')),
    canAssignCourses: isOrganizationMode && hasRole('ADMIN'),
    
    // Gestion des builds
    canUploadBuilds: isPersonalMode || (isOrganizationMode && hasRole('ADMIN')),
    canDeleteBuilds: isPersonalMode || (isOrganizationMode && hasRole('ADMIN')),
    
    // Statistiques et rapports
    canViewPersonalStats: true, // Tout le monde peut voir ses propres stats
    canViewOrganizationStats: isOrganizationMode && hasRole('ADMIN'),
    canExportReports: isOrganizationMode && hasRole('ADMIN'),
    
    // Paramètres
    canEditPersonalSettings: true,
    canEditOrganizationSettings: isOrganizationMode && hasRole('ADMIN'),
    
    // Actions spéciales
    canSwitchContext: true, // Tout le monde peut changer de contexte
    canCreateOrganization: true, // Tout le monde peut créer une organisation
  }), [isPersonalMode, isOrganizationMode, userRole, hasRole]);
  
  /**
   * Vérifie une permission spécifique
   * @param {string} permission - Nom de la permission à vérifier
   */
  const can = useMemo(() => {
    return (permission) => {
      return permissions[permission] || false;
    };
  }, [permissions]);
  
  /**
   * Vérifie plusieurs permissions (toutes doivent être vraies)
   * @param {string[]} requiredPermissions - Liste des permissions requises
   */
  const canAll = useMemo(() => {
    return (requiredPermissions) => {
      return requiredPermissions.every(perm => permissions[perm]);
    };
  }, [permissions]);
  
  /**
   * Vérifie plusieurs permissions (au moins une doit être vraie)
   * @param {string[]} requiredPermissions - Liste des permissions requises
   */
  const canAny = useMemo(() => {
    return (requiredPermissions) => {
      return requiredPermissions.some(perm => permissions[perm]);
    };
  }, [permissions]);
  
  /**
   * Obtient un message d'erreur pour une permission refusée
   * @param {string} permission - Permission refusée
   */
  const getPermissionError = useMemo(() => {
    return (permission) => {
      const messages = {
        canEditOrganization: "Vous devez être administrateur pour modifier l'organisation",
        canInviteMembers: "Vous devez être administrateur pour inviter des membres",
        canCreateTags: "Vous devez être administrateur pour créer des tags",
        canViewOrganizationStats: "Vous devez être administrateur pour voir les statistiques",
        canDeleteOrganization: "Seul le propriétaire peut supprimer l'organisation",
        canEditMemberRoles: "Seul le propriétaire peut modifier les rôles",
        default: "Vous n'avez pas les permissions nécessaires pour cette action"
      };
      
      return messages[permission] || messages.default;
    };
  }, []);
  
  /**
   * Wrapper pour exécuter une action avec vérification de permission
   * @param {string} permission - Permission requise
   * @param {Function} action - Action à exécuter
   * @param {Function} onError - Callback en cas d'erreur
   */
  const withPermission = useMemo(() => {
    return async (permission, action, onError) => {
      if (!can(permission)) {
        const error = new Error(getPermissionError(permission));
        error.code = 'PERMISSION_DENIED';
        error.permission = permission;
        
        if (onError) {
          onError(error);
        } else {
          console.error(error);
        }
        
        return null;
      }
      
      return await action();
    };
  }, [can, getPermissionError]);
  
  return {
    // Rôle actuel
    userRole,
    hasRole,
    
    // Permissions
    permissions,
    can,
    canAll,
    canAny,
    
    // Utilitaires
    getPermissionError,
    withPermission,
    
    // Helpers UI
    isAdmin: hasRole('ADMIN'),
    isOwner: hasRole('OWNER'),
    isMember: hasRole('MEMBER'),
    
    // Contexte
    contextType: activeContext.type,
    organizationName: currentOrganization?.name
  };
}

export default usePermissions;