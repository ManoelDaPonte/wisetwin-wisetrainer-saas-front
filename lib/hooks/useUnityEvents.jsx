import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

// Importation statique du mapping
import wiseTrainer01Config from "@/lib/config/wisetrainer/courses/WiseTrainer_01.json";

export function useUnityEvents(courseId = null) {
	const [currentScenario, setCurrentScenario] = useState(null);
	const [showQuestionnaire, setShowQuestionnaire] = useState(false);

	// Utiliser directement le mapping du fichier importé
	const objectMapping = wiseTrainer01Config.objectMapping;

	// Gestionnaire pour les événements GameObject sélectionnés
	const handleGameObjectSelected = useCallback(
		async (event) => {
			console.log("GameObject selected:", event.detail);

			try {
				// Analyser les données si nécessaire
				const data =
					typeof event.detail === "string"
						? JSON.parse(event.detail)
						: event.detail;

				// Vérifier si on a un nom d'objet
				if (data.name) {
					console.log(`Objet sélectionné: ${data.name}`);

					// Logging du mapping pour debug
					console.log("Mapping d'objets disponible:", objectMapping);

					// Trouver le scénario correspondant à cet objet
					const scenarioId = objectMapping[data.name];

					if (scenarioId) {
						console.log(
							`Scénario trouvé pour ${data.name}: ${scenarioId}`
						);

						// Récupérer les détails du scénario
						const response = await axios.get(
							`${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${scenarioId}`
						);

						if (response.data) {
							console.log(
								"Scénario récupéré:",
								response.data.title
							);
							setCurrentScenario(response.data);
							setShowQuestionnaire(true);
						}
					} else {
						console.warn(
							`Aucun scénario associé à l'objet ${data.name}`
						);
					}
				}
			} catch (error) {
				console.error(
					"Erreur lors du traitement de l'événement:",
					error
				);
			}
		},
		[objectMapping]
	);

	// Gestionnaire pour les demandes explicites de questionnaire
	const handleQuestionnaireRequest = useCallback(async (event) => {
		const scenarioId = event.detail;
		console.log("Questionnaire demandé pour le scénario:", scenarioId);

		try {
			const response = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${scenarioId}`
			);

			if (response.data) {
				console.log(
					"Scénario récupéré pour questionnaire:",
					response.data.title
				);
				setCurrentScenario(response.data);
				setShowQuestionnaire(true);
			}
		} catch (error) {
			console.error("Erreur lors de la récupération du scénario:", error);
		}
	}, []);

	// Ajouter/supprimer les écouteurs d'événements
	useEffect(() => {
		const handleObjectNamesReceived = (e) =>
			console.log("ObjectNamesReceived:", e.detail);
		const handleGUIDDataReceived = (e) =>
			console.log("GUIDDataReceived:", e.detail);
		const handleSphereDataReceived = (e) =>
			console.log("SphereDataReceived:", e.detail);
		const handleDropdownDataReceived = (e) =>
			console.log("DropdownDataReceived:", e.detail);

		window.addEventListener("GameObjectSelected", handleGameObjectSelected);
		window.addEventListener(
			"QuestionnaireRequest",
			handleQuestionnaireRequest
		);
		window.addEventListener(
			"ObjectNamesReceived",
			handleObjectNamesReceived
		);
		window.addEventListener("GUIDDataReceived", handleGUIDDataReceived);
		window.addEventListener("SphereDataReceived", handleSphereDataReceived);
		window.addEventListener(
			"DropdownDataReceived",
			handleDropdownDataReceived
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
			window.removeEventListener(
				"ObjectNamesReceived",
				handleObjectNamesReceived
			);
			window.removeEventListener(
				"GUIDDataReceived",
				handleGUIDDataReceived
			);
			window.removeEventListener(
				"SphereDataReceived",
				handleSphereDataReceived
			);
			window.removeEventListener(
				"DropdownDataReceived",
				handleDropdownDataReceived
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
