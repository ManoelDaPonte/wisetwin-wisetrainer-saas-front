//lib/hooks/useWiseTwinOrganization.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";
import { enrichBuildWithMetadata } from "@/lib/config/wisetwin/environments-utils";

export function useWiseTwinOrganization(organizationId, userId) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organizationBuilds, setOrganizationBuilds] = useState([]);
  const [containerName, setContainerName] = useState(null);

  useEffect(() => {
    if (!organizationId || !userId) {
      setIsLoading(false);
      return;
    }

    const fetchOrganizationBuilds = async () => {
      setIsLoading(true);
      try {
        console.log(
          `Récupération des environnements 3D pour l'organisation ${organizationId}`
        );
        const response = await axios.get(
          `/api/organization/${organizationId}/wisetwin-builds`
        );

        if (response.data) {
          console.log(
            `${
              response.data.builds?.length || 0
            } environnements 3D trouvés dans l'organisation`
          );

          // Récupérer l'organisation depuis l'API si nécessaire
          let organizationName = "Organisation";
          let organizationObj = null;
          try {
            const orgResponse = await axios.get(
              `/api/organization/${organizationId}`
            );
            if (orgResponse.data && orgResponse.data.organization) {
              organizationName = orgResponse.data.organization.name;
              organizationObj = orgResponse.data.organization;
            }
          } catch (orgError) {
            console.warn(
              "Impossible de récupérer les détails de l'organisation",
              orgError
            );
          }

          // Traiter les builds
          if (response.data.builds && response.data.builds.length > 0) {
            // Enrichir les builds avec les métadonnées locales
            const enrichedBuilds = response.data.builds.map((build) => {
              // Utiliser les métadonnées locales au lieu d'appeler l'API
              const enrichedBuild = enrichBuildWithMetadata({
                ...build,
                organizationId,
                containerName: response.data.containerName,
                source: {
                  type: "organization",
                  organizationId,
                  name: organizationName,
                },
              });

              console.log(`Build enrichi ${build.id}:`, enrichedBuild);
              return enrichedBuild;
            });

            setOrganizationBuilds(enrichedBuilds);
          } else {
            setOrganizationBuilds([]);
          }

          setContainerName(response.data.containerName);
        } else {
          console.log("Aucun environnement 3D trouvé dans l'organisation");
          setOrganizationBuilds([]);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des environnements 3D de l'organisation:",
          error
        );
        setError(error);
        setOrganizationBuilds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationBuilds();
  }, [organizationId, userId]);

  return {
    organizationBuilds,
    containerName,
    isLoading,
    error,
  };
}

export default useWiseTwinOrganization;
