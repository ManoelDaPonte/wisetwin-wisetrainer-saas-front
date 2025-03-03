//components/wisetrainer/course/QuestionnaireTab.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import QuestionnaireDebug from "@/components/wisetrainer/QuestionnaireDebug";

export default function QuestionnaireTab({
	currentScenario,
	containerName,
	courseId,
	onComplete,
	setActiveTab,
}) {
	return (
		<>
			{currentScenario ? (
				<QuestionnaireDebug
					scenario={currentScenario}
					userId={containerName}
					courseId={courseId}
					onComplete={onComplete}
				/>
			) : (
				<div className="text-center py-12">
					<p className="text-lg mb-4">
						Aucun questionnaire sélectionné
					</p>
					<p className="text-gray-500 mb-6">
						Veuillez sélectionner un module depuis l'onglet "Détails
						du cours"
					</p>
					<Button onClick={() => setActiveTab("details")}>
						Voir les modules
					</Button>
				</div>
			)}
		</>
	);
}
