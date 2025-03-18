//components/wisetrainer/InteractiveGuideModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	CheckCircle,
	AlertCircle,
	ArrowRight,
	Minimize2,
	Maximize2,
	HelpCircle,
	Square,
	CheckSquare,
	ChevronDown,
	ChevronUp,
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
	const [isStepListExpanded, setIsStepListExpanded] = useState(true);

	const currentStep = guide.steps ? guide.steps[currentStepIndex] : null;
	const progress = guide.steps
		? Math.round((completedSteps.length / guide.steps.length) * 100)
		: 0;

	// Déterminer si l'étape courante utilise une checkbox pour validation
	const isCheckboxStep =
		currentStep && currentStep.validationType === "checkbox";

	// Utiliser les contenus éducatifs du guide, avec une valeur par défaut vide
	const educationalContent = guide.educational || {
		title: "Informations sur la procédure",
		content: {
			intro: "Aucune information disponible pour cette procédure.",
			sections: [],
		},
		imageUrl: "/images/png/placeholder.png",
	};

	useEffect(() => {
		console.log("Guide actuel:", guide);
		console.log("Étapes du guide:", guide.steps);
		console.log("Étape actuelle:", currentStepIndex, currentStep);
		console.log("Validation attendue:", currentStep?.validationEvent);
		console.log("Type de validation:", currentStep?.validationType);
		console.log("Mapping d'objets:", guide.objectMapping);
	}, [guide, currentStep, currentStepIndex]);

	// Fonction pour valider l'étape actuelle
	const validateCurrentStep = useCallback(() => {
		if (!currentStep) return;

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
	}, [
		currentStep,
		completedSteps,
		currentStepIndex,
		guide.steps,
		onComplete,
	]);

	// Gérer la validation manuelle par checkbox
	const handleCheckboxValidation = () => {
		validateCurrentStep();
	};

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

			console.log("🎯 Événement de validation reçu:", eventData);

			// Si le tutoriel est démarré, vérifier si l'événement correspond à l'étape actuelle
			if (tutorialStarted && currentStep) {
				// Ne pas traiter les événements Unity pour les étapes de type checkbox
				if (currentStep.validationType === "checkbox") {
					console.log(
						"⏭️ Étape de type checkbox, ignorer événement Unity"
					);
					return;
				}

				const buttonName = eventData.name || eventData.buttonName;
				const stepValidation = currentStep.validationEvent;

				console.log(
					`🔍 Comparaison: bouton=${buttonName}, validation attendue=${stepValidation}`
				);

				// Vérifier si l'événement correspond à l'étape actuelle
				if (
					buttonName &&
					(buttonName === stepValidation ||
						eventData.eventName === stepValidation ||
						(Array.isArray(guide.sequenceButtons) &&
							guide.sequenceButtons[currentStepIndex] ===
								buttonName))
				) {
					console.log("✅ Validation d'étape: OK");
					validateCurrentStep();
				} else {
					console.log("❌ Validation d'étape: Non correspondante");
				}
			}
		};

		// Écouter spécifiquement les événements GuideValidationEvent
		window.addEventListener("GuideValidationEvent", handleValidationEvent);

		// Écouter aussi les événements GameObjectSelected pour les convertir en validations
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

			if (data && data.name && tutorialStarted) {
				// Ne pas traiter pour les étapes de type checkbox
				if (currentStep?.validationType === "checkbox") {
					return;
				}

				console.log(
					`🔍 GameObject sélectionné dans le guide: ${data.name}`
				);

				// Créer et dispatcher un événement de validation
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
				window.dispatchEvent(validationEvent);
			}
		};

		window.addEventListener("GameObjectSelected", handleGameObjectSelected);

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
	}, [
		currentStep,
		tutorialStarted,
		currentStepIndex,
		guide.sequenceButtons,
		validateCurrentStep,
	]);

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

	const toggleStepList = () => {
		setIsStepListExpanded(!isStepListExpanded);
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

				{/* Contenu principal avec informations éducatives */}
				<div className="p-6 flex-1 overflow-y-auto">
					<div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
						<h3 className="text-xl font-bold mb-4 text-wisetwin-darkblue dark:text-wisetwin-blue">
							{educationalContent.title}
						</h3>

						{educationalContent.imageUrl && (
							<div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
								<Image
									src={educationalContent.imageUrl}
									alt={educationalContent.title}
									fill
									className="object-cover"
									onError={(e) => {
										e.target.src =
											"/images/png/placeholder.png";
									}}
								/>
							</div>
						)}

						<div className="prose prose-sm dark:prose-invert max-w-none">
							{/* Affichage du contenu structuré depuis la configuration */}
							{educationalContent.content.intro && (
								<p className="mb-3">
									{educationalContent.content.intro}
								</p>
							)}

							{/* Affichage des sections */}
							{educationalContent.content.sections &&
								educationalContent.content.sections.map(
									(section, index) => (
										<div key={index} className="mb-4">
											{section.title && (
												<h4 className="font-bold text-lg mb-2">
													{section.title}
												</h4>
											)}

											{section.text && (
												<p className="mb-3">
													{section.text}
												</p>
											)}

											{section.items &&
												section.items.length > 0 && (
													<ul className="list-disc pl-5 mb-3">
														{section.items.map(
															(
																item,
																itemIndex
															) => (
																<li
																	key={
																		itemIndex
																	}
																>
																	{item}
																</li>
															)
														)}
													</ul>
												)}
										</div>
									)
								)}
						</div>
					</div>

					<div className="text-center">
						<h3 className="text-xl font-bold mb-4">
							Tutoriel interactif
						</h3>
						<p className="mb-6">
							{guide.startMessage ||
								"Cliquez sur le contrôleur dans l'environnement 3D pour démarrer la séquence d'apprentissage guidée."}
						</p>
						{/* Bouton pour démarrer le tutoriel */}
						<Button
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
							onClick={simulateValidation}
						>
							{guide.startButtonText || "Démarrer le tutoriel"}
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
								"Suivez les instructions indiquées dans l'environnement 3D."}
						</p>
					</div>

					{/* Astuce/Indice */}
					{currentStep?.hint && (
						<div className="mt-4">
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

					{/* Validation manuelle pour étape de type checkbox (hors liste) */}
					{isCheckboxStep &&
						!completedSteps.includes(currentStep.id) && (
							<div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm border border-blue-200 dark:border-blue-700">
								<button
									onClick={handleCheckboxValidation}
									className="flex items-center space-x-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
								>
									<Square className="w-5 h-5" />
									<span className="ml-2">
										{currentStep.checkboxLabel ||
											"Valider manuellement cette étape"}
									</span>
								</button>
							</div>
						)}

					{/* Titre de la liste des étapes avec bouton pour réduire/développer */}
					<div className="mt-8 flex justify-between items-center">
						<h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
							Progression des étapes
						</h4>
						<button
							onClick={toggleStepList}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						>
							{isStepListExpanded ? (
								<ChevronUp className="w-4 h-4" />
							) : (
								<ChevronDown className="w-4 h-4" />
							)}
						</button>
					</div>

					{/* Liste des étapes (condensée ou développée) */}
					{isStepListExpanded ? (
						<div className="space-y-2 mt-2">
							{guide.steps?.map((step, index) => (
								<div
									key={step.id}
									className={`flex items-center p-2 rounded-md transition-all duration-300 ${
										completedSteps.includes(step.id)
											? "bg-green-50 dark:bg-green-900/20"
											: index === currentStepIndex
											? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400"
											: "bg-gray-50 dark:bg-gray-700"
									}`}
								>
									<div
										className={`w-6 h-6 flex items-center justify-center rounded-full mr-2 ${
											completedSteps.includes(step.id)
												? "bg-green-500 text-white"
												: index === currentStepIndex
												? "bg-blue-500 text-white pulse-animation"
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

									<div className="flex-grow">
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
											{step.validationType ===
												"checkbox" &&
												index === currentStepIndex && (
													<span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
														(validation manuelle)
													</span>
												)}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="mt-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
							{/* Afficher uniquement l'étape actuelle dans le mode condensé */}
							<div className="flex items-center">
								<div className="bg-blue-500 text-white w-6 h-6 flex items-center justify-center rounded-full mr-2 pulse-animation">
									<span className="text-xs">
										{currentStepIndex + 1}
									</span>
								</div>
								<span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
									{currentStep?.title ||
										`Étape ${currentStepIndex + 1}`}
								</span>
							</div>
							<div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-8">
								{completedSteps.length} sur{" "}
								{guide.steps?.length} étapes complétées
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Pied de page */}
			<div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between bg-white dark:bg-gray-800 sticky bottom-0">
				<Button variant="outline" onClick={onClose}>
					Annuler
				</Button>

				{/* Ce bouton est uniquement pour le développement/test */}
				{/* <Button variant="default" onClick={simulateValidation}>
					Simuler l'action
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button> */}
			</div>
		</div>
	);
}
