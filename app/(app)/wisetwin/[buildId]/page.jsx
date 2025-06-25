//app/(app)/wisetwin/[buildId]/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { useToast } from "@/lib/hooks/useToast";
import BuildViewer from "@/components/wisetwin/BuildViewer";
import ObjectCarousel from "@/components/wisetwin/ObjectCarousel";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";
import objectsConfig from "@/lib/config/wisetwin/objects-config.json";

export default function BuildViewerPage({ params: paramsPromise }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { containerName, isLoading: containerLoading } = useAzureContainer();
  const [buildId, setBuildId] = useState(null);
  const [build, setBuild] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);
  const { toast } = useToast();

  // États pour la modal du carousel
  const [selectedObject, setSelectedObject] = useState(null);
  const [showCarousel, setShowCarousel] = useState(false);

  // Extraire buildId des paramètres de façon asynchrone
  useEffect(() => {
    const getParams = async () => {
      try {
        if (paramsPromise) {
          // Si c'est une Promise, attendre sa résolution
          if (typeof paramsPromise.then === "function") {
            const resolvedParams = await paramsPromise;
            if (resolvedParams && resolvedParams.buildId) {
              setBuildId(resolvedParams.buildId);
            }
          }
          // Si c'est déjà un objet (compatibilité avec les versions antérieures)
          else if (paramsPromise.buildId) {
            setBuildId(paramsPromise.buildId);
          }
        }
        // Alternative: récupérer depuis l'URL si params ne fonctionne pas
        else if (window && window.location && window.location.pathname) {
          const pathParts = window.location.pathname.split("/");
          if (pathParts.length > 2) {
            const idFromPath = pathParts[pathParts.length - 1];
            setBuildId(idFromPath);
          }
        }
      } catch (e) {
        console.error("Erreur lors de la récupération des paramètres:", e);
        setError("Impossible de récupérer l'identifiant de l'environnement 3D");
      }
    };

    getParams();
  }, [paramsPromise]);

  // Charger les détails du build
  useEffect(() => {
    if (buildId && containerName && !containerLoading) {
      fetchBuildDetails();
    }
  }, [buildId, containerName, containerLoading]);

  const fetchBuildDetails = async () => {
    setIsLoading(true);

    try {
      // Pas besoin de vérifier la présence des fichiers, on les charge directement depuis le container source

      // Utiliser les métadonnées locales au lieu de l'API
      let buildDetails;
      try {
        // Utiliser les métadonnées locales
        const { enrichBuildWithMetadata, getEnvironmentMetadata } =
          await import("@/lib/config/wisetwin/environments-utils");

        // Créer un build de base
        const baseBuild = {
          id: buildId,
          name: buildId
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
        };

        // Enrichir avec les métadonnées
        buildDetails = enrichBuildWithMetadata(baseBuild);

        console.log(
          `Métadonnées locales utilisées pour ${buildId}:`,
          buildDetails
        );
      } catch (error) {
        console.warn(
          `Erreur lors de l'utilisation des métadonnées pour ${buildId}:`,
          error
        );
        // Créer des détails par défaut si les métadonnées échouent
        const formattedName = buildId
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        buildDetails = {
          id: buildId,
          name: formattedName,
          description: `Environnement interactif 3D de ${formattedName.toLowerCase()}. Explorez cet espace industriel en détail pour vous familiariser avec les équipements et les installations.`,
          category: "Environnement industriel",
          imageUrl: WISETWIN_CONFIG.DEFAULT_IMAGE,
          features: [
            "Visite virtuelle interactive",
            "Navigation intuitive",
            "Familiarisation avec les équipements",
          ],
        };
      }

      // Mettre à jour les métadonnées sur le container source
      if (buildDetails) {
        // Si nous avons reçu des paramètres de source dans l'URL
        const searchParams = new URL(window.location.href).searchParams;
        const sourceContainer = searchParams.get("sourceContainer");
        const organizationId = searchParams.get("organizationId");
        const organizationName = searchParams.get("organizationName");

        // Enrichir les détails du build avec ces informations
        if (sourceContainer) {
          buildDetails.sourceContainer = sourceContainer;
        }

        if (organizationId && organizationName) {
          buildDetails.source = {
            type: "organization",
            organizationId,
            name: organizationName,
          };
        }
      }

      setBuild(buildDetails);
    } catch (error) {
      console.error("Erreur lors du chargement de l'environnement:", error);
      setError("Impossible de charger cet environnement 3D");
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors du chargement de l'environnement 3D.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/wisetwin");
  };

  // Gérer la sélection d'objets depuis le BuildViewer
  const handleObjectSelected = (objectName) => {
    console.log("🎯 Page: objet sélectionné:", objectName);
    console.log(
      "🎯 Configuration disponible:",
      Object.keys(objectsConfig.objects)
    );

    if (objectName && objectsConfig.objects[objectName]) {
      console.log("✅ Configuration trouvée pour l'objet:", objectName);
      const objectConfig = objectsConfig.objects[objectName];
      console.log("✅ Config complète:", objectConfig);

      setSelectedObject({
        name: objectName,
        ...objectConfig,
      });
      setShowCarousel(true);
      console.log("✅ Modal du carousel ouverte");
    } else {
      console.warn("❌ Aucune configuration trouvée pour l'objet:", objectName);
      console.warn(
        "❌ Objets disponibles dans la config:",
        Object.keys(objectsConfig.objects)
      );
    }
  };

  // Fermer la modal du carousel
  const handleCarouselClose = (open) => {
    setShowCarousel(open);
    if (!open) {
      setSelectedObject(null);
    }
  };

  // Gérer les cas de chargement et d'erreur
  if (containerLoading || (isLoading && !build) || !buildId || !containerName) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          {!buildId || !containerName ? (
            // Erreur: informations essentielles manquantes
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">
                Informations manquantes
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Impossible de charger l'environnement 3D. Informations
                nécessaires manquantes.
              </p>
              <Button onClick={handleBack}>Retour aux environnements 3D</Button>
            </div>
          ) : (
            // Chargement en cours
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-wisetwin-blue border-t-transparent rounded-full mb-4 mx-auto"></div>
              <p>Chargement de l'environnement 3D...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Erreur</div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <Button onClick={handleBack}>Retour aux environnements 3D</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux environnements
        </Button>
      </div>

      {/* Viewer 3D */}
      <div className="rounded-lg overflow-hidden bg-gray-800">
        <BuildViewer
          ref={viewerRef}
          buildId={buildId}
          containerName={containerName}
          build={build}
          onObjectSelected={handleObjectSelected}
        />
      </div>

      {/* Modal globale du carousel */}
      {selectedObject && (
        <ObjectCarousel
          objectName={selectedObject.displayName || selectedObject.name}
          images={selectedObject.images || []}
          open={showCarousel}
          onOpenChange={handleCarouselClose}
        />
      )}
    </div>
  );
}
