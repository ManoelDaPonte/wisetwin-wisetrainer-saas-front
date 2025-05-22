//lib/hooks/useOptimizedData.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "@/lib/hooks/useUser";
import { usePathname } from "next/navigation";

// Durée du cache en ms (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache global pour partager les données entre les instances du hook
let globalCache = {
  userData: null,
  trainings: [],
  stats: null,
  lastFetched: null
};

/**
 * Hook optimisé qui récupère les données utilisateur, formations et stats en un seul appel API
 * Évite les appels redondants et implémente une mise en cache côté client
 */
export function useOptimizedData({ includeTrainings = false, includeStats = false } = {}) {
  const { user } = useUser();
  const pathname = usePathname();
  const [userData, setUserData] = useState(globalCache.userData);
  const [trainings, setTrainings] = useState(globalCache.trainings);
  const [stats, setStats] = useState(globalCache.stats);
  const [isLoading, setIsLoading] = useState(globalCache.lastFetched === null);
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(false);

  // Fonction pour déterminer automatiquement quelles données charger selon la page
  const determineDataNeeds = useCallback(() => {
    // Par défaut, on suit les paramètres passés en props
    let needsTrainings = includeTrainings;
    let needsStats = includeStats;

    // Mais on ajuste selon la page si besoin
    if (pathname) {
      // Pages qui nécessitent les formations
      if (pathname.startsWith('/wisetrainer') || 
          pathname.startsWith('/guide') || 
          pathname.startsWith('/mon-profil')) {
        needsTrainings = true;
      }

      // Pages qui nécessitent les statistiques
      if (pathname.startsWith('/mon-profil')) {
        needsStats = true;
      }
    }

    return { needsTrainings, needsStats };
  }, [includeTrainings, includeStats, pathname]);

  // Fonction principale pour récupérer les données optimisées
  const fetchData = useCallback(async (force = false) => {
    // Si l'utilisateur n'est pas disponible, impossible de récupérer les données
    if (!user) return { userData: null, trainings: [], stats: null };
    
    // Les données à récupérer
    const { needsTrainings, needsStats } = determineDataNeeds();

    // Vérifier si nous avons déjà des données récentes en cache global
    if (
      !force &&
      globalCache.userData &&
      globalCache.lastFetched &&
      Date.now() - globalCache.lastFetched < CACHE_DURATION &&
      (!needsTrainings || globalCache.trainings.length > 0) &&
      (!needsStats || globalCache.stats)
    ) {
      // Mise à jour des états avec les données du cache
      setUserData(globalCache.userData);
      if (needsTrainings) setTrainings(globalCache.trainings);
      if (needsStats) setStats(globalCache.stats);
      setIsLoading(false);
      
      return { 
        userData: globalCache.userData, 
        trainings: needsTrainings ? globalCache.trainings : [], 
        stats: needsStats ? globalCache.stats : null 
      };
    }

    // Éviter les requêtes multiples simultanées
    if (isPending) {
      return { 
        userData: globalCache.userData, 
        trainings: needsTrainings ? globalCache.trainings : [], 
        stats: needsStats ? globalCache.stats : null 
      };
    }

    try {
      setIsPending(true);
      setIsLoading(true);
      setError(null);

      // Construire l'URL avec les paramètres nécessaires
      const url = `/api/optimize/user-data?trainings=${needsTrainings}&stats=${needsStats}`;
      
      // Effectuer l'appel API
      const response = await axios.get(url);
      
      if (response.data.success) {
        // Mettre à jour le cache global
        globalCache = {
          userData: response.data.user,
          trainings: response.data.trainings || [],
          stats: response.data.stats || null,
          lastFetched: Date.now()
        };
        
        // Mettre à jour les états
        setUserData(response.data.user);
        if (needsTrainings) setTrainings(response.data.trainings || []);
        if (needsStats) setStats(response.data.stats || null);
        
        return {
          userData: response.data.user,
          trainings: needsTrainings ? response.data.trainings || [] : [],
          stats: needsStats ? response.data.stats || null : null
        };
      } else {
        throw new Error(response.data.error || "Échec de la récupération des données");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données optimisées:", err);
      setError(err.message || "Erreur lors de la récupération des données");
      return { userData: null, trainings: [], stats: null };
    } finally {
      setIsLoading(false);
      setIsPending(false);
    }
  }, [user, determineDataNeeds, isPending]);

  // Effet pour charger les données au montage et quand les besoins changent
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchData]);

  // Fonction pour rafraîchir manuellement les données
  const refreshData = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    userData,
    trainings,
    stats,
    isLoading,
    error,
    refreshData,
    lastRefresh: globalCache.lastFetched
  };
}

export default useOptimizedData;