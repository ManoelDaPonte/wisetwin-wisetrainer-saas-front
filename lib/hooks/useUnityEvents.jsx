import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export function useUnityEvents(courseId = null) {
	const [currentScenario, setCurrentScenario] = useState(null);
	const [currentGuide, setCurrentGuide] = useState(null);
	const [currentInformation, setCurrentInformation] = useState(null);
	const [showQuestionnaire, setShowQuestionnaire] = useState(false);
	const [showGuide, setShowGuide] = useState(false);
	const [showInformation, setShowInformation] = useState(false);
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
					setObjectMapping({});
				}
			} catch (error) {
				console.error(
					"❌ Erreur lors du chargement du mapping:",
					error
				);
				console.warn("⚠️ Utilisation du mapping par défaut");
				setObjectMapping({});
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

				// Si nous sommes dans un guide actif, déclencher un événement de validation
				if (showGuide && currentGuide && data.name) {
					console.log(
						`🔍 Vérification de validation de guide: ${data.name}`
					);

					// Créer un événement de validation pour le guide
					const validationEvent = new CustomEvent(
						"GuideValidationEvent",
						{
							detail: {
								name: data.name,
								buttonName: data.name,
								eventName: data.name,
							},
						}
					);

					// Dispatcher l'événement
					window.dispatchEvent(validationEvent);
					console.log(
						`🚀 Événement de validation dispatché pour: ${data.name}`
					);
					return; // Sortir de la fonction si nous sommes en mode guide
				}

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
						} else if (
							normalizedName.includes("controller") ||
							normalizedName === "cylinder"
						) {
							scenarioId = "controller-guide";
							console.log(
								`🔄 Mapping par convention pour contrôleur -> ${scenarioId}`
							);
						}
					}

					if (scenarioId) {
						console.log(`✅ Scénario trouvé: ${scenarioId}`);

						// Récupérer les détails du scénario
						const response = await axios.get(
							`${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO_BY_COURSE}/${courseId}/${scenarioId}`
						);

						if (response.data) {
							console.log(
								"✅ Détails du scénario récupérés:",
								response.data.title
							);

							// Vérifier le type de module
							if (response.data.type === "guide") {
								setCurrentGuide(response.data);
								setShowGuide(true);
							} else if (response.data.type === "information") {
								setCurrentInformation(response.data);
								setShowInformation(true);
							} else {
								setCurrentScenario(response.data);
								setShowQuestionnaire(true);
							}
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
		[objectMapping, showGuide, currentGuide]
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

				// Vérifier le type de module
				if (response.data.type === "guide") {
					setCurrentGuide(response.data);
					setShowGuide(true);
				} else if (response.data.type === "information") {
					setCurrentInformation(response.data);
					setShowInformation(true);
				} else {
					setCurrentScenario(response.data);
					setShowQuestionnaire(true);
				}
			}
		} catch (error) {
			console.error(
				"❌ Erreur lors de la récupération du scénario:",
				error
			);
		}
	}, []);

	// Gestionnaire pour les validations du guide
	const handleGuideValidation = useCallback((event) => {
		console.log("🎯 Guide validation event reçu:", event.detail);
	}, []);

	// Ajouter/supprimer les écouteurs d'événements
	useEffect(() => {
		console.log(
			"🔄 Mise en place des écouteurs d'événements avec mapping:",
			objectMapping
		);

		// Fonctions de gestion pour le débogage
		const handleObjectNamesReceived = (e) =>
			console.log("ObjectNamesReceived:", e.detail);
		const handleGUIDDataReceived = (e) =>
			console.log("GUIDDataReceived:", e.detail);
		const handleSphereDataReceived = (e) =>
			console.log("SphereDataReceived:", e.detail);
		const handleDropdownDataReceived = (e) =>
			console.log("DropdownDataReceived:", e.detail);

		// Événements principaux
		window.addEventListener("GameObjectSelected", handleGameObjectSelected);
		window.addEventListener(
			"QuestionnaireRequest",
			handleQuestionnaireRequest
		);
		window.addEventListener("GuideValidationEvent", handleGuideValidation);

		// Événements supplémentaires pour le débogage
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
			// Nettoyage des événements principaux
			window.removeEventListener(
				"GameObjectSelected",
				handleGameObjectSelected
			);
			window.removeEventListener(
				"QuestionnaireRequest",
				handleQuestionnaireRequest
			);
			window.removeEventListener(
				"GuideValidationEvent",
				handleGuideValidation
			);

			// Nettoyage des événements de débogage
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
	}, [
		handleGameObjectSelected,
		handleQuestionnaireRequest,
		handleGuideValidation,
	]);

	return {
		currentScenario,
		currentGuide,
		currentInformation,
		showQuestionnaire,
		showGuide,
		showInformation,
		setShowQuestionnaire,
		setShowGuide,
		setShowInformation,
		setCurrentScenario,
		setCurrentGuide,
		setCurrentInformation,
	};
}