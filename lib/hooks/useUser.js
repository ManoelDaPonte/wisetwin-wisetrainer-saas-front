"use client";
import { useEffect, useCallback } from "react";
import { useUserStore } from "../store/userStore";
import { useRouter, usePathname } from "next/navigation";

/**
 * Hook composable pour accéder et gérer les données utilisateur
 * Fournit une interface simple pour utiliser le store utilisateur dans les composants
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage (défaut: true)
 * @param {boolean} options.requireAuth - Redirige vers la page de login si non authentifié (défaut: false)
 * @returns {Object} Données et fonctions pour interagir avec l'utilisateur
 */
export function useUser({ 
  autoLoad = true, 
  requireAuth = false 
} = {}) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Récupérer l'état et les actions du store
  // Fix: Stocker seulement les propriétés nécessaires sans utiliser de selector function
  const user = useUserStore(state => state.user);
  const isLoading = useUserStore(state => state.isLoading);
  const error = useUserStore(state => state.error);
  const fetchUser = useUserStore(state => state.fetchUser);
  const updateUserLocally = useUserStore(state => state.updateUserLocally);
  const updateProfile = useUserStore(state => state.updateProfile);
  const updateName = useUserStore(state => state.updateName);
  const resetState = useUserStore(state => state.resetState);
  const deleteAccount = useUserStore(state => state.deleteAccount);

  // Vérifier si la route actuelle est une page protégée
  const isProtectedRoute = useCallback(() => {
    const publicRoutes = ['/login', '/signup', '/reset-password', '/invitations'];
    return !publicRoutes.some(route => pathname?.startsWith(route));
  }, [pathname]);
  
  // Charger l'utilisateur au montage si nécessaire
  useEffect(() => {
    if (autoLoad && (requireAuth || isProtectedRoute())) {
      fetchUser();
    }
  }, [autoLoad, requireAuth, isProtectedRoute, fetchUser]);
  
  // Rediriger vers la page de login si l'authentification est requise et l'utilisateur n'est pas connecté
  useEffect(() => {
    if (requireAuth && !isLoading && !user && error) {
      router.push('/login');
    }
  }, [requireAuth, isLoading, user, error, router]);
  
  /**
   * Met à jour le profil utilisateur
   * @param {Object} data - Données à mettre à jour
   */
  const updateUserProfile = useCallback(async (data) => {
    return await updateProfile(data);
  }, [updateProfile]);
  
  /**
   * Met à jour le nom de l'utilisateur
   * @param {string} name - Nouveau nom
   */
  const changeUserName = useCallback(async (name) => {
    return await updateName(name);
  }, [updateName]);
  
  /**
   * Déconnecte l'utilisateur
   */
  const logout = useCallback(() => {
    resetState();
    window.location.href = "/api/auth/logout";
  }, [resetState]);
  
  /**
   * Supprime le compte de l'utilisateur
   */
  const removeAccount = useCallback(async () => {
    const success = await deleteAccount();
    if (success) {
      router.push('/');
    }
    return success;
  }, [deleteAccount, router]);
  
  return {
    // État
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    
    // Actions
    refreshUser: () => fetchUser(true),
    updateUser: updateUserLocally,
    updateProfile: updateUserProfile,
    updateName: changeUserName,
    logout,
    deleteAccount: removeAccount,
    
    // Données utilisateur formatées
    userId: user?.id,
    email: user?.email,
    name: user?.name,
    azureContainer: user?.azureContainer
  };
}

export default useUser;