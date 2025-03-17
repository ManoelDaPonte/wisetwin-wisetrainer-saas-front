//components/wisetrainer/InteractiveGuideModal.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	CheckCircle,
	AlertCircle,
	ArrowRight,
	Minimize2,
	Maximize2,
	HelpCircle,
} from "lucide-react";
import Image from "next/image";

export default function InteractiveGuideModal({
	guide,
	onComplete,
	onClose,
	onStartTutorial,
}) {
	const [currentStepIndex, setCurrentStepIndex] = useState(0);
	const [completedSteps, setCompletedSteps] = useState([]);
	const [showHint, setShowHint] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const [tutorialStarted, setTutorialStarted] = useState(false);

	const currentStep = guide.steps ? guide.steps[currentStepIndex] : null;
	const progress = guide.steps
		? Math.round((completedSteps.length / guide.steps.length) * 100)
		: 0;

	// Effet pour écouter les événements de validation provenant d'Unity
	useEffect(() => {
		const handleValidationEvent = (event) => {
			// Extraire le nom de l'événement et sa valeur
			let eventData;
			try {
				eventData =
					typeof event.detail === "string"
						? JSON.parse(event.detail)
						: event.detail;
			} catch (e) {
				eventData = event.detail;
			}

			console.log("Événement de validation reçu:", eventData);

			// Démarrer le tutoriel si l'événement le demande
			if (
				eventData.action === "startTutorial" ||
				eventData.eventName === "startTutorial"
			) {
				setTutorialStarted(true);
				return;
			}

			// Si le tutoriel n'est pas démarré, ignorer les événements
			if (!tutorialStarted) return;

			// Vérifier si l'événement correspond à l'étape actuelle
			const buttonName = eventData.name || eventData.buttonName;
			const stepValidation = currentStep?.validationEvent;

			// Vérifier si l'événement correspond à l'étape actuelle
			if (
				buttonName &&
				currentStep &&
				(buttonName === stepValidation ||
					eventData.eventName === stepValidation ||
					(Array.isArray(guide.sequenceButtons) &&
						guide.sequenceButtons[currentStepIndex] === buttonName))
			) {
				validateCurrentStep();
			}
		};

		// Ajouter l'écouteur d'événement pour les événements de validation
		window.addEventListener("GuideValidationEvent", handleValidationEvent);

		// Ajouter aussi l'écouteur pour les événements GameObjectSelected
		const handleGameObjectSelected = (event) => {
			let data;
			try {
				data =
					typeof event.detail === "string"
						? JSON.parse(event.detail)
						: event.detail;
			} catch (e) {
				data = event.detail;
			}

			console.log("GameObject sélectionné dans le guide:", data);

			// Si c'est le contrôleur, démarrer le tutoriel
			if (data.name && data.name.includes("Controller")) {
				console.log(
					"Démarrage du tutoriel depuis la sélection d'objet"
				);
				setTutorialStarted(true);

				// Appeler la fonction de rappel
				if (onStartTutorial) {
					onStartTutorial();
				}
				return;
			}

			// Si le tutoriel est démarré, vérifier si l'objet sélectionné correspond à l'étape actuelle
			if (tutorialStarted && currentStep && data.name) {
				// Cas 1: La validation se fait via le nom de l'objet directement
				if (data.name === currentStep.validationEvent) {
					validateCurrentStep();
				}
				// Cas 2: La validation se fait via le nom de l'objet correspondant à la séquence de boutons
				else if (
					Array.isArray(guide.sequenceButtons) &&
					guide.sequenceButtons[currentStepIndex] === data.name
				) {
					validateCurrentStep();
				}
			}
		};

		window.addEventListener("GameObjectSelected", handleGameObjectSelected);

		// Nettoyer l'écouteur à la destruction du composant
		return () => {
			window.removeEventListener(
				"GuideValidationEvent",
				handleValidationEvent
			);
			window.removeEventListener(
				"GameObjectSelected",
				handleGameObjectSelected
			);
		};
	}, [currentStep, tutorialStarted, currentStepIndex, guide.sequenceButtons]);

	// Fonction pour valider l'étape actuelle
	const validateCurrentStep = () => {
		if (!completedSteps.includes(currentStep.id)) {
			const newCompletedSteps = [...completedSteps, currentStep.id];
			setCompletedSteps(newCompletedSteps);

			// Si ce n'est pas la dernière étape, passer à la suivante
			if (currentStepIndex < guide.steps.length - 1) {
				setCurrentStepIndex(currentStepIndex + 1);
				setShowHint(false);
			} else {
				// C'est la dernière étape, le guide est terminé
				setTimeout(() => {
					onComplete({
						guideId: guide.id,
						success: true,
						completedSteps: newCompletedSteps,
					});
				}, 1000);
			}
		}
	};

	// Pour le développement, ajoutons une fonction qui permet de simuler la validation
	const simulateValidation = () => {
		if (!tutorialStarted) {
			// Simuler le démarrage du tutoriel
			setTutorialStarted(true);

			// Appeler la fonction de rappel fournie par le parent
			if (onStartTutorial) {
				console.log("Appel de onStartTutorial");
				onStartTutorial();
			} else {
				console.warn(
					"La fonction onStartTutorial n'est pas disponible"
				);
			}
		} else {
			// Simuler la validation de l'étape courante
			validateCurrentStep();
		}
	};

	const toggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};

	// Affichage minimisé
	if (isMinimized) {
		return (
			<div className="fixed z-40 bottom-4 right-4 w-64 h-16 bg-blue-600 dark:bg-blue-800 text-white p-4 rounded-lg shadow-xl flex items-center justify-between">
				<div className="flex-1 truncate">
					<h3 className="font-bold truncate">{guide.title}</h3>
				</div>
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleMinimize}
						className="text-white hover:bg-blue-500"
					>
						<Maximize2 size={18} />
					</Button>
				</div>
			</div>
		);
	}

	// Affichage du message initial si le tutoriel n'est pas démarré
	if (!tutorialStarted) {
		return (
			<div className="fixed z-40 top-16 right-0 bottom-4 w-2/5 max-w-xl bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700">
				{/* En-tête */}
				<div className="bg-blue-600 dark:bg-blue-800 text-white p-4 sticky top-0 z-10 flex items-center justify-between">
					<div>
						<h2 className="text-xl font-bold">{guide.title}</h2>
						<p className="text-sm opacity-90">
							{guide.description}
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleMinimize}
						className="text-white hover:bg-blue-500"
					>
						<Minimize2 size={18} />
					</Button>
				</div>

				{/* Contenu principal */}
				<div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center">
					<div className="text-center max-w-md">
						<h3 className="text-xl font-bold mb-4">
							Tutoriel interactif
						</h3>
						<p className="mb-6">
							Cliquez sur le contrôleur dans l'environnement 3D
							pour démarrer la séquence d'apprentissage guidée.
						</p>
						{/* Bouton optionnel pour démarrer le tutoriel directement */}
						<Button
							className="bg-blue-600 hover:bg-blue-700 text-white"
							onClick={simulateValidation}
						>
							Démarrer le tutoriel
						</Button>
					</div>
				</div>

				{/* Pied de page */}
				<div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between bg-white dark:bg-gray-800 sticky bottom-0">
					<Button variant="outline" onClick={onClose}>
						Fermer
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="fixed z-40 top-16 right-0 bottom-4 w-2/5 max-w-xl bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700">
			{/* En-tête */}
			<div className="bg-blue-600 dark:bg-blue-800 text-white p-4 sticky top-0 z-10 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold">{guide.title}</h2>
					<p className="text-sm opacity-90">{guide.description}</p>
				</div>
				<Button
					variant="ghost"
					size="sm"
					onClick={toggleMinimize}
					className="text-white hover:bg-blue-500"
				>
					<Minimize2 size={18} />
				</Button>
			</div>

			{/* Barre de progression */}
			<div className="px-4 py-2 bg-gray-50 dark:bg-gray-700">
				<div className="flex justify-between items-center text-sm mb-1">
					<span>Progression</span>
					<span>{progress}%</span>
				</div>
				<Progress value={progress} className="h-2" />
			</div>

			{/* Contenu principal */}
			<div className="p-6 flex-1 overflow-y-auto">
				<div className="mb-4">
					<div className="flex justify-between items-center mb-2">
						<h3 className="text-lg font-semibold text-gray-800 dark:text-white">
							{currentStep?.title ||
								`Étape ${currentStepIndex + 1}`}
						</h3>
						<span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
							Étape {currentStepIndex + 1}/{guide.steps?.length}
						</span>
					</div>

					<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
						<p className="text-gray-800 dark:text-gray-200">
							{currentStep?.instruction ||
								"Suivez les boutons mis en évidence dans l'environnement 3D."}
						</p>
					</div>

					{/* Astuce/Indice */}
					{currentStep?.hint && (
						<div>
							<button
								className="text-sm flex items-center text-blue-600 dark:text-blue-400 hover:underline"
								onClick={() => setShowHint(!showHint)}
							>
								<HelpCircle size={16} className="mr-1" />
								{showHint
									? "Masquer l'indice"
									: "Afficher l'indice"}
							</button>

							{showHint && (
								<div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
									{currentStep.hint}
								</div>
							)}
						</div>
					)}

					{/* Liste des étapes */}
					<div className="mt-8">
						<h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
							Progression des étapes
						</h4>
						<div className="space-y-2">
							{guide.steps?.map((step, index) => (
								<div
									key={step.id}
									className={`flex items-center p-2 rounded-md ${
										completedSteps.includes(step.id)
											? "bg-green-50 dark:bg-green-900/20"
											: index === currentStepIndex
											? "bg-blue-50 dark:bg-blue-900/20"
											: "bg-gray-50 dark:bg-gray-700"
									}`}
								>
									<div
										className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
											completedSteps.includes(step.id)
												? "bg-green-500 text-white"
												: index === currentStepIndex
												? "bg-blue-500 text-white"
												: "bg-gray-300 dark:bg-gray-600"
										}`}
									>
										{completedSteps.includes(step.id) ? (
											<CheckCircle size={16} />
										) : (
											<span className="text-xs">
												{index + 1}
											</span>
										)}
									</div>
									<span
										className={`text-sm ${
											completedSteps.includes(step.id)
												? "text-green-800 dark:text-green-200"
												: index === currentStepIndex
												? "text-blue-800 dark:text-blue-200 font-medium"
												: "text-gray-600 dark:text-gray-400"
										}`}
									>
										{step.title || `Étape ${index + 1}`}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Pied de page */}
			<div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between bg-white dark:bg-gray-800 sticky bottom-0">
				<Button variant="outline" onClick={onClose}>
					Annuler
				</Button>

				{/* Ce bouton est uniquement pour le développement/test */}
				<Button variant="default" onClick={simulateValidation}>
					Simuler l'action
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
