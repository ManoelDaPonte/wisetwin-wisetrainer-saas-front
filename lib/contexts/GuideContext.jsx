"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0";
import { useToast } from "@/lib/hooks/useToast";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { useCurrentTraining } from "@/lib/hooks/useCurrentTraining";

/**
 * Contexte pour la gestion des données de la page Guide
 * Centralise les données, l'état et les méthodes de rafraîchissement
 */
const GuideContext = createContext({
  // Données des organisations
  organizationsData: [],
  hasOrganizations: false,
  
  // Formations
  currentTrainings: [],
  
  // États
  isLoading: true,
  error: null,
  lastRefresh: null,
  
  // Actions
  refreshData: () => {},
});

/**
 * Fournisseur du contexte Guide
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants
 */
export function GuideProvider({ children }) {
  const { toast } = useToast();
  const { user, isLoading: userLoading } = useUser();
  const { containerName, isLoading: containerLoading } = useAzureContainer();
  const { currentTrainings, isLoading: currentTrainingsLoading, refreshTrainings: refreshCurrentTrainings } = useCurrentTraining();

  // État local
  const [organizationsData, setOrganizationsData] = useState([]);
  const [hasOrganizations, setHasOrganizations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  /**
   * Charge les données des organisations de l'utilisateur
   * @returns {Promise<void>}
   */
  const loadOrganizationsData = useCallback(async () => {
    if (!user || !containerName) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // 1. Récupérer les organisations de l'utilisateur
      const orgsResponse = await axios.get("/api/organization");
      const userOrgs = orgsResponse.data.organizations || [];
      setHasOrganizations(userOrgs.length > 0);

      // 2. Récupérer les données pour chaque organisation
      const orgData = await Promise.all(
        userOrgs.map(async (org) => {
          try {
            // Récupérer les tags de l'utilisateur pour cette organisation
            const membersResponse = await axios.get(
              `/api/organization/${org.id}/members-with-tags`
            );

            let userTags = [];
            let taggedTrainings = [];
            let allTaggedTrainings = [];
            let hasCompletedTaggedTrainings = false;

            if (
              membersResponse.data.members &&
              Array.isArray(membersResponse.data.members)
            ) {
              // Trouver l'utilisateur actuel
              const userEmail = user.email || user.name;
              const currentUser = membersResponse.data.members.find(
                (m) =>
                  (m.email &&
                    m.email.toLowerCase() === userEmail.toLowerCase()) ||
                  (m.name &&
                    m.name.toLowerCase() === userEmail.toLowerCase())
              );

              if (
                currentUser &&
                currentUser.tags &&
                currentUser.tags.length > 0
              ) {
                userTags = currentUser.tags.map((tag) => ({
                  ...tag,
                  organizationName: org.name,
                  organizationId: org.id,
                }));

                // Pour chaque tag, récupérer les formations associées
                for (const tag of userTags) {
                  try {
                    const trainingRes = await axios.get(
                      `/api/organization/${org.id}/tags/${tag.id}/training`
                    );

                    if (
                      trainingRes.data.trainings &&
                      Array.isArray(trainingRes.data.trainings)
                    ) {
                      // Toutes les formations taguées (complétées ou non)
                      const allTagged = trainingRes.data.trainings.map(
                        (training) => ({
                          ...training,
                          tagInfo: {
                            id: tag.id,
                            name: tag.name,
                            color: tag.color,
                          },
                          organizationId: org.id,
                          organizationName: org.name,
                        })
                      );

                      allTaggedTrainings = [
                        ...allTaggedTrainings,
                        ...allTagged,
                      ];

                      // Filtrer pour garder uniquement les formations non complétées (progress < 100)
                      const incompleteTrainings = allTagged.filter(
                        (training) =>
                          training.progress === undefined ||
                          training.progress < 100
                      );

                      taggedTrainings = [
                        ...taggedTrainings,
                        ...incompleteTrainings,
                      ];
                    }
                  } catch (error) {
                    console.error(
                      `Erreur lors de la récupération des formations pour le tag ${tag.id}:`,
                      error
                    );
                  }
                }

                // Si nous avons des formations taguées au total mais aucune incomplète,
                // cela signifie que toutes ont été complétées
                hasCompletedTaggedTrainings =
                  allTaggedTrainings.length > 0 &&
                  taggedTrainings.length === 0;
              }
            }

            // Récupérer toutes les formations de l'organisation
            const buildsRes = await axios.get(
              `/api/organization/${org.id}/builds`
            );

            let orgTrainings = [];

            if (
              buildsRes.data.builds &&
              Array.isArray(buildsRes.data.builds)
            ) {
              orgTrainings = buildsRes.data.builds.map(
                (training) => ({
                  ...training,
                  organizationId: org.id,
                  organizationName: org.name,
                  source: {
                    type: "organization",
                    name: org.name,
                    organizationId: org.id,
                  },
                })
              );
            }

            return {
              organization: org,
              userTags,
              taggedTrainings,
              orgTrainings,
              hasCompletedTaggedTrainings,
            };
          } catch (error) {
            console.error(
              `Erreur lors de la récupération des données pour l'organisation ${org.id}:`,
              error
            );
            return {
              organization: org,
              userTags: [],
              taggedTrainings: [],
              orgTrainings: [],
              hasCompletedTaggedTrainings: false,
            };
          }
        })
      );

      setOrganizationsData(orgData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Erreur lors du chargement des données utilisateur:", error);
      setError("Une erreur est survenue lors du chargement des données des organisations");
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, containerName, toast]);

  /**
   * Rafraîchit toutes les données (organisations, trainings)
   * @returns {Promise<void>}
   */
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Exécuter les rafraîchissements en parallèle
      await Promise.all([
        loadOrganizationsData(),
        refreshCurrentTrainings && refreshCurrentTrainings()
      ]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error);
      setError("Une erreur est survenue lors du rafraîchissement des données");
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du rafraîchissement des données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadOrganizationsData, refreshCurrentTrainings, toast]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (user && containerName && !containerLoading && !userLoading) {
      loadOrganizationsData();
    }
  }, [user, containerName, containerLoading, userLoading, loadOrganizationsData]);

  // État de chargement global
  const globalLoading = userLoading || containerLoading || isLoading || currentTrainingsLoading;

  // Valeur du contexte
  const value = {
    // Données
    organizationsData,
    hasOrganizations,
    currentTrainings,
    
    // États
    isLoading: globalLoading,
    error,
    lastRefresh,
    
    // Actions
    refreshData,
  };

  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}

/**
 * Hook pour accéder au contexte Guide
 * @returns {Object} Contexte Guide
 */
export function useGuide() {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error("useGuide doit être utilisé à l'intérieur d'un GuideProvider");
  }
  return context;
}