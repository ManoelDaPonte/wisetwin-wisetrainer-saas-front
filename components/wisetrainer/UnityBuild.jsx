//components/wisetrainer/UnityBuild-new.jsx
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
	({ courseId, containerName, activeContext, organization, onLoadingProgress }, ref) => {
		const [loadingTimeout, setLoadingTimeout] = useState(false);
		const [buildError, setBuildError] = useState(null);
		const [buildStatus, setBuildStatus] = useState("checking");
		const [manualLoadingProgress, setManualLoadingProgress] = useState(10);

		// Déterminer le container source selon le contexte
		const sourceContainer = activeContext === 'personal' 
			? containerName 
			: (organization?.azureContainer || containerName);

		// Utiliser les nouvelles URLs qui pointent vers l'API Azure
		const baseUrl = `/api/azure/direct-download/${sourceContainer}/wisetrainer/${courseId}`;

		// Initialiser Unity avec les chemins vers l'API Azure
		const {
			unityProvider,
			loadingProgression,
			isLoaded,
			error: unityError,
			addEventListener,
			removeEventListener,
			sendMessage,
			requestFullscreen,
		} = useUnityContext({
			loaderUrl: `${baseUrl}.loader.js`,
			dataUrl: `${baseUrl}.data.gz`,
			frameworkUrl: `${baseUrl}.framework.js.gz`,
			codeUrl: `${baseUrl}.wasm.gz`,
			webGLContextAttributes: {
				preserveDrawingBuffer: true,
				powerPreference: "high-performance",
				failIfMajorPerformanceCaveat: false,
			},
			// Options avancées pour Unity WebGL
			fetchTimeout: 180000, // 3 minutes timeout
			disableWebAssemblyStreaming: true,
			cacheControl: false,
			maxRetries: 10, // Augmenter les tentatives
			companyName: "WiseTwin",
			productName: "WiseTrainer",
			productVersion: "1.0",

			// Fonction custom pour gérer les requêtes fetch faites par Unity
			onUnityFetch: async (url, options) => {
				console.log(`[DEBUG] Requête Unity vers: ${url}`);
				try {
					const response = await fetch(url, {
						...options,
						credentials: "same-origin",
						mode: "cors",
					});
					return response;
				} catch (error) {
					console.error(
						`[ERROR] Échec fetch Unity pour ${url}:`,
						error
					);
					throw error;
				}
			},
		});

		// Informer le composant parent que l'initialisation a commencé
		useEffect(() => {
			if (onLoadingProgress) {
				onLoadingProgress(10);
			}
			setBuildStatus("ready");
			console.log(`[Unity] Chargement depuis le container: ${sourceContainer}`);
			console.log(`[Unity] Contexte actif: ${activeContext}`);
		}, [onLoadingProgress, sourceContainer, activeContext]);

		// Simuler une progression initiale avant le chargement réel
		useEffect(() => {
			let interval;
			if (buildStatus === "checking") {
				setManualLoadingProgress(10);
				interval = setInterval(() => {
					setManualLoadingProgress((prev) => {
						const newValue = prev < 40 ? prev + 1 : prev;
						if (newValue >= 40) {
							clearInterval(interval);
						}
						// Notifier le parent de la progression si la fonction est fournie
						if (onLoadingProgress) {
							onLoadingProgress(newValue);
						}
						return newValue;
					});
				}, 100);
			}
			return () => clearInterval(interval);
		}, [buildStatus, onLoadingProgress]);

		// Mettre à jour la progression du chargement réel
		useEffect(() => {
			if (buildStatus === "ready" && !isLoaded) {
				const newProgress = 40 + loadingProgression * 60;
				setManualLoadingProgress(newProgress);

				// Notifier le parent de la progression si la fonction est fournie
				if (onLoadingProgress) {
					onLoadingProgress(newProgress);
				}

				// Débug des problèmes de chargement
				if (loadingProgression > 0 && loadingProgression < 1) {
					console.log(
						`Progression Unity: ${loadingProgression * 100}%`
					);
				}
			}
		}, [loadingProgression, buildStatus, isLoaded, onLoadingProgress]);

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
					console.log("Resetting camera position in Unity");
					sendMessage("Player", "ResetCamera", "");
				}
			},
			isReady: isLoaded,
		}));

		// Gérer les événements Unity pour les questionnaires
		useEffect(() => {
			const handleQuestionnaireEvent = (scenarioData) => {
				console.log("Questionnaire event received:", scenarioData);
				try {
					const scenario = JSON.parse(scenarioData);
					if (window.onUnityQuestionnaireRequest) {
						window.onUnityQuestionnaireRequest(scenario);
					}
				} catch (error) {
					console.error(
						"Erreur lors du parsing des données du questionnaire:",
						error
					);
				}
			};

			const handleGuideEvent = (guideData) => {
				console.log("Guide event received:", guideData);
				try {
					const guide = JSON.parse(guideData);
					if (window.onUnityGuideRequest) {
						window.onUnityGuideRequest(guide);
					}
				} catch (error) {
					console.error(
						"Erreur lors du parsing des données du guide:",
						error
					);
				}
			};

			const handleInformationEvent = (informationData) => {
				console.log("Information event received:", informationData);
				try {
					const information = JSON.parse(informationData);
					if (window.onUnityInformationRequest) {
						window.onUnityInformationRequest(information);
					}
				} catch (error) {
					console.error(
						"Erreur lors du parsing des données de l'information:",
						error
					);
				}
			};

			const handleSceneLoaded = () => {
				console.log("Unity scene loaded successfully");
				setManualLoadingProgress(100);
				if (onLoadingProgress) {
					onLoadingProgress(100);
				}
			};

			const handleUnityError = (errorMessage) => {
				console.error("Unity error:", errorMessage);
				setBuildError(`Erreur Unity: ${errorMessage}`);
			};

			addEventListener("OnQuestionnaireRequest", handleQuestionnaireEvent);
			addEventListener("OnGuideRequest", handleGuideEvent);
			addEventListener("OnInformationRequest", handleInformationEvent);
			addEventListener("OnSceneLoaded", handleSceneLoaded);
			addEventListener("OnUnityError", handleUnityError);

			return () => {
				removeEventListener(
					"OnQuestionnaireRequest",
					handleQuestionnaireEvent
				);
				removeEventListener("OnGuideRequest", handleGuideEvent);
				removeEventListener(
					"OnInformationRequest",
					handleInformationEvent
				);
				removeEventListener("OnSceneLoaded", handleSceneLoaded);
				removeEventListener("OnUnityError", handleUnityError);
			};
		}, [addEventListener, removeEventListener, onLoadingProgress]);

		// Timeout de chargement
		useEffect(() => {
			const timer = setTimeout(() => {
				if (!isLoaded && buildStatus === "ready") {
					setLoadingTimeout(true);
					setBuildError(
						"Le chargement prend plus de temps que prévu. Veuillez vérifier votre connexion."
					);
				}
			}, 180000); // 3 minutes

			return () => clearTimeout(timer);
		}, [isLoaded, buildStatus]);

		// Réessayer le chargement
		const handleRetry = () => {
			window.location.reload();
		};

		// Gestion du plein écran
		const handleFullscreen = useCallback(() => {
			if (requestFullscreen) {
				requestFullscreen(true);
			}
		}, [requestFullscreen]);

		// Afficher les erreurs
		if (buildError || buildStatus === "error") {
			return (
				<div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-6">
					<div className="text-center">
						<div className="text-red-500 text-xl mb-4">
							Erreur de chargement
						</div>
						<p className="text-gray-600 dark:text-gray-300 mb-4">
							{buildError ||
								"Une erreur est survenue lors du chargement de l'environnement 3D."}
						</p>
						<Button onClick={handleRetry}>Réessayer</Button>
					</div>
				</div>
			);
		}

		// Affichage principal
		return (
			<div className="relative">
				{/* Barre de progression pendant le chargement */}
				{!isLoaded && (
					<div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 p-4 rounded-t-lg">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
								Chargement de l'environnement 3D...
							</span>
							<span className="text-sm text-gray-500">
								{Math.round(manualLoadingProgress)}%
							</span>
						</div>
						<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
							<div
								className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
								style={{ width: `${manualLoadingProgress}%` }}
							/>
						</div>
						{loadingTimeout && (
							<p className="text-xs text-orange-500 mt-2">
								Le chargement est plus long que prévu...
							</p>
						)}
					</div>
				)}

				{/* Conteneur Unity avec overlay de chargement */}
				<div
					className={`aspect-video w-full relative rounded-lg overflow-hidden ${
						!isLoaded ? "opacity-50" : ""
					}`}
				>
					<Unity
						unityProvider={unityProvider}
						style={{
							width: "100%",
							height: "100%",
							visibility: isLoaded ? "visible" : "visible",
						}}
						tabIndex={1}
					/>

					{/* Overlay de chargement */}
					{!isLoaded && (
						<div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
							<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
								<p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
									Initialisation en cours...
								</p>
							</div>
						</div>
					)}
				</div>

				{/* Bouton plein écran (visible uniquement quand chargé) */}
				{isLoaded && (
					<Button
						variant="outline"
						size="sm"
						className="absolute bottom-4 right-4"
						onClick={handleFullscreen}
					>
						Plein écran
					</Button>
				)}
			</div>
		);
	}
);

UnityBuild.displayName = "UnityBuild";

export default UnityBuild;