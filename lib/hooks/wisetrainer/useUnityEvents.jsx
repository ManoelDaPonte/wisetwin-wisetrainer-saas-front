//hooks/wisetrainer/useUnityEvents.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useUnityEvents() {
	const [currentScenario, setCurrentScenario] = useState(null);
	const [showQuestionnaire, setShowQuestionnaire] = useState(false);

	// Gestionnaire pour les événements GameObject sélectionnés
	const handleGameObjectSelected = useCallback(async (event) => {
		console.log("🎮 GameObject selected:", event.detail);

		try {
			// Analyser les données si nécessaire
			const data =
				typeof event.detail === "string"
					? JSON.parse(event.detail)
					: event.detail;

			// Vérifier si on a un scenarioId
			if (data.scenarioId) {
				console.log(`🔍 Récupération du scénario: ${data.scenarioId}`);

				const response = await axios.get(
					`/api/db/wisetrainer/scenario/${data.scenarioId}`
				);

				if (response.data) {
					console.log("📋 Scénario récupéré:", response.data.title);
					setCurrentScenario(response.data);
					setShowQuestionnaire(true);
				}
			}
		} catch (error) {
			console.error(
				"❌ Erreur lors du traitement de l'événement:",
				error
			);
		}
	}, []);

	// Gestionnaire pour les demandes explicites de questionnaire
	const handleQuestionnaireRequest = useCallback(async (event) => {
		const scenarioId = event.detail;
		console.log("🔍 Questionnaire demandé pour le scénario:", scenarioId);

		try {
			const response = await axios.get(
				`/api/db/wisetrainer/scenario/${scenarioId}`
			);

			if (response.data) {
				console.log(
					"📋 Scénario récupéré pour questionnaire:",
					response.data.title
				);
				setCurrentScenario(response.data);
				setShowQuestionnaire(true);
			}
		} catch (error) {
			console.error(
				"❌ Erreur lors de la récupération du scénario:",
				error
			);
		}
	}, []);

	// Ajouter/supprimer les écouteurs d'événements
	useEffect(() => {
		window.addEventListener("GameObjectSelected", handleGameObjectSelected);
		window.addEventListener(
			"QuestionnaireRequest",
			handleQuestionnaireRequest
		);

		return () => {
			window.removeEventListener(
				"GameObjectSelected",
				handleGameObjectSelected
			);
			window.removeEventListener(
				"QuestionnaireRequest",
				handleQuestionnaireRequest
			);
		};
	}, [handleGameObjectSelected, handleQuestionnaireRequest]);

	return {
		currentScenario,
		showQuestionnaire,
		setShowQuestionnaire,
		setCurrentScenario,
	};
}
