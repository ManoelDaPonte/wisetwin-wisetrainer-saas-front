//components/wisetrainer/QuestionnaireDebug.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import axios from "axios";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

export default function QuestionnaireDebug({
	scenario,
	userId,
	courseId,
	onComplete,
}) {
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswers, setSelectedAnswers] = useState({});
	const [showResults, setShowResults] = useState(false);
	const [results, setResults] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Réinitialiser l'état à chaque changement de scénario
		resetQuestionnaire();
	}, [scenario]);

	const resetQuestionnaire = () => {
		setCurrentQuestionIndex(0);
		setSelectedAnswers({});
		setShowResults(false);
		setResults(null);
		setError(null);
	};

	const handleAnswerSelect = (questionId, answerId) => {
		if (isSingleChoiceQuestion(scenario.questions[currentQuestionIndex])) {
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
		if (currentQuestionIndex < scenario.questions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		} else {
			submitQuestionnaire();
		}
	};

	const handlePrevious = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	const submitQuestionnaire = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Préparer les réponses pour l'API
			const responses = scenario.questions.map((question) => ({
				questionId: question.id,
				selectedAnswers: selectedAnswers[question.id] || [],
			}));

			// Envoyer les réponses à l'API
			const response = await axios.post(
				WISETRAINER_CONFIG.API_ROUTES.SAVE_QUESTIONNAIRE,
				{
					userId,
					questionnaireId: scenario.id,
					responses,
				}
			);

			if (response.data.success) {
				setResults(response.data.responses);
				setShowResults(true);

				// Enregistrer la progression
				await axios.post(
					WISETRAINER_CONFIG.API_ROUTES.UPDATE_PROGRESS,
					{
						userId,
						trainingId: courseId,
						progress: response.data.score, // Utilisez le score comme pourcentage de progression si approprié
						completedModule: scenario.id,
						moduleScore: response.data.score,
					}
				);
			} else {
				throw new Error(
					response.data.error ||
						"Échec de l'enregistrement des réponses"
				);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la soumission du questionnaire:",
				error
			);
			setError(
				error.response?.data?.error ||
					error.message ||
					"Une erreur est survenue lors de l'enregistrement des réponses."
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleComplete = () => {
		if (results) {
			const score = getScore();
			if (onComplete) {
				// Passer un objet avec le score au lieu des résultats bruts
				onComplete({
					score: score,
					scenarioId: scenario.id,
				});
			}
		}
	};

	const handleRetryQuestionnaire = () => {
		resetQuestionnaire();
	};

	const getScore = () => {
		if (!results) return 0;
		const correctAnswers = results.filter((r) => r.isCorrect).length;
		return Math.round((correctAnswers / results.length) * 100);
	};

	// Si pas de scénario, ne rien afficher
	if (!scenario || !scenario.questions || scenario.questions.length === 0) {
		return <div>Aucune question disponible</div>;
	}

	const currentQuestion = scenario.questions[currentQuestionIndex];

	return (
		<Card className="max-w-3xl mx-auto">
			<CardHeader>
				<CardTitle>{scenario.title}</CardTitle>
				<p className="text-gray-500">{scenario.description}</p>
			</CardHeader>
			<CardContent className="space-y-4">
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
						<p className="font-medium">Erreur:</p>
						<p>{error}</p>
						<Button
							onClick={handleRetryQuestionnaire}
							variant="outline"
							className="mt-2"
						>
							Réessayer
						</Button>
					</div>
				)}

				{!showResults ? (
					<>
						<div className="mb-4 flex justify-between items-center">
							<span className="text-sm font-medium text-gray-500">
								Question {currentQuestionIndex + 1} /{" "}
								{scenario.questions.length}
							</span>
							<span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
								{isSingleChoiceQuestion(currentQuestion)
									? "Choix unique"
									: "Choix multiple"}
							</span>
						</div>

						<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
							<h3 className="text-lg font-medium mb-2">
								{currentQuestion.text}
							</h3>
							<div className="space-y-2">
								{currentQuestion.options.map((option) => {
									const isSelected = (
										selectedAnswers[currentQuestion.id] ||
										[]
									).includes(option.id);

									return (
										<div
											key={option.id}
											className={`p-3 border rounded-lg cursor-pointer ${
												isSelected
													? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
													: "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
											}`}
											onClick={() =>
												handleAnswerSelect(
													currentQuestion.id,
													option.id
												)
											}
										>
											<div className="flex items-center">
												<div
													className={`w-5 h-5 flex-shrink-0 ${
														isSingleChoiceQuestion(
															currentQuestion
														)
															? "rounded-full"
															: "rounded"
													} border mr-3 flex items-center justify-center ${
														isSelected
															? "bg-blue-500 border-blue-500"
															: "border-gray-300"
													}`}
												>
													{isSelected && (
														<div className="w-2 h-2 bg-white rounded-full"></div>
													)}
												</div>
												<span>{option.text}</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						<div className="flex justify-between space-x-3">
							<Button
								variant="outline"
								onClick={handlePrevious}
								disabled={
									currentQuestionIndex === 0 || isSubmitting
								}
							>
								Précédent
							</Button>
							<Button
								onClick={handleNext}
								disabled={
									!selectedAnswers[currentQuestion.id] ||
									selectedAnswers[currentQuestion.id]
										.length === 0 ||
									isSubmitting
								}
							>
								{isSubmitting ? (
									<>
										<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
										Chargement...
									</>
								) : currentQuestionIndex <
								  scenario.questions.length - 1 ? (
									"Suivant"
								) : (
									"Terminer"
								)}
							</Button>
						</div>
					</>
				) : (
					<div>
						<div className="text-center mb-6">
							<div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
								<span className="text-2xl font-bold">
									{getScore()}%
								</span>
							</div>
							<h3 className="text-xl font-bold">
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

						<div className="space-y-4">
							{results.map((result, index) => {
								const question = scenario.questions.find(
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
											<h4 className="font-medium">
												Question {index + 1}:{" "}
												{question?.text}
											</h4>
										</div>

										<div className="ml-8 mt-2">
											<div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
												Votre réponse:
											</div>
											<ul className="list-disc list-inside text-sm ml-2 mb-2">
												{result.selectedAnswers.length >
												0 ? (
													result.selectedAnswers.map(
														(answerId) => {
															const option =
																question?.options.find(
																	(o) =>
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
																	{option?.text ||
																		"Option non trouvée"}
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
														Réponse correcte:
													</div>
													<ul className="list-disc list-inside text-sm ml-2 text-green-600 dark:text-green-400">
														{result.correctAnswers.map(
															(answerId) => {
																const option =
																	question?.options.find(
																		(o) =>
																			o.id ===
																			answerId
																	);
																return (
																	<li
																		key={
																			answerId
																		}
																	>
																		{option?.text ||
																			"Option non trouvée"}
																	</li>
																);
															}
														)}
													</ul>
												</>
											)}
										</div>
									</div>
								);
							})}
						</div>

						<div className="mt-6 flex justify-between">
							<Button
								variant="outline"
								onClick={handleRetryQuestionnaire}
							>
								Recommencer
							</Button>
							<Button onClick={handleComplete}>
								Terminer le questionnaire
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
