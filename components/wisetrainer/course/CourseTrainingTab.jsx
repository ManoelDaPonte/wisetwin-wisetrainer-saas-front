//components/wisetrainer/course/CourseTrainingTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";
import UnityBuild from "@/components/wisetrainer/UnityBuild";

export default function CourseTrainingTab({
	unityBuildRef,
	courseId,
	containerName,
	onQuestionnaireRequest,
}) {
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
					Utilisez les touches <strong>W, A, S, D</strong> ou les{" "}
					<strong>flèches directionnelles</strong> pour vous déplacer
				</li>
				<li>
					Maintenez <strong>Shift</strong> pour courir
				</li>
				<li>
					Utilisez la <strong>souris</strong> pour regarder autour de
					vous
				</li>
				<li>
					Appuyez sur <strong>E</strong> ou{" "}
					<strong>clic gauche</strong> pour interagir avec les objets
				</li>
				<li>
					Appuyez sur <strong>F</strong> pour activer/désactiver la
					lampe torche si disponible
				</li>
				<li>
					Appuyez sur <strong>Esc</strong> pour accéder au menu
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
