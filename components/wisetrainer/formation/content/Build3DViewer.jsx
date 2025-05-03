// components/wisetrainer/formation/content/Build3DViewer.jsx
import React, { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";
import axios from "axios";

const Build3DViewer = ({ formationId, build3D, onModuleComplete }) => {
	const unityContainerRef = useRef(null);
	const unityInstanceRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeModule, setActiveModule] = useState(null);
	const { toast } = useToast();

	// Initialisation d'Unity
	useEffect(() => {
		if (!build3D || !unityContainerRef.current) return;

		// Fonction pour initialiser Unity
		const initializeUnity = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// Chargement du script loader Unity depuis Azure
				const loaderScript = document.createElement("script");
				loaderScript.src = build3D.azureUrl;
				loaderScript.async = true;

				loaderScript.onload = () => {
					// Configuration Unity
					if (window.createUnityInstance) {
						window
							.createUnityInstance(unityContainerRef.current, {
								dataUrl: `https://${build3D.containerName}.blob.core.windows.net/wisetwin/wisetrainer/${build3D.name}.data`,
								frameworkUrl: `https://${build3D.containerName}.blob.core.windows.net/wisetwin/wisetrainer/${build3D.name}.framework.js`,
								codeUrl: `https://${build3D.containerName}.blob.core.windows.net/wisetwin/wisetrainer/${build3D.name}.wasm`,
								streamingAssetsUrl: `https://${build3D.containerName}.blob.core.windows.net/wisetwin/wisetrainer/StreamingAssets`,
								companyName: "WiseTwin",
								productName: build3D.name,
								productVersion: build3D.version,
							})
							.then((instance) => {
								unityInstanceRef.current = instance;
								setIsLoading(false);

								// Enregistrer la fonction de callback pour les messages d'Unity
								window.handleUnityMessage = handleUnityMessage;
							})
							.catch((err) => {
								setError(
									"Erreur lors du chargement de l'environnement 3D"
								);
								setIsLoading(false);
								console.error("Erreur Unity:", err);
							});
					} else {
						setError("Bibliothèque Unity non disponible");
						setIsLoading(false);
					}
				};

				loaderScript.onerror = () => {
					setError("Impossible de charger l'environnement 3D");
					setIsLoading(false);
				};

				document.body.appendChild(loaderScript);

				return () => {
					if (unityInstanceRef.current) {
						unityInstanceRef.current.Quit();
					}
					document.body.removeChild(loaderScript);
					delete window.handleUnityMessage;
				};
			} catch (err) {
				setError(
					"Erreur lors de l'initialisation de l'environnement 3D"
				);
				setIsLoading(false);
				console.error("Erreur d'initialisation:", err);
			}
		};

		initializeUnity();
	}, [build3D]);

	// Gestion des messages depuis Unity
	const handleUnityMessage = async (message) => {
		try {
			const data = JSON.parse(message);

			if (data.type === "moduleCompleted" && data.moduleId) {
				// Appeler l'API pour marquer le module comme terminé
				const moduleToComplete = build3D.modules.find(
					(m) => m.moduleId === data.moduleId
				);

				if (moduleToComplete) {
					const response = await axios.post(
						`/api/formations/${formationId}/build3d/module/complete`,
						{
							moduleId: moduleToComplete.id,
							score: data.score || null,
						}
					);

					if (response.data.success) {
						toast({
							title: "Module terminé",
							description: "Votre progression a été enregistrée",
							variant: "success",
						});

						if (onModuleComplete) {
							onModuleComplete(moduleToComplete.id);
						}
					}
				}
			}
		} catch (error) {
			console.error("Erreur lors du traitement du message Unity:", error);
		}
	};

	// Sélection d'un module
	const handleModuleSelect = (moduleId) => {
		if (!unityInstanceRef.current) return;

		const moduleToActivate = build3D.modules.find((m) => m.id === moduleId);
		if (moduleToActivate) {
			setActiveModule(moduleToActivate);

			// Envoyer un message à Unity pour activer le module
			unityInstanceRef.current.SendMessage(
				"GameController",
				"ActivateModule",
				moduleToActivate.moduleId
			);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center mb-4">
						<Box className="h-5 w-5 text-wisetwin-blue mr-2" />
						<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
							{build3D?.name || "Environnement 3D"}
						</h2>
					</div>

					{/* Viewer Unity */}
					<div
						className="relative w-full"
						style={{ height: "600px" }}
					>
						{isLoading && (
							<div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
								<div className="flex flex-col items-center">
									<Loader2 className="h-10 w-10 text-wisetwin-blue animate-spin mb-4" />
									<p>Chargement de l'environnement 3D...</p>
								</div>
							</div>
						)}

						{error && (
							<div className="absolute inset-0 bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
								<div className="flex flex-col items-center text-center p-6">
									<p className="text-red-600 dark:text-red-400 mb-4">
										{error}
									</p>
									<Button
										onClick={() => window.location.reload()}
									>
										Réessayer
									</Button>
								</div>
							</div>
						)}

						<div
							ref={unityContainerRef}
							className="w-full h-full"
							style={{
								display: isLoading || error ? "none" : "block",
							}}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Liste des modules */}
			{build3D && build3D.modules && (
				<Card>
					<CardContent className="pt-6">
						<h3 className="text-lg font-semibold mb-4">
							Modules disponibles
						</h3>

						<div className="space-y-4">
							{build3D.modules.map((module) => (
								<div
									key={module.id}
									className={`border rounded-lg p-4 transition-all ${
										module.locked
											? "border-gray-200 dark:border-gray-700 opacity-70 cursor-not-allowed"
											: "border-gray-300 dark:border-gray-600 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue cursor-pointer"
									} ${
										activeModule?.id === module.id
											? "bg-wisetwin-blue/5 border-wisetwin-blue"
											: ""
									}`}
									onClick={() =>
										!module.locked &&
										handleModuleSelect(module.id)
									}
								>
									<div className="flex justify-between items-center">
										<div className="flex items-center">
											{module.isCompleted ? (
												<CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
											) : (
												<Box className="h-4 w-4 text-wisetwin-blue mr-2" />
											)}
											<h3 className="font-medium">
												{module.title}
											</h3>
										</div>

										<Button
											size="sm"
											variant={
												module.isCompleted
													? "outline"
													: "secondary"
											}
											disabled={module.locked}
											onClick={(e) => {
												e.stopPropagation();
												if (!module.locked)
													handleModuleSelect(
														module.id
													);
											}}
										>
											{module.isCompleted
												? "Revoir"
												: "Démarrer"}
										</Button>
									</div>

									{module.description && (
										<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
											{module.description}
										</p>
									)}
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default Build3DViewer;
