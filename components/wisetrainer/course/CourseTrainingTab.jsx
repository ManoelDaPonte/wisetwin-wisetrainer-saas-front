//components/wisetrainer/course/CourseTrainingTab-new.jsx
import React, { forwardRef } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, RotateCcw } from "lucide-react";
import UnityBuild from "@/components/wisetrainer/UnityBuild";
import Spinner from "@/components/common/Spinner";

const CourseTrainingTab = forwardRef(({
	course,
	selectedModule,
	containerName,
	filesDownloaded,
	isDownloading,
	downloadTrainingFiles,
	updateProgress,
	activeContext,
	organization
}, ref) => {
	const handleResetCamera = () => {
		console.log("Tentative de réinitialisation de la caméra...");
		if (ref?.current && ref.current.isReady) {
			ref.current.resetCamera();
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
					<div className="flex justify-end mb-4">
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
								<Button onClick={downloadTrainingFiles}>
									Télécharger les fichiers
								</Button>
							</div>
						</div>
					) : (
						<UnityBuild
							ref={ref}
							courseId={course.id}
							containerName={containerName}
							activeContext={activeContext}
							organization={organization}
							onLoadingProgress={updateProgress}
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
});

CourseTrainingTab.displayName = 'CourseTrainingTab';

function TrainingInstructions() {
	return (
		<>
			<ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
				<li>Utilisez les touches ZQSD ou WASD pour vous déplacer</li>
				<li>Maintenez Shift pour courir</li>
				<li>Utilisez la souris pour regarder autour de vous</li>
				<li>Appuyez sur E pour interagir avec les objets</li>
				<li>Appuyez sur Échap pour afficher le menu</li>
			</ul>
			<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
				<div className="flex items-start gap-2">
					<Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
					<div className="text-sm text-blue-700 dark:text-blue-300">
						<p className="font-medium mb-1">Conseils :</p>
						<ul className="list-disc pl-5 space-y-1">
							<li>Explorez l'environnement pour découvrir tous les éléments interactifs</li>
							<li>Complétez les questionnaires pour valider vos acquis</li>
							<li>Si vous êtes bloqué, utilisez le bouton de réinitialisation de la caméra</li>
						</ul>
					</div>
				</div>
			</div>
		</>
	);
}

export default CourseTrainingTab;