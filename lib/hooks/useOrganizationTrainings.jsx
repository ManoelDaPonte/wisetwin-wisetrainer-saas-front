"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0";
import { useToast } from "@/lib/hooks/useToast";

/**
 * Hook personnalisé pour récupérer les formations associées aux organisations d'un utilisateur
 * @returns {Object} Données et fonctions pour gérer les formations des organisations
 */
export function useOrganizationTrainings() {
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  // État local
  const [organizationsData, setOrganizationsData] = useState([]);
  const [hasOrganizations, setHasOrganizations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  /**
   * Charge les données des organisations et leurs formations associées
   * @returns {Promise<void>}
   */
  const fetchOrganizationTrainings = useCallback(async () => {
    if (!user) return;
    
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
        description:
          "Une erreur est survenue lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Charger les données au montage du composant
  useEffect(() => {
    if (user && !userLoading) {
      fetchOrganizationTrainings();
    }
  }, [user, userLoading, fetchOrganizationTrainings]);

  /**
   * Vérifie si l'utilisateur a des formations dans ses organisations
   * @returns {boolean} Vrai s'il existe au moins une formation pour l'utilisateur
   */
  const hasAnyOrganizationTraining = useCallback(() => {
    return organizationsData.some(
      (org) => org.taggedTrainings.length > 0 || org.orgTrainings.length > 0
    );
  }, [organizationsData]);

  return {
    organizationsData,
    hasOrganizations,
    isLoading,
    error,
    lastRefresh,
    refreshTrainings: fetchOrganizationTrainings,
    hasAnyOrganizationTraining,
  };
}