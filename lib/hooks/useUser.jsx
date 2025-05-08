"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser as useAuth0User } from "@auth0/nextjs-auth0";

/**
 * Hook personnalisé pour gérer l'utilisateur avec données Prisma
 * Combine les données Auth0 avec les données personnalisées de la BDD
 */
export function useUser() {
  const { user: auth0User, error: auth0Error, isLoading: auth0Loading } = useAuth0User();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Charge les données utilisateur depuis l'API
   * Ajout d'un cache pour améliorer les performances
   */
  const fetchUserData = useCallback(async () => {
    if (!auth0User) {
      setIsLoading(false);
      return;
    }

    // Vérifier si on a des données en cache
    const cacheKey = `wisetwin_user_data_${auth0User.sub}`;
    const cachedData = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    const cacheTimestamp = typeof window !== 'undefined' ? sessionStorage.getItem(`${cacheKey}_timestamp`) : null;
    
    // Définir l'expiration du cache à 5 minutes
    const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutes en millisecondes
    const now = Date.now();
    const isCacheValid = cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_EXPIRATION;

    // Si on a un cache valide, l'utiliser
    if (isCacheValid) {
      try {
        const parsedData = JSON.parse(cachedData);
        setUser({
          ...auth0User,
          ...parsedData,
        });
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("Erreur parsing cache:", error);
        // Continuer pour récupérer les données depuis l'API
      }
    }

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout après 3 secondes
      
      const response = await fetch("/api/user/profile", {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-store' // Éviter le cache HTTP
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil utilisateur");
      }

      const data = await response.json();
      
      // Combiner les données Auth0 avec les données Prisma
      const combinedData = {
        ...auth0User,
        ...data.user, // Priorité aux données Prisma
      };
      
      setUser(combinedData);
      
      // Sauvegarder dans le cache de session
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(data.user));
          sessionStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        } catch (e) {
          console.error("Erreur stockage cache:", e);
        }
      }
    } catch (err) {
      console.error("Erreur useUser:", err);
      
      // Si l'erreur est un timeout, essayer d'utiliser le cache même s'il est périmé
      if (err.name === 'AbortError' && cachedData) {
        try {
          const parsedData = JSON.parse(cachedData);
          setUser({
            ...auth0User,
            ...parsedData,
          });
        } catch (cacheError) {
          // Si on ne peut pas utiliser le cache, fallback sur les données Auth0
          setUser(auth0User);
        }
      } else {
        setError(err.message);
        // Fallback sur les données Auth0 si l'API échoue
        setUser(auth0User);
      }
    } finally {
      setIsLoading(false);
    }
  }, [auth0User]);

  /**
   * Met à jour les données utilisateur localement et en base de données
   * @param {Object} userData - Nouvelles données utilisateur
   */
  const updateUser = useCallback(async (userData) => {
    if (!auth0User) return;

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil");
      }

      const data = await response.json();
      
      // Mettre à jour l'utilisateur dans l'état local
      const updatedUser = { ...user, ...data.user };
      setUser(updatedUser);
      
      // Mettre à jour le cache
      if (typeof window !== 'undefined' && auth0User?.sub) {
        try {
          const cacheKey = `wisetwin_user_data_${auth0User.sub}`;
          // Récupérer les données existantes du cache
          const existingCache = sessionStorage.getItem(cacheKey);
          const cachedData = existingCache ? JSON.parse(existingCache) : {};
          
          // Combiner avec les nouvelles données
          const updatedCache = { ...cachedData, ...data.user };
          
          // Sauvegarder dans le cache
          sessionStorage.setItem(cacheKey, JSON.stringify(updatedCache));
          sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        } catch (e) {
          console.error("Erreur mise à jour cache:", e);
        }
      }
      
      return { success: true, user: data.user };
    } catch (err) {
      console.error("Erreur updateUser:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [auth0User, user]);

  // Charger les données au montage du composant et quand auth0User change
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    user,
    error: error || auth0Error,
    isLoading: isLoading || auth0Loading,
    refreshUser: fetchUserData,
    updateUser,
  };
}