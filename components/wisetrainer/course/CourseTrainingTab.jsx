//components/wisetrainer/course/CourseTrainingTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, RotateCcw, HelpCircle } from "lucide-react";
import UnityBuild from "@/components/wisetrainer/UnityBuild";
import Spinner from "@/components/common/Spinner";

export default function CourseTrainingTab({
	unityBuildRef,
	courseId,
	containerName,
	onQuestionnaireRequest,
	onInformationRequest,
	filesDownloaded,
	isDownloading,
	onUnityProgress,
	showAIInsideNotice,
	setShowAIInsideNotice
}) {
	const handleResetCamera = () => {
		console.log("Tentative de réinitialisation de la caméra...");
		if (unityBuildRef.current && unityBuildRef.current.isReady) {
			unityBuildRef.current.resetCamera();
		} else {
			console.warn(
				"Unity build n'est pas prêt ou la référence n'est pas disponible"
			);
		}
	};
	return (
		<>
			<Card className="mb-8">
				<CardContent>
					<div className="flex justify-end mb-4 gap-2">
						{courseId === "AI-Inside" && (
							<Button
								variant="outline"
								className="flex items-center gap-2"
								onClick={() => setShowAIInsideNotice(!showAIInsideNotice)}
								disabled={!filesDownloaded}
							>
								<HelpCircle className="w-4 h-4" />
								{showAIInsideNotice ? "Masquer" : "Afficher"} la notice
							</Button>
						)}
						<Button
							variant="outline"
							className="flex items-center gap-2"
							onClick={handleResetCamera}
							disabled={!filesDownloaded}
						>
							<RotateCcw className="w-4 h-4" />
							Réinitialiser la caméra
						</Button>
					</div>
					{isDownloading ? (
						<div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-6">
							<Spinner 
								text="Téléchargement des fichiers de formation..." 
								size="lg" 
								centered={true}
							/>
							<p className="text-sm text-gray-500 mt-8">Veuillez patienter. Cette opération peut prendre quelques minutes.</p>
						</div>
					) : !filesDownloaded ? (
						<div className="aspect-video w-full relative bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-6">
							<div className="text-center">
								<div className="text-red-500 text-xl mb-4">
									Téléchargement requis
								</div>
								<p className="text-gray-600 dark:text-gray-300 mb-4">
									Les fichiers de formation doivent être téléchargés avant de pouvoir accéder à l'environnement 3D.
								</p>
								<p className="text-sm text-gray-500">
									Veuillez réessayer ou contacter l'assistance si le problème persiste.
								</p>
							</div>
						</div>
					) : (
						<UnityBuild
							ref={unityBuildRef}
							courseId={courseId}
							containerName={containerName}
							onQuestionnaireRequest={onQuestionnaireRequest}
							onLoadingProgress={onUnityProgress}
						/>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Instructions</CardTitle>
				</CardHeader>
				<CardContent>
					<TrainingInstructions />
				</CardContent>
			</Card>
		</>
	);
}

function TrainingInstructions() {
	return (
		<>
			<ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
				<li>
					Maintenez le <strong>clic droit</strong> et déplacez la
					souris pour regarder autour de vous
				</li>
				<li>
					Utilisez le <strong>clic gauche</strong> sur un travailleur
					pour interagir et lancer un questionnaire
				</li>
				<li>
					Cliquez sur le <strong>contrôleur</strong> pour démarrer un
					guide interactif de la séquence d'utilisation
				</li>
				<li>
					Utilisez le bouton <strong>Réinitialiser la caméra</strong>{" "}
					pour revenir à la position de départ
				</li>
			</ul>

			<div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg mt-6 flex items-start">
				<Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
				<div>
					<p className="font-semibold mb-1">
						Objectifs de la formation :
					</p>
					<p className="text-sm">
						Explorez l'environnement et interagissez avec les objets
						pour découvrir les différents scénarios de formation.
						Des questionnaires et guides interactifs apparaîtront
						pour tester vos connaissances et vous guider. Complétez
						tous les modules pour terminer la formation.
					</p>
				</div>
			</div>
		</>
	);
}