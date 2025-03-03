//components/wisetrainer/QuestionnaireModal.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuestionnaireModal({ scenario, onComplete, onClose }) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState(null);

	const questions = scenario.questions;
	const currentQuestion = questions[currentQuestionIndex];

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
		// Si la question a un correctAnswerId (pas un array), c'est une question à choix unique
		return !!question.correctAnswerId;
	};

	const handleNext = () => {
		if (currentQuestionIndex < questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			calculateResults();
		}
	};

	const calculateResults = () => {
		const calculatedResults = questions.map((q) => {
			// Vérifier si c'est une question à choix unique ou multiple
			if (isSingleChoiceQuestion(q)) {
				// Question à choix unique
				const selectedAnswer = selectedAnswers[q.id]
					? selectedAnswers[q.id][0]
					: null;
				return {
					questionId: q.id,
					question: q.text,
					selectedAnswers: selectedAnswer ? [selectedAnswer] : [],
					correctAnswers: [q.correctAnswerId],
					isCorrect: selectedAnswer === q.correctAnswerId,
				};
			} else {
				// Question à choix multiple
				const selected = selectedAnswers[q.id] || [];
				// Vérifier si les réponses sélectionnées correspondent exactement aux réponses correctes
				const isCorrect =
					selected.length === q.correctAnswerIds.length &&
					selected.every((a) => q.correctAnswerIds.includes(a));

				return {
					questionId: q.id,
					question: q.text,
					selectedAnswers: selected,
					correctAnswers: q.correctAnswerIds,
					isCorrect: isCorrect,
				};
			}
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
			// Calculer le score avant de le passer
			const correctAnswers = results.filter((r) => r.isCorrect).length;
			const score = Math.round((correctAnswers / results.length) * 100);

			// Passer un objet avec le score et les résultats détaillés
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

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
				{/* En-tête */}
				<div className="bg-blue-600 dark:bg-blue-800 text-white p-4 rounded-t-lg">
					<h2 className="text-xl font-bold">{scenario.title}</h2>
					<p className="text-sm opacity-90">{scenario.description}</p>
				</div>

				{/* Contenu */}
				<div className="p-6">
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
								isSingleChoiceQuestion(currentQuestion)
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
													{result.question}
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
															(answerId) => (
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
															)
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
															Réponse correcte:
														</div>
														<ul className="list-disc list-inside text-sm ml-2 text-green-600 dark:text-green-400">
															{result.correctAnswers.map(
																(answerId) => (
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
														{question.explanation}
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
				<div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
					<Button variant="outline" onClick={handleClose}>
						{showResults ? "Terminer" : "Annuler"}
					</Button>

					{!showResults && (
						<Button
							onClick={handleNext}
							disabled={
								!selectedAnswers[currentQuestion?.id] ||
								selectedAnswers[currentQuestion?.id].length ===
									0
							}
						>
							{currentQuestionIndex < questions.length - 1
								? "Question suivante"
								: "Voir les résultats"}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
