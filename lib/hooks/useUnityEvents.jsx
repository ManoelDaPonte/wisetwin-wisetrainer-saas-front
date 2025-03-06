//lib/hooks/useUnityEvents.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

// Mapping par défaut pour les objets courants
// const DEFAULT_MAPPING = {
// 	Worker_1: "pressure-risk",
// 	Worker_2: "smoking-worker",
// 	worker_3: "chemical-hazard",
// };

export function useUnityEvents(courseId = null) {
	const [currentScenario, setCurrentScenario] = useState(null);
	const [showQuestionnaire, setShowQuestionnaire] = useState(false);
	const [objectMapping, setObjectMapping] = useState({});

	// Log explicite pour le courseId reçu
	console.log("🔍 useUnityEvents hook appelé avec courseId:", courseId);

	// Effet pour charger dynamiquement la configuration du cours actuel
	useEffect(() => {
		if (!courseId) {
			console.warn(
				"⚠️ courseId est null ou vide, utilisation du mapping par défaut"
			);
			return;
		}

		console.log("🔄 Chargement du mapping pour le cours:", courseId);

		const fetchCourseConfig = async () => {
			try {
				// Essayer d'abord l'API
				const apiUrl = `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${courseId}`;
				console.log("🌐 Appel API:", apiUrl);

				const response = await axios.get(apiUrl);

				if (response.data && response.data.objectMapping) {
					console.log(
						"✅ Mapping trouvé via API:",
						response.data.objectMapping
					);
					setObjectMapping(response.data.objectMapping);
				} else {
					console.warn(
						"⚠️ Pas de mapping dans la réponse API, fallback au mapping par défaut"
					);
					setObjectMapping(DEFAULT_MAPPING);
				}
			} catch (error) {
				console.error(
					"❌ Erreur lors du chargement du mapping:",
					error
				);
				console.warn("⚠️ Utilisation du mapping par défaut");
				setObjectMapping(DEFAULT_MAPPING);
			}
		};

		fetchCourseConfig();
	}, [courseId]);

	// Gestionnaire pour les événements GameObject sélectionnés
	const handleGameObjectSelected = useCallback(
		async (event) => {
			console.log("🎮 GameObject sélectionné:", event.detail);
			console.log("🗺️ Mapping actuel:", objectMapping);

			try {
				// Analyser les données si nécessaire
				const data =
					typeof event.detail === "string"
						? JSON.parse(event.detail)
						: event.detail;

				// Vérifier si on a un nom d'objet
				if (data.name) {
					console.log(`👆 Objet sélectionné: ${data.name}`);

					// Normaliser le nom pour la recherche (insensible à la casse)
					const normalizedName = data.name.toLowerCase();

					// Rechercher d'abord dans le mapping exact
					let scenarioId = objectMapping[data.name];

					// Si non trouvé, chercher de manière insensible à la casse
					if (!scenarioId) {
						const keys = Object.keys(objectMapping);
						for (const key of keys) {
							if (key.toLowerCase() === normalizedName) {
								scenarioId = objectMapping[key];
								break;
							}
						}
					}

					// Si toujours pas trouvé, utiliser la convention directe
					if (!scenarioId) {
						if (
							normalizedName.includes("worker_1") ||
							normalizedName.includes("worker_2") ||
							normalizedName.includes("worker_3")
						) {
							const workerNum = normalizedName.charAt(
								normalizedName.length - 1
							);
							if (workerNum === "1") scenarioId = "pressure-risk";
							else if (workerNum === "2")
								scenarioId = "smoking-worker";
							else if (workerNum === "3")
								scenarioId = "chemical-hazard";

							console.log(
								`🔄 Mapping par convention pour ${data.name} -> ${scenarioId}`
							);
						}
					}

					if (scenarioId) {
						console.log(`✅ Scénario trouvé: ${scenarioId}`);

						// Récupérer les détails du scénario
						const response = await axios.get(
							`${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${scenarioId}`
						);

						if (response.data) {
							console.log(
								"✅ Détails du scénario récupérés:",
								response.data.title
							);
							setCurrentScenario(response.data);
							setShowQuestionnaire(true);
						}
					} else {
						console.warn(
							`❌ Aucun scénario trouvé pour l'objet ${data.name}`
						);
					}
				}
			} catch (error) {
				console.error(
					"❌ Erreur lors du traitement de l'événement:",
					error
				);
			}
		},
		[objectMapping]
	);

	// Gestionnaire pour les demandes explicites de questionnaire
	const handleQuestionnaireRequest = useCallback(async (event) => {
		const scenarioId = event.detail;
		console.log("📝 Questionnaire demandé pour le scénario:", scenarioId);

		try {
			const response = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${scenarioId}`
			);

			if (response.data) {
				console.log(
					"✅ Scénario récupéré pour questionnaire:",
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
		console.log(
			"🔄 Mise en place des écouteurs d'événements avec mapping:",
			objectMapping
		);

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
