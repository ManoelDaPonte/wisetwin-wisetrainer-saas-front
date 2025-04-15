//app/(app)/wisetwin/[buildId]/page.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw } from "lucide-react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import BuildViewer from "@/components/wisetwin/BuildViewer";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";
import { useToast } from "@/lib/hooks/useToast";

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
				else if (
					window &&
					window.location &&
					window.location.pathname
				) {
					const pathParts = window.location.pathname.split("/");
					if (pathParts.length > 2) {
						const idFromPath = pathParts[pathParts.length - 1];
						setBuildId(idFromPath);
					}
				}
			} catch (e) {
				console.error(
					"Erreur lors de la récupération des paramètres:",
					e
				);
				setError(
					"Impossible de récupérer l'identifiant de l'environnement 3D"
				);
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
		setError(null);
		try {
			// Pas besoin de vérifier la présence des fichiers, on les charge directement depuis le container source

			// Récupérer les détails du build (facultatif - pour l'affichage seulement)
			let buildDetails;
			try {
				const response = await axios.get(
					`${WISETWIN_CONFIG.API_ROUTES.BUILD_DETAILS}/${buildId}`
				);
				buildDetails = response.data;
			} catch (error) {
				console.warn(
					`Fichier de configuration pour ${buildId} non trouvé:`,
					error
				);
				// Créer des détails par défaut si le fichier n'existe pas
				const formattedName = buildId
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");

				buildDetails = {
					id: buildId,
					name: formattedName,
					description: `Environnement interactif 3D de ${formattedName.toLowerCase()}. Explorez cet espace industriel en détail pour vous familiariser avec les équipements et les installations.`,
					category: "Environnement industriel",
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
			console.error(
				"Erreur lors du chargement de l'environnement:",
				error
			);
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

	const handleResetCamera = () => {
		if (viewerRef.current && viewerRef.current.isReady) {
			viewerRef.current.resetCamera();
		} else {
			console.warn(
				"Le viewer n'est pas prêt ou la référence n'est pas disponible"
			);
		}
	};

	// Gérer les cas de chargement et d'erreur
	if (
		containerLoading ||
		(isLoading && !build) ||
		!buildId ||
		!containerName
	) {
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
								Impossible de charger l'environnement 3D.
								Informations nécessaires manquantes.
							</p>
							<Button onClick={handleBack}>
								Retour aux environnements 3D
							</Button>
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
						<p className="text-gray-600 dark:text-gray-300 mb-4">
							{error}
						</p>
						<Button onClick={handleBack}>
							Retour aux environnements 3D
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6 flex justify-between items-center">
				<Button variant="outline" onClick={handleBack} className="mb-4">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Retour aux environnements
				</Button>

				<Button
					variant="outline"
					className="flex items-center gap-2"
					onClick={handleResetCamera}
				>
					<RotateCcw className="w-4 h-4" />
					Réinitialiser la caméra
				</Button>
			</div>

			<div className="mb-6">
				<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
					{build.name}
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					{build.description}
				</p>
			</div>

			{/* Viewer 3D */}
			<div className="rounded-lg overflow-hidden mb-6 bg-gray-800">
				<BuildViewer
					ref={viewerRef}
					buildId={buildId}
					containerName={containerName}
					build={build} // Passer l'objet build complet pour avoir les informations sur le container source
				/>
			</div>

			{/* Caractéristiques de l'environnement */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{(build.features || []).map((feature, index) => (
					<div
						key={index}
						className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center"
					>
						<div className="w-2 h-2 rounded-full bg-wisetwin-blue mr-3"></div>
						<span>{feature}</span>
					</div>
				))}
			</div>
		</div>
	);
}
