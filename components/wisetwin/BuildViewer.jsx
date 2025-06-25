//components/wisetwin/BuildViewer.jsx
"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Button } from "@/components/ui/button";
import VisibilityControls from "@/components/wisetwin/VisibilityControls";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

const BuildViewer = forwardRef(
  ({ buildId, containerName, build, onObjectSelected }, ref) => {
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const [buildError, setBuildError] = useState(null);
    const [buildStatus, setBuildStatus] = useState("checking");
    const [manualLoadingProgress, setManualLoadingProgress] = useState(10);

    // États pour la gestion de la vidéo d'introduction
    const [showIntroVideo, setShowIntroVideo] = useState(false);
    const [introVideoTriggered, setIntroVideoTriggered] = useState(false);

    // État pour afficher/masquer les contrôles de visibilité
    const [showVisibilityControls, setShowVisibilityControls] = useState(false);

    // Utiliser les valeurs par défaut si build n'est pas défini
    // Construire les URLs pour les fichiers Unity avec le bon préfixe
    const sourceContainer =
      (build && build.sourceContainer) ||
      WISETWIN_CONFIG.CONTAINER_NAMES.SOURCE;

    // D'après les logs, il semble que les fichiers n'ont pas de préfixe
    // On va d'abord essayer sans préfixe
    const blobPrefix = "wisetwin/";

    // URL pour les fichiers Unity - essayer d'abord sans préfixe
    const loaderUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.loader.js`;
    const dataUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.data.gz`;
    const frameworkUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.framework.js.gz`;
    const codeUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.wasm.gz`;

    console.log("URLs de chargement configurées:", {
      loaderUrl,
      dataUrl,
      frameworkUrl,
      codeUrl,
      sourceContainer,
      blobPrefix: blobPrefix || "(aucun préfixe)",
    });

    // Créer le contexte Unity
    const {
      unityProvider,
      loadingProgression,
      isLoaded,
      sendMessage,
      addEventListener,
      removeEventListener,
      error: unityError,
    } = useUnityContext({
      loaderUrl,
      dataUrl,
      frameworkUrl,
      codeUrl,
      webGLContextAttributes: {
        preserveDrawingBuffer: true,
      },
    });

    // Déclencher la vidéo d'introduction SEULEMENT quand Unity est chargé et stable
    useEffect(() => {
      if (isLoaded && !introVideoTriggered) {
        console.log("Unity chargé, lancement de la vidéo d'introduction");
        // Petit délai pour s'assurer que Unity est vraiment stable
        const timer = setTimeout(() => {
          setShowIntroVideo(true);
          setIntroVideoTriggered(true);
        }, 1000);

        return () => clearTimeout(timer);
      }
    }, [isLoaded, introVideoTriggered]);

    // Mettre à jour la progression du chargement
    useEffect(() => {
      if (buildStatus === "ready" && !isLoaded) {
        setManualLoadingProgress(70 + loadingProgression * 30);
      }
    }, [loadingProgression, buildStatus, isLoaded]);

    // Gérer les erreurs Unity
    useEffect(() => {
      if (unityError) {
        console.error("Erreur Unity:", unityError);
        setBuildError(
          `Erreur lors du chargement de l'environnement 3D: ${
            unityError.message || "Erreur inconnue"
          }`
        );
        setBuildStatus("error");
      }
    }, [unityError]);

    // Fonction pour fermer la vidéo d'introduction
    const closeIntroVideo = () => {
      setShowIntroVideo(false);
    };

    // Fonction pour gérer la fin de la vidéo
    const handleVideoEnd = () => {
      console.log(
        "Fin de la vidéo d'introduction, lancement de StartCameraTransition"
      );

      // Appeler Unity pour démarrer la transition de caméra
      if (isLoaded) {
        try {
          sendMessage("CameraManager", "StartCameraTransition");
          console.log(
            "Message SendMessage envoyé à Unity: CameraManager.StartCameraTransition"
          );
        } catch (error) {
          console.error("Erreur lors de l'envoi du message à Unity:", error);
        }
      } else {
        console.warn(
          "Unity n'est pas encore chargé, impossible d'envoyer le message"
        );
      }

      closeIntroVideo();
    };

    // Fonction pour gérer la sélection d'objets Unity
    const handleObjectSelected = useCallback(
      (event) => {
        console.log("🎯 handleObjectSelected appelé avec:", event);
        console.log("🎯 event.detail:", event.detail);
        console.log("🎯 Type de event.detail:", typeof event.detail);

        try {
          // Analyser les données reçues de Unity
          let data;
          let objectName;

          if (typeof event.detail === "string") {
            console.log("🎯 Parsing JSON string:", event.detail);
            data = JSON.parse(event.detail);
            objectName = data.name;
          } else if (
            typeof event.detail === "object" &&
            event.detail !== null
          ) {
            console.log("🎯 Object direct:", event.detail);
            data = event.detail;
            objectName = data.name;
          } else {
            console.log("🎯 Utilisation directe comme string:", event.detail);
            objectName = event.detail;
          }

          console.log("🎯 Nom d'objet extrait:", objectName);

          // Émettre l'événement vers le parent (la page)
          if (objectName && onObjectSelected) {
            console.log(
              "✅ Émission de l'événement vers le parent:",
              objectName
            );
            onObjectSelected(objectName);
          } else {
            console.warn(
              "❌ Aucun callback onObjectSelected ou nom d'objet manquant"
            );
          }
        } catch (error) {
          console.error(
            "❌ Erreur lors du traitement de l'événement d'objet sélectionné:",
            error
          );
        }
      },
      [onObjectSelected]
    );

    // Exposer des méthodes au composant parent via ref
    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        if (isLoaded) {
          console.log("Resetting camera position");
          sendMessage("CameraController", "ResetCamera", "");
        }
      },
      isReady: isLoaded,
      closeIntroVideo: closeIntroVideo,
      // Exposer sendMessage pour les contrôles de visibilité
      sendMessage: (objectName, methodName, parameter) => {
        if (isLoaded) {
          console.log(
            `🎮 SendMessage externe: ${objectName}.${methodName}("${parameter}")`
          );
          sendMessage(objectName, methodName, parameter);
          return true;
        } else {
          console.warn(
            "Unity n'est pas chargé, impossible d'envoyer le message"
          );
          return false;
        }
      },
    }));

    // Gérer les événements Unity quand Unity est chargé
    useEffect(() => {
      if (isLoaded) {
        console.log("🚀 Unity chargé, ajout des event listeners");

        // Méthode 1: Event listeners React Unity WebGL
        addEventListener("ObjectSelected", handleObjectSelected);
        addEventListener("GameObjectSelected", handleObjectSelected);

        // Test d'événement pour voir si ça fonctionne
        console.log(
          "🔧 Event listeners ajoutés pour ObjectSelected et GameObjectSelected"
        );
      }

      return () => {
        if (isLoaded) {
          console.log("🧹 Nettoyage des event listeners");
          removeEventListener("ObjectSelected", handleObjectSelected);
          removeEventListener("GameObjectSelected", handleObjectSelected);
        }
      };
    }, [isLoaded, addEventListener, removeEventListener, handleObjectSelected]);

    // Méthode 2: Event listener global sur window (fallback)
    useEffect(() => {
      const handleGlobalUnityEvent = (event) => {
        console.log("🌍 Événement global Unity reçu:", event);
        if (event.type === "GameObjectSelected" || event.detail) {
          handleObjectSelected(event);
        }
      };

      // Écouter les événements Unity dispatched globalement
      window.addEventListener("GameObjectSelected", handleGlobalUnityEvent);
      window.addEventListener("ObjectSelected", handleGlobalUnityEvent);

      // Test pour voir si Unity dispatch des événements custom
      const originalDispatch = window.dispatchReactUnityEvent;
      if (typeof originalDispatch === "function") {
        window.dispatchReactUnityEvent = function (eventName, ...args) {
          console.log(
            "🎮 dispatchReactUnityEvent intercepté:",
            eventName,
            args
          );
          if (
            eventName === "GameObjectSelected" ||
            eventName === "ObjectSelected"
          ) {
            handleObjectSelected({ detail: args[0] });
          }
          return originalDispatch.apply(this, arguments);
        };
      }

      return () => {
        window.removeEventListener(
          "GameObjectSelected",
          handleGlobalUnityEvent
        );
        window.removeEventListener("ObjectSelected", handleGlobalUnityEvent);

        // Restaurer la fonction originale
        if (originalDispatch) {
          window.dispatchReactUnityEvent = originalDispatch;
        }
      };
    }, [handleObjectSelected]);

    // Test manuel pour vérifier que le carousel fonctionne
    useEffect(() => {
      if (isLoaded) {
        // Test en différé pour voir si le carousel fonctionne
        const testTimer = setTimeout(() => {
          console.log("🧪 Test manuel du carousel dans 5 secondes...");
          console.log("🧪 Pour tester manuellement, exécutez dans la console:");
          console.log("🧪 window.testCarousel = () => { /* code ici */ }");

          // Exposer une fonction de test global
          window.testCarousel = () => {
            console.log("🧪 Test manuel du carousel lancé");
            if (onObjectSelected) {
              onObjectSelected("Aluminium Dunkerque");
            }
          };

          console.log("🧪 Fonction de test exposée: window.testCarousel()");
        }, 5000);

        return () => clearTimeout(testTimer);
      }
    }, [isLoaded, onObjectSelected]);

    // Détection de timeout de chargement
    useEffect(() => {
      if (!isLoaded && !loadingTimeout && buildStatus === "ready") {
        const timer = setTimeout(() => {
          setLoadingTimeout(true);
        }, 60000); // 60 secondes timeout

        return () => clearTimeout(timer);
      }
    }, [isLoaded, loadingTimeout, buildStatus]);

    // En cas d'erreur, afficher un message d'erreur
    if (buildStatus === "error" || buildError) {
      return (
        <div className="overflow-hidden">
          <div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-6">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">
                Erreur de chargement
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {buildError ||
                  "Une erreur s'est produite lors du chargement de l'environnement 3D."}
              </p>
              <Button onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-hidden">
        <div className="aspect-video w-full relative bg-gray-900 rounded-lg">
          {/* État de chargement */}
          {!isLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              {loadingTimeout ? (
                <div className="text-center p-4">
                  <p className="text-red-500 mb-4">
                    L'environnement 3D prend trop de temps à charger.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Réessayer
                  </Button>
                  <p className="mt-4 text-sm text-gray-500">
                    Vous pouvez également retourner à la liste des
                    environnements et réessayer ultérieurement.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    {buildStatus === "checking"
                      ? "Vérification des fichiers de l'environnement..."
                      : "Chargement de l'environnement 3D..."}
                  </div>
                  <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-wisetwin-blue h-2.5 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(manualLoadingProgress)}%`,
                      }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {Math.round(manualLoadingProgress)}%
                  </div>
                </>
              )}
            </div>
          )}

          {/* Conteneur Unity */}
          <Unity
            unityProvider={unityProvider}
            style={{ width: "100%", height: "100%" }}
            className={isLoaded ? "block" : "hidden"}
          />

          {/* Bouton toggle pour les contrôles de visibilité */}
          {isLoaded && (
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setShowVisibilityControls(!showVisibilityControls)
                }
                className="bg-white/90 hover:bg-white/95 text-gray-900 border-gray-300"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Visibilité
              </Button>
            </div>
          )}

          {/* Contrôles de visibilité */}
          {showVisibilityControls && isLoaded && (
            <div className="absolute top-16 right-4 w-80 max-h-[calc(100vh-200px)] overflow-hidden z-40">
              <VisibilityControls
                sendMessage={sendMessage}
                isUnityLoaded={isLoaded}
              />
            </div>
          )}

          {/* Overlay vidéo d'introduction */}
          {showIntroVideo && (
            <div className="absolute inset-0 bg-black flex items-center justify-center z-50 rounded-lg">
              <div className="relative w-full h-full">
                {/* Lecteur vidéo automatique sans contrôles */}
                <video
                  className="w-full h-full object-contain rounded-lg"
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnd}
                  onError={(e) => {
                    console.error("Erreur lors du chargement de la vidéo:", {
                      error: e.target.error,
                      errorCode: e.target.error?.code,
                      errorMessage: e.target.error?.message,
                      currentSrc: e.target.currentSrc,
                      networkState: e.target.networkState,
                      readyState: e.target.readyState,
                    });
                    closeIntroVideo();
                  }}
                  onLoadStart={() => {
                    console.log(
                      "Début du chargement de la vidéo d'introduction"
                    );
                  }}
                  onCanPlay={() => {
                    console.log("Vidéo d'introduction prête à être lue");
                  }}
                >
                  <source src="/video/ecosystemd-intro.mp4" type="video/mp4" />
                  <source
                    src="/video/ecosystemd-intro.mkv"
                    type="video/x-matroska"
                  />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

BuildViewer.displayName = "BuildViewer";

export default BuildViewer;
