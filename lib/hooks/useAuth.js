"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./useUser";

/**
 * Hook composable pour la gestion de l'authentification
 * Permet de protéger facilement les routes et gérer la redirection
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.requireAuth - Redirige vers login si non authentifié (défaut: true)
 * @param {string} options.redirectTo - Page de redirection si non authentifié (défaut: "/login")
 * @param {Function} options.onAuthSuccess - Callback appelé quand l'authentification réussit
 * @returns {Object} État d'authentification et fonctions associées
 */
export function useAuth({
  requireAuth = true,
  redirectTo = "/login",
  onAuthSuccess = null
} = {}) {
  const router = useRouter();
  
  // Utiliser useUser avec chargement automatique
  const { user, isLoading, error, isAuthenticated, logout } = useUser({ 
    autoLoad: true,
    requireAuth: false // Gérer manuellement la redirection ici
  });
  
  // Gérer la redirection et la protection de route
  useEffect(() => {
    // Ne rien faire pendant le chargement
    if (isLoading) return;
    
    if (requireAuth && !isAuthenticated) {
      // Rediriger vers la page de login si l'authentification est requise
      // mais l'utilisateur n'est pas connecté
      router.push(redirectTo);
    } else if (isAuthenticated && onAuthSuccess) {
      // Appeler le callback de succès d'authentification si défini
      onAuthSuccess(user);
    }
  }, [isLoading, isAuthenticated, requireAuth, redirectTo, router, user, onAuthSuccess]);
  
  return {
    isAuthenticated,
    isLoading,
    user,
    error,
    logout
  };
}

export default useAuth;