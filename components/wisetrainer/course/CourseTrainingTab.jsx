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
import { Info, RotateCcw } from "lucide-react";
import UnityBuild from "@/components/wisetrainer/UnityBuild";

export default function CourseTrainingTab({
	unityBuildRef,
	courseId,
	containerName,
	onQuestionnaireRequest,
}) {
	const handleResetCamera = () => {
		if (unityBuildRef.current && unityBuildRef.current.isReady) {
			unityBuildRef.current.sendMessage("GameManager", "ResetCamera", "");
		}
	};

	return (
		<>
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Environnement de formation 3D</CardTitle>
					<CardDescription>
						Naviguez dans l'environnement virtuel pour apprendre et
						interagir avec les différents éléments
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex justify-end mb-4">
						<Button
							variant="outline"
							className="flex items-center gap-2"
							onClick={handleResetCamera}
						>
							<RotateCcw className="w-4 h-4" />
							Réinitialiser la caméra
						</Button>
					</div>
					<UnityBuild
						ref={unityBuildRef}
						courseId={courseId}
						containerName={containerName}
						onQuestionnaireRequest={onQuestionnaireRequest}
					/>
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
						Des questionnaires apparaîtront pour tester vos
						connaissances. Complétez tous les modules pour terminer
						la formation.
					</p>
				</div>
			</div>
		</>
	);
}
