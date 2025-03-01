"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Clock,
	BookOpen,
	Award,
	ChevronLeft,
	CheckCircle2,
} from "lucide-react";
import QuestionnaireModal from "@/components/wisetrainer/QuestionnaireModal";
import UnityBuild from "./UnityBuild";
import { useUnityEvents } from "@/hooks/wisetrainer/useUnityEvents";

export default function CourseDetailPage({ params }) {
	const {
		currentScenario,
		showQuestionnaire,
		setShowQuestionnaire,
		setCurrentScenario,
	} = useUnityEvents();

	const router = useRouter();
	const userId = metadata?.azure_container_name;
	const [courseId, setCourseId] = useState(null);
	const unityRef = useRef(null);

	const [course, setCourse] = useState(null);
	const [progress, setProgress] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
	const [completedScenarios, setCompletedScenarios] = useState([]);
	const [totalScore, setTotalScore] = useState(0);

	// Extraction du courseId depuis params (qui est une promesse)
	useEffect(() => {
		async function extractParams() {
			try {
				// Si params est une promesse, on la résout
				if (params && typeof params.then === "function") {
					const resolvedParams = await params;
					console.log("Params résolus:", resolvedParams);

					// Si la valeur est une chaîne JSON, on la parse
					if (typeof resolvedParams.value === "string") {
						const parsedValue = JSON.parse(resolvedParams.value);
						console.log("Valeur parsée:", parsedValue);
						setCourseId(parsedValue.courseId || "WiseTrainer_01");
					} else if (resolvedParams.courseId) {
						setCourseId(resolvedParams.courseId);
					}
				} else if (params && params.courseId) {
					// Si params est déjà un objet avec courseId
					setCourseId(params.courseId);
				} else {
					// Valeur par défaut
					setCourseId("WiseTrainer_01");
				}

				console.log("courseId final:", courseId);
			} catch (error) {
				console.error("Erreur lors de l'extraction des params:", error);
				setCourseId("WiseTrainer_01"); // Valeur par défaut en cas d'erreur
			}
		}

		extractParams();
	}, [params]);

	// Fetch course data and progress
	useEffect(() => {
		const fetchCourseData = async () => {
			if (!courseId || !userId) return;

			setIsLoading(true);

			try {
				// Look for the course in available trainings
				const buildsResponse = await axios.get(
					"/api/azure/wisetrainer/builds"
				);
				const availableCourse = buildsResponse.data.builds.find(
					(build) => build.id === courseId || build.name === courseId
				);

				if (availableCourse) {
					setCourse(availableCourse);
				}

				// Get user's progress
				const progressResponse = await axios.get(
					`/api/db/wisetrainer/user-trainings/${userId}`
				);

				const userCourse = progressResponse.data.trainings.find(
					(training) =>
						training.id === courseId || training.name === courseId
				);

				if (userCourse) {
					setProgress(userCourse.progress || 0);
					setCompletedScenarios(userCourse.completedModules || []);
					setTotalScore(userCourse.totalScore || 0);
				}
			} catch (error) {
				console.error("Error fetching course data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourseData();
	}, [courseId, userId]);

	// Handle questionnaire completion
	const handleQuestionnaireComplete = async (results) => {
		setShowQuestionnaire(false);

		if (!currentScenario) return;

		try {
			// Calculate score
			const correctAnswers = results.filter((r) => r.isCorrect).length;
			const score = Math.round((correctAnswers / results.length) * 100);

			// Determine if questionnaire was passed (e.g., score >= 70%)
			const isPassed = score >= 70;

			// Save responses
			await axios.post("/api/db/wisetrainer/save-questionnaire", {
				userId,
				trainingId: courseId,
				questionnaireId: currentScenario.id,
				responses: results,
				score,
			});

			// Update completed scenarios
			if (!completedScenarios.includes(currentScenario.id)) {
				const updatedCompletedScenarios = [
					...completedScenarios,
					currentScenario.id,
				];
				setCompletedScenarios(updatedCompletedScenarios);

				// Update total score
				const newTotalScore = totalScore + score;
				setTotalScore(newTotalScore);

				// Calculate new progress (assuming 5 modules per course)
				const newProgress = Math.min(
					Math.round((updatedCompletedScenarios.length / 5) * 100),
					100
				);
				setProgress(newProgress);

				// Update progress in the database
				await axios.post("/api/db/wisetrainer/update-progress", {
					userId,
					trainingId: courseId,
					progress: newProgress,
					completedModule: currentScenario.id,
					moduleScore: score,
				});
			}

			// Notify Unity that the questionnaire is completed
			if (unityRef.current && unityRef.current.completeQuestionnaire) {
				unityRef.current.completeQuestionnaire(
					currentScenario.id,
					isPassed
				);
			}
		} catch (error) {
			console.error("Error saving questionnaire results:", error);
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto p-6">
				<div className="animate-pulse space-y-6">
					<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
					<div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
						<div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
						<div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
					</div>
				</div>
			</div>
		);
	}

	if (!course) {
		return (
			<div className="container mx-auto p-6 text-center">
				<h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
				<p className="mb-6">The requested course could not be found.</p>
				<Button
					onClick={() => router.push("/wisetrainer")}
					className="flex items-center"
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Courses
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			{/* Header with back button */}
			<div className="flex items-center mb-6">
				<Button
					variant="outline"
					size="sm"
					onClick={() => router.push("/wisetrainer")}
					className="mr-4"
				>
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Courses
				</Button>
				<h1 className="text-2xl font-bold text-wisetwin-darkblue dark:text-white">
					{course.name}
				</h1>
			</div>

			{/* Progress section */}
			<div className="mb-6">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-lg font-semibold">Your Progress</h2>
					<span className="text-sm font-medium">
						{progress}% Complete
					</span>
				</div>
				<Progress value={progress} className="h-2 mb-1" />
				<div className="flex justify-between text-sm text-gray-500">
					<span>Completed modules: {completedScenarios.length}</span>
					<span>Total score: {totalScore} points</span>
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className="mb-8"
			>
				<TabsList>
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="training">Training Module</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="py-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>About This Course</CardTitle>
									<div className="flex space-x-2">
										<Badge
											variant="outline"
											className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
										>
											{course.difficulty}
										</Badge>
										<Badge
											variant="outline"
											className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200"
										>
											{course.category}
										</Badge>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div>
										<h3 className="font-semibold flex items-center mb-2">
											<Clock className="h-4 w-4 mr-2" />{" "}
											Duration
										</h3>
										<p className="text-gray-600 dark:text-gray-300">
											{course.duration}
										</p>
									</div>

									<div>
										<h3 className="font-semibold flex items-center mb-2">
											<BookOpen className="h-4 w-4 mr-2" />{" "}
											Description
										</h3>
										<p className="text-gray-600 dark:text-gray-300">
											{course.description}
										</p>
									</div>

									<div>
										<h3 className="font-semibold mb-2">
											What you'll learn:
										</h3>
										<ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
											<li>
												Safety protocols and best
												practices
											</li>
											<li>
												Risk assessment and hazard
												identification
											</li>
											<li>
												Emergency response procedures
											</li>
											<li>
												Compliance with industry
												standards
											</li>
										</ul>
									</div>
								</CardContent>
								<CardFooter>
									<Button
										className="w-full"
										onClick={() => setActiveTab("training")}
									>
										{progress > 0
											? "Continue Training"
											: "Start Training"}
									</Button>
								</CardFooter>
							</Card>
						</div>

						{/* Module completion status card */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Award className="h-5 w-5 mr-2" /> Module
									Completion
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{/* Simulated modules list */}
									{[
										"safety-basics",
										"risk-assessment",
										"emergency-response",
										"compliance",
										"certification",
									].map((moduleId, index) => {
										const isCompleted =
											completedScenarios.includes(
												moduleId
											);
										return (
											<div
												key={moduleId}
												className={`flex items-center p-2 rounded-md ${
													isCompleted
														? "bg-green-50 dark:bg-green-900/20"
														: ""
												}`}
											>
												<div
													className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
														isCompleted
															? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200"
															: "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
													}`}
												>
													{isCompleted ? (
														<CheckCircle2 className="w-4 h-4" />
													) : (
														<span>{index + 1}</span>
													)}
												</div>
												<div className="flex-1">
													<h4
														className={`text-sm font-medium ${
															isCompleted
																? "text-green-800 dark:text-green-200"
																: ""
														}`}
													>
														Module {index + 1}:{" "}
														{moduleId
															.split("-")
															.map(
																(word) =>
																	word
																		.charAt(
																			0
																		)
																		.toUpperCase() +
																	word.slice(
																		1
																	)
															)
															.join(" ")}
													</h4>
												</div>
											</div>
										);
									})}
								</div>
							</CardContent>
							<CardFooter>
								<div className="w-full flex justify-center">
									<Badge
										variant="outline"
										className="text-center"
									>
										{completedScenarios.length}/5 modules
										completed
									</Badge>
								</div>
							</CardFooter>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="training" className="py-4">
					<div className="space-y-4">
						{/* Unity WebGL container - using the updated component with event handling */}
						<UnityBuild
							courseId={courseId}
							// onQuestionnaireRequest={(scenarioData) => {
							// 	setCurrentScenario(scenarioData);
							// 	setShowQuestionnaireModal(true);
							// }}
							ref={unityRef}
						/>

						{/* Instructions for the training */}
						<Card>
							<CardHeader>
								<CardTitle>Training Instructions</CardTitle>
							</CardHeader>
							<CardContent>
								<ol className="list-decimal pl-6 space-y-2">
									<li>
										Navigate the 3D environment using your
										mouse and keyboard (WASD or arrow keys).
									</li>
									<li>
										Interact with highlighted objects by
										clicking on them.
									</li>
									<li>
										Complete the scenario questionnaires
										when prompted.
									</li>
									<li>
										Identify all safety hazards and answer
										related questions to progress.
									</li>
									<li>
										Complete all modules to finish the
										training course.
									</li>
								</ol>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Questionnaire Modal */}
			{showQuestionnaire && currentScenario && (
				<QuestionnaireModal
					scenario={currentScenario}
					onComplete={handleQuestionnaireComplete}
					onClose={() => setShowQuestionnaire(false)}
				/>
			)}
		</div>
	);
}
