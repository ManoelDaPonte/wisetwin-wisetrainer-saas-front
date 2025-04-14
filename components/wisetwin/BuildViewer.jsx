//components/wisetwin/BuildViewer.jsx
"use client";

import React, {
	useState,
	useEffect,
	useCallback,
	forwardRef,
	useImperativeHandle,
} from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Button } from "@/components/ui/button";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

const BuildViewer = forwardRef(({ buildId, containerName }, ref) => {
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	const [buildError, setBuildError] = useState(null);
	const [buildStatus, setBuildStatus] = useState("checking");
	const [manualLoadingProgress, setManualLoadingProgress] = useState(10);

	// Construire les URLs pour les fichiers Unity avec le bon préfixe
	// Pour les builds d'organisation, utiliser le container spécifié sinon utiliser le container par défaut
	const sourceContainer =
		build?.sourceContainer || WISETWIN_CONFIG.CONTAINER_NAMES.SOURCE;
	const blobPrefix =
		build?.blobPrefix || WISETWIN_CONFIG.BLOB_PREFIXES.WISETWIN || "";

	// Essayer plusieurs formats possibles (compressés et non compressés)
	// Les extensions .br sont généralement supportées par les navigateurs modernes pour une meilleure compression
	let loaderUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.loader.js`;
	let dataUrl, frameworkUrl, codeUrl;

	// Essayer d'abord les formats compressés .br (Brotli)
	dataUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.data.br`;
	frameworkUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.framework.js.br`;
	codeUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.wasm.br`;

	// Fallback aux formats .gz si .br n'est pas disponible
	const useGzipFallback = true;
	if (useGzipFallback) {
		dataUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.data.gz`;
		frameworkUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.framework.js.gz`;
		codeUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.wasm.gz`;
	}

	// Fallback aux fichiers non compressés (pour les tests locaux ou les builds simples)
	const useUncompressedFallback = false;
	if (useUncompressedFallback) {
		dataUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.data`;
		frameworkUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.framework.js`;
		codeUrl = `/api/azure/fetch-blob-data/${sourceContainer}/${blobPrefix}${buildId}.wasm`;
	}

	console.log("URLs de chargement configurées:", {
		loaderUrl,
		dataUrl,
		frameworkUrl,
		codeUrl,
		sourceContainer,
		blobPrefix,
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

	// Exposer des méthodes au composant parent via ref
	useImperativeHandle(ref, () => ({
		resetCamera: () => {
			if (isLoaded) {
				console.log("Resetting camera position");
				sendMessage("CameraController", "ResetCamera", "");
			}
		},
		isReady: isLoaded,
	}));

	// Handlers pour les événements
	const handleObjectSelected = useCallback((event) => {
		console.log("Objet sélectionné:", event.detail);
	}, []);

	// Ajouter les écouteurs d'événements
	useEffect(() => {
		if (isLoaded) {
			addEventListener("ObjectSelected", handleObjectSelected);
		}

		return () => {
			if (isLoaded) {
				removeEventListener("ObjectSelected", handleObjectSelected);
			}
		};
	}, [isLoaded, addEventListener, removeEventListener, handleObjectSelected]);

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
									L'environnement 3D prend trop de temps à
									charger.
								</p>
								<Button
									onClick={() => window.location.reload()}
								>
									Réessayer
								</Button>
								<p className="mt-4 text-sm text-gray-500">
									Vous pouvez également retourner à la liste
									des environnements et réessayer
									ultérieurement.
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
											width: `${Math.round(
												manualLoadingProgress
											)}%`,
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
			</div>
		</div>
	);
});

BuildViewer.displayName = "BuildViewer";

export default BuildViewer;
