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
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";
import axios from "axios";

const UnityBuild = forwardRef(
	({ courseId, containerName, onQuestionnaireRequest }, ref) => {
		const [loadingTimeout, setLoadingTimeout] = useState(false);
		const [buildError, setBuildError] = useState(null);
		const [buildStatus, setBuildStatus] = useState("checking");
		const [manualLoadingProgress, setManualLoadingProgress] = useState(10);

		// Construire les URLs pour les fichiers Unity avec le bon préfixe
		const blobPrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;
		const loaderUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.loader.js`;
		const dataUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.data.gz`;
		const frameworkUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.framework.js.gz`;
		const codeUrl = `/api/azure/fetch-blob-data/${containerName}/${blobPrefix}${courseId}.wasm.gz`;

		// Vérifier que tous les fichiers de build existent
		useEffect(() => {
			const checkBuildFiles = async () => {
				if (!containerName || !courseId) return;

				try {
					setBuildStatus("checking");
					setManualLoadingProgress(10);
					console.log("Vérification des fichiers de build...");

					// Liste des extensions à vérifier
					const extensions = [
						"loader.js",
						"data.gz",
						"framework.js.gz",
						"wasm.gz",
					];

					// Vérifier chaque fichier
					for (const ext of extensions) {
						const blobName = `${blobPrefix}${courseId}.${ext}`;
						console.log(`Vérification de ${blobName}...`);

						const response = await axios.get(
							`/api/azure/check-blob-exists`,
							{
								params: {
									container: containerName,
									blob: blobName,
								},
							}
						);

						if (!response.data.exists) {
							setBuildError(
								`Le fichier ${courseId}.${ext} est manquant. Veuillez contacter l'administrateur.`
							);
							setBuildStatus("error");
							return;
						}

						// Incrémenter la progression
						setManualLoadingProgress((prev) => prev + 15);
					}

					console.log("Tous les fichiers de build sont présents.");
					setBuildStatus("ready");
					setManualLoadingProgress(70);
				} catch (error) {
					console.error(
						"Erreur lors de la vérification des fichiers de build:",
						error
					);
					setBuildError(
						"Erreur lors de la vérification des fichiers de build. Veuillez réessayer plus tard."
					);
					setBuildStatus("error");
				}
			};

			checkBuildFiles();
		}, [containerName, courseId, blobPrefix]);

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
										questions: [
											{
												id: "q1",
												text: "Question test",
												type: "SINGLE",
												options: [
													{
														id: "o1",
														text: "Option 1",
													},
													{
														id: "o2",
														text: "Option 2",
													},
												],
											},
										],
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
