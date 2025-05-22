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
  
  // Hooks pour les toast notifications
  const { toast } = useToast();
  
  // Hooks pour l'utilisateur et ses formations
  // Fixer le chargement multiple en spécifiant autoLoad: false
  const { user, isAuthenticated } = useUser({ autoLoad: false });
  
  // Condition pour éviter les chargements automatiques redondants
  // Si cette hook est utilisée comme point d'entrée, nous voulons contrôler
  // quand et comment nous chargeons les données
  const shouldAutoLoad = autoLoad && !isPending;
  
  // Hook pour les formations utilisateur (nouveau hook centralisé)
  const { 
    courses: currentTrainings, 
    isLoading: coursesLoading, 
    error: coursesError,
    refreshCourses,
    lastRefresh: coursesLastRefresh
  } = useCourses({ 
    autoLoad: shouldAutoLoad,
    containerName: user?.azureContainer
  });
  
  // Hook principal pour les organisations de l'utilisateur
  const { 
    organizations,
    hasOrganizations,
    isLoading: orgsLoading,
    error: orgsError,
    loadOrganizations
  } = useOrganization({ 
    autoLoad: shouldAutoLoad && isAuthenticated
  });
  
  // État local pour stocker les données enrichies
  const [enrichedOrganizations, setEnrichedOrganizations] = useState([]);
  
  // Référence pour suivre les IDs des organisations et éviter les boucles infinies
  const orgIdsRef = useRef("");
  
  /**
   * Fonction pour enrichir les organisations avec leurs détails
   * Utilise nos services API centralisés au lieu d'appels fetch directs
   * @param {Array} orgs - Liste des organisations à enrichir
   */
  const loadOrganizationsDetails = useCallback(async (orgs) => {
    if (!orgs || orgs.length === 0) {
      setEnrichedOrganizations([]);
      return [];
    }
    
    setIsPending(true);
    
    try {
      // Importer les services API
      const { organizationApi } = await import('../services/api/organizationApi');
      
      // Charger les détails de chaque organisation en parallèle
      const enrichedData = await Promise.all(
        orgs.map(async (org) => {
          try {
            // Utiliser nos services API centralisés au lieu de fetch directs
            const [members, tags, builds] = await Promise.all([
              organizationApi.getMembersWithTags(org.id),
              organizationApi.getOrganizationTags(org.id),
              organizationApi.getOrganizationBuilds(org.id)
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
            return {
              ...org,
              members,
              tags,
              builds,
              userTags,
              buildsByTag,
              totalMembers: members.length,
              totalBuilds: builds.length
            };
          } catch (err) {
            console.error(`Erreur lors du chargement des données pour l'organisation ${org.id}:`, err);
            return {
              ...org,
              members: [],
              tags: [],
              builds: [],
              userTags: [],
              buildsByTag: {},
              totalMembers: 0,
              totalBuilds: 0,
              error: err.message
            };
          }
        })
      );
      
      setEnrichedOrganizations(enrichedData);
      return enrichedData;
    } catch (err) {
      console.error("Erreur lors du chargement des données détaillées:", err);
      setError(err.message || "Erreur lors du chargement des données");
      return [];
    } finally {
      setIsPending(false);
    }
  }, [user]);
  
  // Effet pour charger les données détaillées lorsque la liste des organisations change
  // avec une protection contre les appels inutiles
  useEffect(() => {
    // Ne charger les détails que si les organisations ont changé et ne sont pas vides
    if (organizations && organizations.length > 0) {
      // Vérifier si les organisations ont réellement changé en comparant les IDs
      const newOrgIds = organizations.map(org => org.id).sort().join(',');
      
      // Vérifier si les organisations ont changé depuis le dernier rendu
      // en utilisant une référence pour éviter les boucles infinies
      if (orgIdsRef.current !== newOrgIds) {
        console.log('Organisations modifiées, chargement des détails:', organizations.length);
        orgIdsRef.current = newOrgIds;  // Mettre à jour la référence
        loadOrganizationsDetails(organizations);
      } else {
        console.log('Aucun changement dans les organisations, aucun rechargement nécessaire');
      }
    } else if (organizations.length === 0 && enrichedOrganizations.length > 0) {
      // Ne réinitialiser que si les organisations sont vides mais que les données enrichies ne le sont pas
      console.log('Aucune organisation disponible, réinitialisation des données enrichies');
      setEnrichedOrganizations([]);
      orgIdsRef.current = "";  // Réinitialiser la référence
    }
  }, [organizations, loadOrganizationsDetails]);
  
  // Mettre à jour l'état de chargement global
  useEffect(() => {
    // Ne montrer le chargement que lors du premier chargement ou d'un rafraîchissement explicite
    const initialLoading = 
      (orgsLoading && organizations.length === 0) || 
      (coursesLoading && currentTrainings.length === 0) ||
      (isPending && enrichedOrganizations.length === 0);
      
    // Ou si un rafraîchissement explicite est en cours
    const refreshLoading = 
      (orgsLoading && organizations.length > 0) || 
      (coursesLoading && currentTrainings.length > 0) ||
      (isPending && enrichedOrganizations.length > 0);
    
    // Définir l'état de chargement
    const isLoadingAny = initialLoading || refreshLoading;
    setIsLoading(isLoadingAny);
    
    // Mettre à jour l'horodatage de la dernière actualisation
    if (!isLoadingAny && (enrichedOrganizations.length > 0 || currentTrainings.length > 0)) {
      setLastRefresh(new Date());
    }
    
    // Mettre à jour l'erreur globale
    if (orgsError || coursesError) {
      setError(orgsError || coursesError);
    }
  }, [
    orgsLoading, isPending, coursesLoading, 
    organizations.length, currentTrainings.length, enrichedOrganizations.length,
    orgsError, coursesError
  ]);
  
  /**
   * Transforme les données enrichies pour être compatibles avec les composants existants
   */
  const formattedOrganizationsData = useMemo(() => {
    return enrichedOrganizations.map(org => {
      // Extracting tagged trainings based on user's tags
      let taggedTrainings = [];
      if (org.buildsByTag) {
        // Flatten all tagged trainings
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
      
      // Format organization trainings
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
      
      return {
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
      };
    });
  }, [enrichedOrganizations]);
  
  /**
   * Fonction pour rafraîchir toutes les données
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
      // Log pour identifier le moment du rafraîchissement
      console.log("Rafraîchissement des données démarré:", new Date().toISOString());
      
      // Ajout d'un délai de timeout pour éviter les blocages
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Délai de rafraîchissement dépassé")), 12000)
      );
      
      // Rafraîchir toutes les données en parallèle avec timeout de sécurité
      const [trainingsResult, orgsResult] = await Promise.race([
        Promise.all([
          refreshCourses().catch(e => {
            console.error("Erreur lors du rafraîchissement des cours:", e);
            return []; // Retourner un tableau vide en cas d'erreur
          }),
          loadOrganizations(true).catch(e => {
            console.error("Erreur lors du chargement des organisations:", e);
            return []; // Retourner un tableau vide en cas d'erreur
          })
        ]),
        timeoutPromise
      ]);
      
      console.log("Résultats obtenus:", 
        `${trainingsResult?.length || 0} formations, `,
        `${orgsResult?.length || 0} organisations`
      );
      
      // Si l'une des deux requêtes a échoué, ne pas bloquer l'ensemble du processus
      let anyError = false;
      
      // Charger les détails des organisations rafraîchies, mais seulement si nécessaire
      if (orgsResult && orgsResult.length > 0) {
        try {
          // Vérifier si les organisations ont réellement changé en utilisant la référence
          const newOrgIds = orgsResult.map(org => org.id).sort().join(',');
          
          if (orgIdsRef.current !== newOrgIds) {
            // Mettre à jour la référence avec les nouveaux IDs
            orgIdsRef.current = newOrgIds;
            console.log("Chargement des détails pour", orgsResult.length, "organisations");
            await Promise.race([
              loadOrganizationsDetails(orgsResult),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Délai d'enrichissement dépassé")), 8000))
            ]);
          } else {
            console.log("Organisations inchangées, détails non rechargés");
          }
        } catch (err) {
          console.error("Erreur lors de l'enrichissement des organisations:", err);
          anyError = true;
          // Ne pas bloquer l'ensemble du processus, mais ajouter un toast d'avertissement
          toast({
            title: "Attention",
            description: "Certaines informations détaillées n'ont pas pu être chargées.",
            variant: "warning",
          });
        }
      }
      
      // Timestamp pour le rafraîchissement
      const timestamp = new Date();
      setLastRefresh(timestamp);
      console.log("Rafraîchissement terminé:", timestamp.toISOString());
      
      // Retourner true sauf si une erreur s'est produite
      return !anyError;
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des données:", err);
      
      // Vérifier si l'erreur est due à un timeout
      const isTimeout = err.message.includes("Délai");
      
      setError(isTimeout 
        ? "Le chargement prend plus de temps que prévu. Veuillez réessayer."
        : err.message || "Erreur lors du rafraîchissement des données"
      );
      
      toast({
        title: isTimeout ? "Timeout" : "Erreur",
        description: isTimeout 
          ? "Le chargement des données a pris trop de temps. Veuillez réessayer."
          : "Un problème est survenu lors du chargement des données.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsPending(false);
    }
  }, [refreshCourses, loadOrganizations, loadOrganizationsDetails, toast, enrichedOrganizations, isPending]);
  
  // Vérifier si nous avons des formations à afficher
  // Utiliser un état local pour éviter de calculer cela à chaque rendu
  const [hasAnyTraining, setHasAnyTraining] = useState(false);
  
  // Utiliser un effet pour mettre à jour l'état uniquement lorsque les données changent
  useEffect(() => {
    const hasTrainings = 
      enrichedOrganizations.some(org => org.builds && org.builds.length > 0) ||
      currentTrainings.length > 0;
    
    setHasAnyTraining(hasTrainings);
  }, [enrichedOrganizations.length, currentTrainings.length]);
  
  return {
    // Données brutes
    organizations: enrichedOrganizations,
    
    // Données formatées pour les composants existants
    organizationsData: formattedOrganizationsData,
    
    // Formations de l'utilisateur
    trainings: currentTrainings,
    
    // État
    isLoading,
    error,
    hasOrganizations,
    hasAnyTraining,
    
    // Actions
    refreshData,
    
    // Métadonnées
    lastRefresh: lastRefresh || coursesLastRefresh
  };
}

export default useGuideData;