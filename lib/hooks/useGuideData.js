"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useUser } from "./useUser";
import { useOrganization } from "./useOrganization";
import { useCourses } from "./useCourses";
import { useToast } from "@/lib/hooks/useToast";

/**
 * Hook composable pour la page guide qui agrège les données des
 * différents stores (utilisateur, organisations, formations)
 * 
 * Version mise à jour pour utiliser le hook useCourses et éviter la boucle infinie
 * 
 * @param {Object} options - Options du hook
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage
 * @returns {Object} Données et fonctions pour la page guide
 */
export function useGuideData({ autoLoad = true } = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [activeContext, setActiveContext] = useState(null);
  
  // Hooks pour les toast notifications
  const { toast } = useToast();
  
  // Hooks pour l'utilisateur et ses formations
  // Fixer le chargement multiple en spécifiant autoLoad: false
  const { user, isAuthenticated } = useUser({ autoLoad: false });

  // Récupérer le contexte actif depuis localStorage
  useEffect(() => {
    const storedContext = localStorage.getItem('wisetwin-active-context');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        setActiveContext(context);
      } catch {
        setActiveContext({ type: 'personal', name: 'Mode Personnel' });
      }
    } else {
      setActiveContext({ type: 'personal', name: 'Mode Personnel' });
    }
  }, []);
  
  // Condition pour éviter les chargements automatiques redondants
  // Si cette hook est utilisée comme point d'entrée, nous voulons contrôler
  // quand et comment nous chargeons les données
  const shouldAutoLoad = autoLoad && !isPending;
  
  // État local pour les formations suivies par l'utilisateur (depuis BDD)
  const [userTrainings, setUserTrainings] = useState({
    inProgress: [],
    completed: [],
    failed: [],
    all: []
  });
  const [trainingStats, setTrainingStats] = useState(null);
  const [trainingsLoading, setTrainingsLoading] = useState(false);
  const [trainingsError, setTrainingsError] = useState(null);
  
  // Hook pour les organisations (seulement pour récupérer la liste)
  const { 
    organizations: allOrganizations,
    hasOrganizations,
    isLoading: orgsLoading,
    error: orgsError,
    loadOrganizations
  } = useOrganization({ 
    autoLoad: false // On charge manuellement selon le besoin
  });
  
  // État local pour stocker les données de l'organisation sélectionnée
  const [currentOrganizationData, setCurrentOrganizationData] = useState(null);

  /**
   * Fonction pour charger les formations suivies par l'utilisateur depuis la BDD
   */
  const loadUserTrainings = useCallback(async () => {
    if (!user?.azureContainer) {
      setUserTrainings({ inProgress: [], completed: [], failed: [], all: [] });
      setTrainingStats(null);
      return;
    }

    setTrainingsLoading(true);
    setTrainingsError(null);

    try {
      const response = await fetch(`/api/db/wisetrainer/user-trainings/${user.azureContainer}`);
      const data = await response.json();

      if (data.success) {
        setUserTrainings(data.trainings);
        setTrainingStats(data.stats);
      } else {
        throw new Error(data.error || 'Erreur lors du chargement des formations');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des formations utilisateur:', err);
      setTrainingsError(err.message);
      setUserTrainings({ inProgress: [], completed: [], failed: [], all: [] });
      setTrainingStats(null);
    } finally {
      setTrainingsLoading(false);
    }
  }, [user?.azureContainer]);
  
  /**
   * Fonction pour charger les données de l'organisation sélectionnée
   * @param {Object} orgContext - Contexte de l'organisation sélectionnée
   */
  const loadCurrentOrganizationData = useCallback(async (orgContext) => {
    if (!orgContext || orgContext.type !== 'organization') {
      setCurrentOrganizationData(null);
      return null;
    }
    
    setIsPending(true);
    
    try {
      // Importer les services API
      const { organizationApi } = await import('../services/api/organizationApi');
      
      // Charger les détails de l'organisation sélectionnée
      const [members, tags, builds] = await Promise.all([
        organizationApi.getMembersWithTags(orgContext.id),
        organizationApi.getOrganizationTags(orgContext.id),
        organizationApi.getOrganizationBuilds(orgContext.id)
      ]);
      
      // Trouver les tags de l'utilisateur
      const userEmail = user?.email || user?.name;
      const currentUser = userEmail ? members.find(
        (m) =>
          (m.email && m.email.toLowerCase() === userEmail.toLowerCase()) ||
          (m.name && m.name.toLowerCase() === userEmail.toLowerCase())
      ) : null;
      const userTags = currentUser?.tags || [];
      
      // Regrouper les builds par tag
      const buildsByTag = {};
      userTags.forEach(tag => {
        buildsByTag[tag.id] = builds.filter(build => 
          build.tags && build.tags.some(buildTag => buildTag.id === tag.id)
        );
      });
      
      // Construire l'objet enrichi
      const enrichedData = {
        id: orgContext.id,
        name: orgContext.name,
        logoUrl: orgContext.logoUrl,
        azureContainer: orgContext.azureContainer,
        members,
        tags,
        builds,
        userTags,
        buildsByTag,
        totalMembers: members.length,
        totalBuilds: builds.length
      };
      
      setCurrentOrganizationData(enrichedData);
      return enrichedData;
    } catch (err) {
      console.error(`Erreur lors du chargement des données pour l'organisation ${orgContext.id}:`, err);
      setError(err.message || "Erreur lors du chargement des données de l'organisation");
      return null;
    } finally {
      setIsPending(false);
    }
  }, [user]);
  
  // Effet pour charger les formations utilisateur
  useEffect(() => {
    if (user?.azureContainer && shouldAutoLoad) {
      loadUserTrainings();
    }
  }, [user?.azureContainer, shouldAutoLoad, loadUserTrainings]);

  // Effet pour charger les données selon le contexte actif
  useEffect(() => {
    if (!activeContext) return;
    
    if (activeContext.type === 'organization') {
      // Charger les données de l'organisation sélectionnée
      console.log('Chargement des données pour l\'organisation:', activeContext.name);
      loadCurrentOrganizationData(activeContext);
    } else {
      // Mode personnel - pas besoin de données d'organisation
      console.log('Mode personnel activé');
      setCurrentOrganizationData(null);
    }
  }, [activeContext, loadCurrentOrganizationData]);
  
  // Mettre à jour l'état de chargement global
  useEffect(() => {
    // Chargement initial ou rafraîchissement
    const isLoadingAny = trainingsLoading || isPending || !activeContext;
    setIsLoading(isLoadingAny);
    
    // Mettre à jour l'horodatage de la dernière actualisation
    if (!isLoadingAny && activeContext) {
      setLastRefresh(new Date());
    }
    
    // Mettre à jour l'erreur globale
    if (trainingsError) {
      setError(trainingsError);
    }
  }, [
    trainingsLoading, isPending, activeContext,
    userTrainings.all.length, trainingsError
  ]);
  
  /**
   * Transforme les données de l'organisation sélectionnée pour être compatibles avec les composants existants
   */
  const formattedOrganizationData = useMemo(() => {
    if (!currentOrganizationData || activeContext?.type !== 'organization') {
      return [];
    }

    const org = currentOrganizationData;
    
    // Extraire les formations taguées basées sur les tags de l'utilisateur
    let taggedTrainings = [];
    if (org.buildsByTag) {
      // Aplatir toutes les formations taguées
      taggedTrainings = Object.values(org.buildsByTag)
        .flat()
        .map(training => ({
          ...training,
          organizationId: org.id,
          organizationName: org.name,
          source: {
            type: "organization",
            name: org.name,
            organizationId: org.id,
          }
        }));
    }
    
    // Formater les formations de l'organisation
    const orgTrainings = (org.builds || []).map(build => ({
      ...build,
      organizationId: org.id,
      organizationName: org.name,
      source: {
        type: "organization",
        name: org.name,
        organizationId: org.id,
      }
    }));
    
    return [{
      organization: {
        id: org.id,
        name: org.name,
        description: org.description,
        logoUrl: org.logoUrl
      },
      userTags: org.userTags || [],
      taggedTrainings,
      orgTrainings,
      hasCompletedTaggedTrainings: false // Ce champ nécessiterait plus de logique
    }];
  }, [currentOrganizationData, activeContext]);
  
  /**
   * Fonction pour rafraîchir toutes les données selon le contexte actif
   */
  const refreshData = useCallback(async () => {
    // Eviter des opérations multiples pendant un rafraîchissement
    if (isPending) {
      console.log("Déjà en cours de rafraîchissement, opération ignorée");
      return false;
    }
    
    setIsPending(true);
    setError(null);
    
    try {
      console.log("Rafraîchissement des données démarré:", new Date().toISOString());
      
      // Rafraîchir les formations suivies par l'utilisateur (depuis BDD)
      await loadUserTrainings().catch(e => {
        console.error("Erreur lors du rafraîchissement des formations utilisateur:", e);
        throw e;
      });
      
      // Si on est en mode organisation, rafraîchir les données de l'organisation
      if (activeContext?.type === 'organization') {
        await loadCurrentOrganizationData(activeContext).catch(e => {
          console.error("Erreur lors du rafraîchissement de l'organisation:", e);
          throw e;
        });
      }
      
      // Timestamp pour le rafraîchissement
      const timestamp = new Date();
      setLastRefresh(timestamp);
      console.log("Rafraîchissement terminé:", timestamp.toISOString());
      
      return true;
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des données:", err);
      
      setError(err.message || "Erreur lors du rafraîchissement des données");
      
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors du chargement des données.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsPending(false);
    }
  }, [loadUserTrainings, loadCurrentOrganizationData, activeContext, toast, isPending]);
  
  // Vérifier si nous avons des formations à afficher selon le contexte
  const hasAnyTraining = useMemo(() => {
    return userTrainings.all.length > 0;
  }, [userTrainings.all.length]);
  
  // Déterminer si l'utilisateur a des organisations (pour les composants qui en ont besoin)
  const contextHasOrganizations = activeContext?.type === 'organization';
  
  return {
    // Données selon le contexte actif
    organizations: currentOrganizationData ? [currentOrganizationData] : [],
    
    // Données formatées pour les composants existants
    organizationsData: formattedOrganizationData,
    
    // Formations suivies par l'utilisateur (depuis BDD avec statuts)
    trainings: userTrainings.inProgress, // Formations en cours pour le panneau principal
    allTrainings: userTrainings, // Toutes les formations catégorisées
    trainingStats: trainingStats, // Statistiques globales
    
    // État
    isLoading,
    error,
    hasOrganizations: contextHasOrganizations,
    hasAnyTraining,
    
    // Actions
    refreshData,
    
    // Métadonnées
    lastRefresh: lastRefresh,
    
    // Contexte actuel pour information
    activeContext
  };
}

export default useGuideData;