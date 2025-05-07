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
	({ courseId, containerName, onQuestionnaireRequest, onLoadingProgress }, ref) => {
		const [loadingTimeout, setLoadingTimeout] = useState(false);
		const [buildError, setBuildError] = useState(null);
		const [buildStatus, setBuildStatus] = useState("checking");
		const [manualLoadingProgress, setManualLoadingProgress] = useState(10);

		// Préfixe des blobs
		const blobPrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;

		// Construire les URLs pour Unity
		const baseUrl = `/api/blob/${containerName}`;
		const loaderUrl = `${baseUrl}/${blobPrefix}/${courseId}.loader.js`;
		const dataUrl = `${baseUrl}/${blobPrefix}/${courseId}.data`;
		const frameworkUrl = `${baseUrl}/${blobPrefix}/${courseId}.framework.js`;
		const wasmUrl = `${baseUrl}/${blobPrefix}/${courseId}.wasm`;

		// Initialiser le contexte Unity
		const {
			unityProvider,
			loadingProgression,
			isLoaded,
			error: unityError,
			addEventListener,
			removeEventListener,
			sendMessage,
		} = useUnityContext({
			loaderUrl: loaderUrl,
			dataUrl: dataUrl,
			frameworkUrl: frameworkUrl,
			codeUrl: wasmUrl,
			webGLContextAttributes: {
				preserveDrawingBuffer: true,
				powerPreference: "high-performance",
				failIfMajorPerformanceCaveat: false,
			},
			// Options avancées
			fetchTimeout: 60000, // 1 minute timeout
			disableWebAssemblyStreaming: true, // Important pour les fichiers compressés
			cacheControl: false, // Désactiver le cache
			maxRetries: 3, // Réessayer 3 fois max
		});

		// Simuler une progression initiale avant le chargement réel
		useEffect(() => {
			let interval;
			if (buildStatus === "checking") {
				setManualLoadingProgress(10);
				interval = setInterval(() => {
					setManualLoadingProgress(prev => {
						if (prev >= 40) {
							clearInterval(interval);
							return prev;
						}
						return prev + 1;
					});
				}, 100);
			}
			return () => clearInterval(interval);
		}, [buildStatus]);

		// Mettre à jour la progression du chargement réel
		useEffect(() => {
			if (buildStatus === "ready" && !isLoaded) {
				setManualLoadingProgress(40 + loadingProgression * 60);
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