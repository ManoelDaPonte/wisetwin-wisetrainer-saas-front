//components/wisetrainer/QuestionnaireModal.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Minimize2, Maximize2 } from "lucide-react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export default function QuestionnaireModal({ scenario, onComplete, onClose }) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isMinimized, setIsMinimized] = useState(false);
	const questions = scenario.questions;
	const currentQuestion = questions[currentQuestionIndex];

	useEffect(() => {
		console.log("Scénario reçu:", scenario);
	}, [scenario]);

	const handleAnswerSelect = (questionId, answerId) => {
		if (isSingleChoiceQuestion(currentQuestion)) {
			// Pour les questions à choix unique, remplacer la sélection précédente
			setSelectedAnswers({
				...selectedAnswers,
				[questionId]: [answerId],
			});
		} else {
			// Pour les questions à choix multiple, ajouter/retirer de la sélection
			setSelectedAnswers({
				...selectedAnswers,
				[questionId]: Array.isArray(selectedAnswers[questionId])
					? selectedAnswers[questionId].includes(answerId)
						? selectedAnswers[questionId].filter(
								(id) => id !== answerId
						  )
						: [...selectedAnswers[questionId], answerId]
					: [answerId],
			});
		}
	};

	const isSingleChoiceQuestion = (question) => {
		return question.type === "SINGLE";
	};

	const handleNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			submitQuestionnaire();
		}
	};

	const submitQuestionnaire = async () => {
		try {
			setIsSubmitting(true);

			// Préparer les réponses pour l'API
			const responses = questions.map((question) => ({
				questionId: question.id,
				selectedAnswers: selectedAnswers[question.id] || [],
			}));

			// Envoyer les réponses à l'API pour vérification
			const response = await axios.post(
				WISETRAINER_CONFIG.API_ROUTES.SAVE_QUESTIONNAIRE,
				{
					userId: "temp-user", // À remplacer par l'ID réel si disponible
					questionnaireId: scenario.id,
					responses,
				}
			);

			if (response.data && response.data.responses) {
				setResults(response.data.responses);
				setShowResults(true);
			} else {
				throw new Error("Réponse de l'API invalide");
			}
		} catch (error) {
			console.error(
				"Erreur lors de la soumission du questionnaire:",
				error
			);
			// En cas d'erreur, essayer une vérification locale
			calculateResultsLocally();
		} finally {
			setIsSubmitting(false);
		}
	};

	const calculateResultsLocally = () => {
		console.log("Calcul local des résultats");

		// Log pour aider au débogage
		console.log("Questions:", questions);
		console.log("Réponses sélectionnées:", selectedAnswers);

		const calculatedResults = questions.map((q) => {
			const selected = selectedAnswers[q.id] || [];

			// Supposons que les options correctes sont marquées dans les données
			// Vérifiez si c'est le cas en console
			console.log(`Options pour question ${q.id}:`, q.options);

			// Essayer de trouver les options correctes (si disponibles)
			let correctAnswerIds = [];

			// Tentative 1: Vérifier si isCorrect existe dans les options
			if (q.options.some((opt) => opt.isCorrect !== undefined)) {
				correctAnswerIds = q.options
					.filter((option) => option.isCorrect === true)
					.map((option) => option.id);
			}
			// Tentative 2: S'il n'y a pas de propriété isCorrect, supposez une valeur
			else {
				// Pour les démonstrations, on peut considérer la première option comme correcte
				// (à remplacer par une logique plus appropriée)
				correctAnswerIds = isSingleChoiceQuestion(q)
					? [q.options[0].id]
					: [q.options[0].id, q.options[1].id];
			}

			console.log(
				`Réponses correctes pour question ${q.id}:`,
				correctAnswerIds
			);

			// Déterminer si la réponse est correcte
			const isCorrect = isSingleChoiceQuestion(q)
				? selected.length === 1 &&
				  correctAnswerIds.includes(selected[0])
				: selected.length === correctAnswerIds.length &&
				  selected.every((a) => correctAnswerIds.includes(a));

			return {
				questionId: q.id,
				question: q.text,
				selectedAnswers: selected,
				correctAnswers: correctAnswerIds,
				isCorrect: isCorrect,
			};
		});

		setResults(calculatedResults);
		setShowResults(true);
	};

	const getScore = () => {
		if (!results) return 0;
		const correctAnswers = results.filter((r) => r.isCorrect).length;
		return Math.round((correctAnswers / results.length) * 100);
	};

	const handleClose = () => {
		if (results) {
			const score = getScore();
			onComplete({
				score: score,
				scenarioId: scenario.id,
				detailedResults: results,
			});
		} else {
			onClose();
		}
	};

	const getOptionLabel = (optionId, question) => {
		const option = question.options.find((o) => o.id === optionId);
		return option ? option.text : "Option non trouvée";
	};

	const toggleMinimize = () => {
		setIsMinimized(!isMinimized);
	};

	return (
		<div
			className={`fixed z-40 transition-all duration-300 ease-in-out ${
				isMinimized
					? "bottom-4 right-4 w-64 h-16"
					: "top-16 right-0 bottom-4 w-2/5 max-w-xl"
			}`}
		>
			{isMinimized ? (
				<div className="bg-blue-600 dark:bg-blue-800 text-white p-4 rounded-lg shadow-xl flex items-center justify-between">
					<div className="flex-1 truncate">
						<h3 className="font-bold truncate">{scenario.title}</h3>
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
			) : (
				<div className="bg-white/95 dark:bg-gray-800/95 h-full overflow-y-auto rounded-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700">
					{/* En-tête */}
					<div className="bg-blue-600 dark:bg-blue-800 text-white p-4 sticky top-0 z-10 flex items-center justify-between">
						<div>
							<h2 className="text-xl font-bold">
								{scenario.title}
							</h2>
							<p className="text-sm opacity-90">
								{scenario.description}
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

					{/* Contenu */}
					<div className="p-6 flex-1 overflow-y-auto">
						{!showResults ? (
							/* Affichage de la question */
							<div>
								<div className="mb-4 flex justify-between items-center">
									<span className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Question {currentQuestionIndex + 1} /{" "}
										{questions.length}
									</span>
									<span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded">
										{isSingleChoiceQuestion(currentQuestion)
											? "Choix unique"
											: "Choix multiple"}
									</span>
								</div>

								<h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
									{currentQuestion.text}
								</h3>

								<div className="space-y-3 mb-6">
									{currentQuestion.options.map((option) => {
										// Déterminer si cette option est sélectionnée
										const isSelected =
											selectedAnswers[
												currentQuestion.id
											]?.includes(option.id) || false;

										return (
											<div
												key={option.id}
												className={`
                                                p-4 border rounded-lg cursor-pointer transition-colors
                                                ${
													isSelected
														? "bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-700"
														: "bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
												}
                                                `}
												onClick={() =>
													handleAnswerSelect(
														currentQuestion.id,
														option.id
													)
												}
											>
												<div className="flex items-center">
													<div
														className={`
                                                        w-5 h-5 flex-shrink-0 ${
															isSingleChoiceQuestion(
																currentQuestion
															)
																? "rounded-full"
																: "rounded-sm"
														} border mr-3
                                                        ${
															isSelected
																? "bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600"
																: "border-gray-300 dark:border-gray-500"
														}
                                                        `}
													>
														{isSelected && (
															<div className="w-full h-full flex items-center justify-center">
																<div
																	className={`${
																		isSingleChoiceQuestion(
																			currentQuestion
																		)
																			? "w-2 h-2 rounded-full"
																			: "w-3 h-3 text-white"
																	} bg-white`}
																></div>
															</div>
														)}
													</div>
													<span className="text-gray-800 dark:text-gray-200">
														{option.text}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						) : (
							/* Affichage des résultats */
							<div>
								<div className="text-center mb-6">
									<div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
										<span className="text-2xl font-bold">
											{getScore()}%
										</span>
									</div>
									<h3 className="text-xl font-bold text-gray-800 dark:text-white">
										{getScore() >= 70
											? "Félicitations!"
											: "Des points à améliorer"}
									</h3>
									<p className="text-gray-600 dark:text-gray-400">
										{getScore() >= 70
											? "Vous avez une bonne compréhension des risques et mesures de prévention."
											: "Revoyez les risques et mesures de prévention pour améliorer votre score."}
									</p>
								</div>

								<div className="space-y-6">
									{results.map((result, index) => {
										const question = questions.find(
											(q) => q.id === result.questionId
										);

										return (
											<div
												key={result.questionId}
												className={`p-4 border rounded-lg ${
													result.isCorrect
														? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900"
														: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900"
												}`}
											>
												<div className="flex items-start mb-2">
													{result.isCorrect ? (
														<CheckCircle2 className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" />
													) : (
														<XCircle className="w-6 h-6 text-red-500 mr-2 flex-shrink-0" />
													)}
													<h4 className="font-medium text-gray-800 dark:text-white">
														Question {index + 1}:{" "}
														{question?.text}
													</h4>
												</div>

												<div className="ml-8 mt-2">
													<div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
														Votre réponse:
													</div>
													<ul className="list-disc list-inside text-sm ml-2 mb-2">
														{result.selectedAnswers
															.length > 0 ? (
															result.selectedAnswers.map(
																(answerId) => {
																	const option =
																		question?.options.find(
																			(
																				o
																			) =>
																				o.id ===
																				answerId
																		);
																	return (
																		<li
																			key={
																				answerId
																			}
																			className="text-gray-800 dark:text-gray-200"
																		>
																			{getOptionLabel(
																				answerId,
																				question
																			)}
																		</li>
																	);
																}
															)
														) : (
															<li className="text-gray-500 italic">
																Aucune réponse
																sélectionnée
															</li>
														)}
													</ul>

													{!result.isCorrect && (
														<>
															<div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
																Réponse
																correcte:
															</div>
															<ul className="list-disc list-inside text-sm ml-2 text-green-600 dark:text-green-400">
																{result.correctAnswers.map(
																	(
																		answerId
																	) => (
																		<li
																			key={
																				answerId
																			}
																		>
																			{getOptionLabel(
																				answerId,
																				question
																			)}
																		</li>
																	)
																)}
															</ul>
														</>
													)}

													{question.explanation && (
														<div className="mt-2 text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
															<span className="font-medium">
																Explication:
															</span>{" "}
															{
																question.explanation
															}
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>

					{/* Pied de page */}
					<div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between bg-white dark:bg-gray-800 sticky bottom-0">
						<Button variant="outline" onClick={handleClose}>
							{showResults ? "Terminer" : "Annuler"}
						</Button>

						{!showResults && (
							<Button
								onClick={handleNext}
								disabled={
									!selectedAnswers[currentQuestion?.id] ||
									selectedAnswers[currentQuestion?.id]
										.length === 0 ||
									isSubmitting
								}
							>
								{isSubmitting
									? "Chargement..."
									: currentQuestionIndex <
									  questions.length - 1
									? "Question suivante"
									: "Voir les résultats"}
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
