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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

const UnityBuild = forwardRef(
	({ courseId, containerName, onQuestionnaireRequest }, ref) => {
		const [loadingTimeout, setLoadingTimeout] = useState(false);

		// Définir les URLs pour les fichiers Unity
		const loaderUrl = `/api/azure/fetch-blob-data/${containerName}/${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${courseId}.loader.js`;
		const dataUrl = `/api/azure/fetch-blob-data/${containerName}/${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${courseId}.data.gz`;
		const frameworkUrl = `/api/azure/fetch-blob-data/${containerName}/${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${courseId}.framework.js.gz`;
		const codeUrl = `/api/azure/fetch-blob-data/${containerName}/${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${courseId}.wasm.gz`;

		const {
			unityProvider,
			loadingProgression,
			isLoaded,
			requestFullscreen,
			takeScreenshot,
			addEventListener,
			removeEventListener,
			sendMessage,
		} = useUnityContext({
			loaderUrl,
			dataUrl,
			frameworkUrl,
			codeUrl,
		});

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
			isReady: isLoaded,
		}));

		// Gestionnaire pour les événements Unity
		const handleGameObjectSelected = useCallback(
			(event) => {
				console.log("GameObject sélectionné:", event.detail);
				// Traiter l'interaction avec les objets du jeu

				try {
					// Analyser les données si nécessaire
					const data =
						typeof event.detail === "string"
							? JSON.parse(event.detail)
							: event.detail;

					// Vérifier si on a un scenarioId
					if (data.scenarioId) {
						console.log(`Scénario sélectionné: ${data.scenarioId}`);

						// Ici, on devrait normalement récupérer les données du scénario depuis l'API
						// Pour l'instant, on va simuler un scénario
						const mockScenario = {
							id: data.scenarioId,
							title: "Scénario de test",
							description: "Description du scénario de test",
						};

						if (onQuestionnaireRequest) {
							onQuestionnaireRequest(mockScenario);
						}
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

				// Ici, on devrait normalement récupérer les données du scénario depuis l'API
				// Pour l'instant, on va simuler un scénario
				const mockScenario = {
					id: event.detail,
					title: "Scénario de test",
					description: "Description du scénario de test",
				};

				if (onQuestionnaireRequest) {
					onQuestionnaireRequest(mockScenario);
				}
			},
			[onQuestionnaireRequest]
		);

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
				}
			};
		}, [
			isLoaded,
			addEventListener,
			removeEventListener,
			handleGameObjectSelected,
			handleQuestionnaireRequest,
		]);

		// Détection de timeout de chargement
		useEffect(() => {
			if (!isLoaded && !loadingTimeout) {
				const timer = setTimeout(() => {
					setLoadingTimeout(true);
				}, 60000); // 60 secondes timeout

				return () => clearTimeout(timer);
			}
		}, [isLoaded, loadingTimeout]);

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
										Chargement de l'environnement de
										formation...
									</div>
									<div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
										<div
											className="bg-wisetwin-blue h-2.5 rounded-full"
											style={{
												width: `${Math.round(
													loadingProgression * 100
												)}%`,
											}}
										></div>
									</div>
									<div className="mt-2 text-sm text-gray-500">
										{Math.round(loadingProgression * 100)}%
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

				<div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
					<div className="flex flex-wrap gap-2 w-full justify-center">
						<Button
							variant="outline"
							size="sm"
							onClick={() => requestFullscreen(true)}
							disabled={!isLoaded}
						>
							Plein écran
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								if (isLoaded) {
									const screenshot =
										takeScreenshot("image/png");
									if (screenshot) {
										const url =
											URL.createObjectURL(screenshot);
										window.open(url, "_blank");
									}
								}
							}}
							disabled={!isLoaded}
						>
							Capture d'écran
						</Button>
						{/* Bouton de test pour simuler une demande de questionnaire */}
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								if (onQuestionnaireRequest) {
									onQuestionnaireRequest({
										id: "scenario-test",
										title: "Scénario de test",
										description:
											"Description du scénario de test",
									});
								}
							}}
							disabled={!isLoaded}
						>
							Test Questionnaire
						</Button>
					</div>
				</div>
			</div>
		);
	}
);

UnityBuild.displayName = "UnityBuild";

export default UnityBuild;
