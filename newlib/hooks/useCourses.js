"use client";
import { useEffect, useCallback } from "react";
import { useCourseStore } from "../store/courseStore";
import { useUser } from "./useUser";
import { usePathname } from "next/navigation";

/**
 * Hook composable pour accéder et gérer les données des cours
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage (défaut: false)
 * @param {string} options.containerName - Container Azure (si vide, utilise celui de l'utilisateur)
 * @returns {Object} Données et fonctions pour interagir avec les cours
 */
export function useCourses({
  autoLoad = false,
  containerName = null
} = {}) {
  const pathname = usePathname();
  
  // Récupérer l'utilisateur pour son container Azure
  const { user } = useUser({ autoLoad: false });
  
  // Récupérer l'état et les actions du store
  // Correction: Au lieu d'utiliser un sélecteur qui crée un nouvel objet à chaque rendu,
  // nous sélectionnons individuellement chaque valeur
  const userCourses = useCourseStore(state => state.userCourses);
  const isLoading = useCourseStore(state => state.isLoading);
  const error = useCourseStore(state => state.error);
  const lastFetched = useCourseStore(state => state.lastFetched);
  const setAzureContainer = useCourseStore(state => state.setAzureContainer);
  const fetchUserCourses = useCourseStore(state => state.fetchUserCourses);
  
  // Détermine le container à utiliser
  const effectiveContainer = containerName || user?.azureContainer;
  
  // Mettre à jour le container dans le store si nécessaire
  useEffect(() => {
    if (effectiveContainer) {
      setAzureContainer(effectiveContainer);
    }
  }, [effectiveContainer, setAzureContainer]);
  
  // Détermine si les données doivent être chargées immédiatement
  const shouldLoadImmediately = useCallback(() => {
    // Pages qui nécessitent les données dès le chargement
    const immediateLoadPages = [
      '/wisetrainer',
      '/guide',
      '/mon-profil'
    ];
    
    // Vérifier si le chemin actuel commence par l'un des préfixes ci-dessus
    return pathname && immediateLoadPages.some(page => pathname.startsWith(page));
  }, [pathname]);
  
  // Charger les données si nécessaire
  useEffect(() => {
    if (autoLoad && effectiveContainer && shouldLoadImmediately()) {
      fetchUserCourses(effectiveContainer);
    }
  }, [autoLoad, effectiveContainer, shouldLoadImmediately, fetchUserCourses]);
  
  /**
   * Garantit que les données sont chargées avant utilisation
   * @returns {Promise<Array>} Formations de l'utilisateur
   */
  const ensureCourses = useCallback(async () => {
    if (!effectiveContainer) return [];
    
    // Si on a déjà les données et qu'elles sont récentes, les retourner
    if (userCourses.length > 0 && lastFetched) {
      return userCourses;
    }
    
    // Sinon, charger les données
    return await fetchUserCourses(effectiveContainer);
  }, [effectiveContainer, userCourses, lastFetched, fetchUserCourses]);
  
  /**
   * Rafraîchit les données des formations
   * @returns {Promise<Array>} Formations mises à jour
   */
  const refreshCourses = useCallback(() => {
    if (effectiveContainer) {
      return fetchUserCourses(effectiveContainer, true);
    }
    return [];
  }, [effectiveContainer, fetchUserCourses]);
  
  return {
    // Données
    courses: userCourses,
    isLoading,
    error,
    lastRefresh: lastFetched,
    
    // Actions
    refreshCourses,
    ensureCourses,
    
    // Données dérivées
    hasAnyCourse: userCourses.length > 0,
    completedCourses: userCourses.filter(course => course.progress === 100)
  };
}

export default useCourses;