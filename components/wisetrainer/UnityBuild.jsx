//components/wisetrainer/UnityBuild.jsx
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
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import axios from "axios";

const UnityBuild = forwardRef(
	({ courseId, containerName, onQuestionnaireRequest }, ref) => {
		const [loadingTimeout, setLoadingTimeout] = useState(false);
		const [buildError, setBuildError] = useState(null);
		const [buildStatus, setBuildStatus] = useState("checking");
		const [manualLoadingProgress, setManualLoadingProgress] = useState(10);

		// Préfixe des blobs
		const blobPrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;

		// ⚠️ IMPORTANT: Pour Unity WebGL, NE PAS utiliser l'extension .gz dans les URLs
		// même si les fichiers sont stockés avec .gz dans Azure
		// Unity s'attend à recevoir les URLs sans .gz mais avec Content-Encoding: gzip
		// Ajouter un timestamp pour éviter les problèmes de cache
		const timestamp = Date.now();
		const loaderUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.loader.js`;
		const dataUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.data.gz`;
		const frameworkUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.framework.js.gz`;
		const codeUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.wasm.gz`;

		// Log des URLs pour debug
		useEffect(() => {
			if (!containerName || !courseId) return;

			console.log(
				"URLs de chargement configurées (API fetch-blob-data):",
				{
					loaderUrl,
					dataUrl,
					frameworkUrl,
					codeUrl,
					containerName,
					blobPrefix,
				}
			);

			// Définir l'état ready directement
			setBuildStatus("ready");
			setManualLoadingProgress(50);
		}, [
			containerName,
			courseId,
			loaderUrl,
			dataUrl,
			frameworkUrl,
			codeUrl,
			blobPrefix,
		]);

		// Initialiser le contexte Unity avec les nouvelles URLs
		const {
			unityProvider,
			loadingProgression,
			isLoaded,
			requestFullscreen,
			takeScreenshot,
			addEventListener,
			removeEventListener,
			sendMessage,
			error: unityError,
		} = useUnityContext({
			loaderUrl: loaderUrl,
			dataUrl: dataUrl,
			frameworkUrl: frameworkUrl,
			codeUrl: codeUrl,
			webGLContextAttributes: {
				preserveDrawingBuffer: true,
				powerPreference: "high-performance",
				failIfMajorPerformanceCaveat: false,
			},
			// Options avancées pour améliorer la compatibilité
			fetchTimeout: 300000, // 5 minutes de timeout
			disableWebAssemblyStreaming: true, // Désactiver le streaming pour contourner les problèmes liés à gzip
			cacheControl: false, // Désactiver le cache
			maxRetries: 5, // Réessayer jusqu'à 5 fois en cas d'échec
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
			completeQuestionnaire: (scenarioId, success) => {
				if (isLoaded) {
					console.log(
						`Notifying Unity that questionnaire ${scenarioId} was completed with ${
							success ? "success" : "failure"
						}`
					);
					sendMessage(
						"GameManager",
						"OnQuestionnaireCompleted",
						JSON.stringify({ scenarioId, success })
					);
				}
			},
			resetCamera: () => {
				if (isLoaded) {
					console.log("Resetting camera position");
					sendMessage(
						"MANAGERS/GameObjectCameraManager",
						"ResetCamera",
						""
					);
				}
			},

			// Ajoutez cette nouvelle méthode
			sendMessage: (objectName, methodName, parameter) => {
				if (isLoaded) {
					console.log(
						`Sending message to Unity: ${objectName}.${methodName}("${parameter}")`
					);
					sendMessage(objectName, methodName, parameter);
					return true;
				} else {
					console.warn("Unity is not loaded, cannot send message");
					return false;
				}
			},
			startTutorial: () => {
				if (isLoaded) {
					console.log("Starting tutorial via UnityBuild");
					try {
						sendMessage(
							"MANAGERS/TutorialController",
							"StartTutorial",
							""
						);
						return true;
					} catch (error) {
						console.error(
							"Erreur lors du démarrage du tutoriel Unity:",
							error
						);
						return false;
					}
				}
				console.warn("Unity not loaded, can't start tutorial");
				return false;
			},
			sendValidationEvent: (buttonName) => {
				// Fonction pour envoyer un événement de validation manuellement
				if (isLoaded) {
					console.log(
						`Sending manual validation event for: ${buttonName}`
					);
					const event = new CustomEvent("GuideValidationEvent", {
						detail: { name: buttonName, buttonName: buttonName },
					});
					window.dispatchEvent(event);
					return true;
				}
				return false;
			},
			isReady: isLoaded,
		}));

		// Gestionnaire pour les événements Unity
		const handleGameObjectSelected = useCallback(
			(event) => {
				console.log("GameObject sélectionné:", event.detail);
				try {
					// Analyser les données si nécessaire
					const data =
						typeof event.detail === "string"
							? JSON.parse(event.detail)
							: event.detail;

					// Vérifier si on a un scenarioId
					if (data.scenarioId) {
						console.log(`Scénario sélectionné: ${data.scenarioId}`);

						// Récupérer le scénario depuis l'API
						axios
							.get(
								`${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${data.scenarioId}`
							)
							.then((response) => {
								if (onQuestionnaireRequest) {
									onQuestionnaireRequest(response.data);
								}
							})
							.catch((error) => {
								console.error(
									"Erreur lors de la récupération du scénario:",
									error
								);
								// Fallback à un scénario de test
								if (onQuestionnaireRequest) {
									onQuestionnaireRequest({
										id: data.scenarioId,
										title: "Scénario de test",
										description:
											"Description du scénario de test",
									});
								}
							});
					}
				} catch (error) {
					console.error(
						"Erreur lors du traitement de l'événement:",
						error
					);
				}
			},
			[onQuestionnaireRequest]
		);

		// Gestionnaire pour les demandes explicites de questionnaire
		const handleQuestionnaireRequest = useCallback(
			(event) => {
				console.log("Questionnaire demandé:", event.detail);
				const scenarioId = event.detail;

				// Récupérer le scénario depuis l'API
				axios
					.get(
						`${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${scenarioId}`
					)
					.then((response) => {
						if (onQuestionnaireRequest) {
							onQuestionnaireRequest(response.data);
						}
					})
					.catch((error) => {
						console.error(
							"Erreur lors de la récupération du scénario:",
							error
						);
						// Fallback à un scénario de test
						if (onQuestionnaireRequest) {
							onQuestionnaireRequest({
								id: scenarioId,
								title: "Scénario de test",
								description: "Description du scénario de test",
							});
						}
					});
			},
			[onQuestionnaireRequest]
		);

		const handleUnityButtonClick = useCallback((event) => {
			console.log("Bouton cliqué dans Unity:", event.detail);

			// Créer un événement de validation pour le guide
			const buttonName =
				typeof event.detail === "string"
					? event.detail
					: event.detail.name || event.detail.buttonName;

			if (buttonName) {
				const validationEvent = new CustomEvent(
					"GuideValidationEvent",
					{
						detail: {
							name: buttonName,
							buttonName: buttonName,
							eventName: buttonName,
						},
					}
				);

				// Dispatcher l'événement
				window.dispatchEvent(validationEvent);
				console.log(
					`Événement de validation dispatché pour: ${buttonName}`
				);
			}
		}, []);

		// Ajouter les écouteurs d'événements lorsque Unity est chargé
		useEffect(() => {
			if (isLoaded) {
				addEventListener(
					"GameObjectSelected",
					handleGameObjectSelected
				);
				addEventListener(
					"QuestionnaireRequest",
					handleQuestionnaireRequest
				);
				addEventListener("ButtonClicked", handleUnityButtonClick); // Ajout d'un nouvel écouteur
			}

			return () => {
				if (isLoaded) {
					removeEventListener(
						"GameObjectSelected",
						handleGameObjectSelected
					);
					removeEventListener(
						"QuestionnaireRequest",
						handleQuestionnaireRequest
					);
					removeEventListener(
						"ButtonClicked",
						handleUnityButtonClick
					); // Nettoyage
				}
			};
		}, [
			isLoaded,
			addEventListener,
			removeEventListener,
			handleGameObjectSelected,
			handleQuestionnaireRequest,
			handleUnityButtonClick,
		]);

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
										Le module de formation prend trop de
										temps à charger.
									</p>
									<Button
										onClick={() => window.location.reload()}
									>
										Réessayer
									</Button>
									<p className="mt-4 text-sm text-gray-500">
										Vous pouvez également retourner à la
										liste des cours et sélectionner ce cours
										à nouveau.
									</p>
								</div>
							) : (
								<>
									<div className="mb-4">
										{buildStatus === "checking"
											? "Vérification des fichiers de formation..."
											: "Chargement de l'environnement de formation..."}
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
	}
);

UnityBuild.displayName = "UnityBuild";

export default UnityBuild;
