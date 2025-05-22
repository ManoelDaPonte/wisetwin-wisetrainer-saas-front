//lib/hooks/useGuideData.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "@/lib/hooks/useUser";
import { useCurrentTraining } from "@/lib/hooks/useCurrentTraining";
import { useToast } from "@/lib/hooks/useToast";

// Durée du cache en ms (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Cache global pour partager les données entre les instances du hook
let globalCache = {
  organizationsData: null,
  lastFetched: null,
  fetchError: null,
  retryCount: 0
};

// Nombre maximum de tentatives
const MAX_RETRIES = 3;

/**
 * Hook optimisé pour la page guide qui récupère toutes les données nécessaires
 * en un seul appel API et met en cache les résultats
 */
export function useGuideData() {
  const { user } = useUser();
  const { toast } = useToast();
  const { currentTrainings, ensureTrainings } = useCurrentTraining();
  const [organizationsData, setOrganizationsData] = useState(globalCache.organizationsData || []);
  const [isLoading, setIsLoading] = useState(globalCache.lastFetched === null && globalCache.retryCount < MAX_RETRIES);
  const [error, setError] = useState(globalCache.fetchError);
  const [isPending, setIsPending] = useState(false);

  // Fonction principale pour récupérer les données du guide
  const fetchGuideData = useCallback(async (force = false) => {
    // Si l'utilisateur n'est pas disponible, impossible de récupérer les données
    if (!user) return [];
    
    // Vérifier si nous avons déjà des données récentes en cache global
    if (
      !force &&
      globalCache.organizationsData &&
      globalCache.lastFetched &&
      Date.now() - globalCache.lastFetched < CACHE_DURATION
    ) {
      setOrganizationsData(globalCache.organizationsData);
      setIsLoading(false);
      return globalCache.organizationsData;
    }

    // Éviter les requêtes multiples simultanées
    if (isPending) return globalCache.organizationsData || [];

    // Vérifier si on a déjà trop d'erreurs
    if (globalCache.retryCount >= MAX_RETRIES && !force) {
      setIsLoading(false);
      setError(globalCache.fetchError || "Trop de tentatives infructueuses");
      return [];
    }

    try {
      setIsPending(true);
      setIsLoading(true);
      setError(null);

      // S'assurer d'avoir les données des formations utilisateur
      await ensureTrainings();
      
      // Effectuer l'appel API optimisé
      const response = await axios.get('/api/optimize/guide-data');
      
      if (response.data.success) {
        // Transformer les données pour les rendre utilisables par les composants
        const enrichedOrganizations = response.data.organizations.map(org => {
          // Regrouper les builds par tags
          const buildsByTag = {};
          
          // Pour chaque tag utilisateur, trouver les builds associés
          org.userTags.forEach(tag => {
            buildsByTag[tag.id] = org.builds.filter(build => 
              build.tags && build.tags.some(buildTag => buildTag.id === tag.id)
            );
          });
          
          return {
            ...org,
            totalMembers: org.members.length,
            totalBuilds: org.builds.length,
            buildsByTag
          };
        });
        
        // Réinitialiser le compteur d'erreurs
        globalCache = {
          organizationsData: enrichedOrganizations,
          lastFetched: Date.now(),
          fetchError: null,
          retryCount: 0
        };
        
        setOrganizationsData(enrichedOrganizations);
        setError(null);
        return enrichedOrganizations;
      } else {
        throw new Error(response.data.error || "Échec de la récupération des données du guide");
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des données du guide:", err);
      
      // Mettre à jour le cache global d'erreurs
      globalCache = {
        ...globalCache,
        fetchError: err.message || "Erreur lors de la récupération des données du guide",
        retryCount: globalCache.retryCount + 1
      };
      
      setError(err.message || "Erreur lors de la récupération des données du guide");
      
      // Notification à l'utilisateur uniquement à la première erreur
      if (globalCache.retryCount === 1) {
        toast({
          title: "Erreur",
          description: "Un problème est survenu lors du chargement des données",
          variant: "destructive",
        });
      }
      
      return [];
    } finally {
      setIsLoading(false);
      setIsPending(false);
    }
  }, [user, isPending, ensureTrainings, toast]);

  // Effet pour charger les données au montage
  useEffect(() => {
    if (user) {
      fetchGuideData();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchGuideData]);

  // Fonction pour rafraîchir manuellement les données
  const refreshData = useCallback(async () => {
    // Force le rechargement même après plusieurs erreurs
    globalCache.retryCount = 0;
    return fetchGuideData(true);
  }, [fetchGuideData]);

  return {
    organizationsData,
    trainings: currentTrainings,
    isLoading,
    error,
    refreshData,
    lastRefresh: globalCache.lastFetched
  };
}

export default useGuideData;