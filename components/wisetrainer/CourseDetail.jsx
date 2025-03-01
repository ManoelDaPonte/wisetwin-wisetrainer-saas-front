"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Book,
	Award,
	Clock,
	Calendar,
	CheckCircle,
	Info,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import UnityBuild from "@/components/wisetrainer/UnityBuild";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

export default function CourseDetail({ params }) {
	const router = useRouter();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [courseId, setCourseId] = useState(null);
	const [course, setCourse] = useState(null);
	const [userProgress, setUserProgress] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const unityBuildRef = useRef(null);
	const [activeTab, setActiveTab] = useState("details");
	const [showQuestionnaire, setShowQuestionnaire] = useState(false);
	const [currentScenario, setCurrentScenario] = useState(null);

	// Extraire courseId des paramètres
	useEffect(() => {
		if (params?.courseId) {
			setCourseId(params.courseId);
		}
	}, [params]);

	// Charger les détails du cours quand courseId et containerName sont disponibles
	useEffect(() => {
		// Corrigé: Initialement isLoading est true, donc cette condition n'était jamais vérifiée
		if (courseId && containerName && !containerLoading) {
			fetchCourseDetails();
		}
	}, [courseId, containerName, containerLoading]);

	const fetchCourseDetails = async () => {
		setIsLoading(true);
		try {
			console.log(
				`Chargement des détails du cours ${courseId} pour le container ${containerName}`
			);

			// Pour l'instant, nous allons simuler les données du cours et de la progression
			const courseDetails = {
				id: courseId,
				name: formatCourseName(courseId),
				description: `Formation complète sur ${formatCourseName(
					courseId
				).toLowerCase()}. Cette formation vous apprendra les bases essentielles pour maîtriser ${formatCourseName(
					courseId
				).toLowerCase()} en environnement industriel.`,
				difficulty: "Intermédiaire",
				duration: "45 min",
				category: "Sécurité industrielle",
				imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
				lastAccessed: new Date().toISOString(),
				completedDate: null,
				author: "Équipe WiseTwin",
				modules: [
					{
						id: "module-1",
						title: "Introduction",
						description: "Présentation des concepts de base",
						completed: true,
						score: 85,
					},
					{
						id: "module-2",
						title: "Évaluation des risques",
						description:
							"Identification et évaluation des dangers potentiels",
						completed: false,
						score: 0,
					},
					{
						id: "module-3",
						title: "Procédures de sécurité",
						description: "Mise en œuvre des protocoles de sécurité",
						completed: false,
						score: 0,
					},
					{
						id: "module-4",
						title: "Intervention d'urgence",
						description: "Réponse aux situations critiques",
						completed: false,
						score: 0,
					},
				],
			};

			const userProgressData = {
				progress: 25, // pourcentage global
				startDate: new Date(
					Date.now() - 7 * 24 * 60 * 60 * 1000
				).toISOString(), // 7 jours avant
				lastAccessed: new Date().toISOString(),
				totalScore: 85,
				completedModules: 1,
				totalModules: 4,
			};

			setCourse(courseDetails);
			setUserProgress(userProgressData);
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des détails du cours:",
				error
			);
		} finally {
			setIsLoading(false);
		}
	};

	const formatCourseName = (id) => {
		return id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleBack = () => {
		router.push("/wisetrainer");
	};

	const handleScenarioComplete = (scenarioId, success, score) => {
		// Cette fonction sera appelée lorsqu'un questionnaire est complété
		// On pourrait mettre à jour la progression de l'utilisateur ici
		console.log(
			`Scénario ${scenarioId} complété avec ${
				success ? "succès" : "échec"
			}, score: ${score}`
		);

		// Fermer le questionnaire
		setShowQuestionnaire(false);

		// Notifier le build Unity que le questionnaire est complété
		if (unityBuildRef.current && unityBuildRef.current.isReady) {
			unityBuildRef.current.completeQuestionnaire(scenarioId, success);
		}

		// Mettre à jour la progression (à remplacer par un appel API)
		if (success && course) {
			const updatedModules = course.modules.map((module, index) => {
				if (index === 1 && !module.completed) {
					// Simuler la complétion du deuxième module
					return { ...module, completed: true, score };
				}
				return module;
			});

			setCourse({
				...course,
				modules: updatedModules,
			});

			setUserProgress((prev) => ({
				...prev,
				progress: Math.min(50, prev.progress + 25),
				completedModules: 2,
				totalScore: prev.totalScore + score,
			}));
		}
	};

	const handleQuestionnaireRequest = (scenario) => {
		// Cette fonction sera appelée lorsque le build Unity demande un questionnaire
		setCurrentScenario(scenario);
		setShowQuestionnaire(true);
	};

	// Afficher un loader pendant le chargement initial
	if (containerLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin h-10 w-10 border-4 border-wisetwin-blue border-t-transparent rounded-full mb-4 mx-auto"></div>
					<p>Chargement des informations du container...</p>
				</div>
			</div>
		);
	}

	// Afficher un loader pendant le chargement des détails du cours
	if (isLoading && !course) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin h-10 w-10 border-4 border-wisetwin-blue border-t-transparent rounded-full mb-4 mx-auto"></div>
					<p>Chargement des détails du cours...</p>
					<p className="text-sm text-gray-500 mt-2">
						CourseID: {courseId}, Container: {containerName}
					</p>
				</div>
			</div>
		);
	}

	// Gérer le cas où les informations essentielles manquent
	if (!courseId || !containerName) {
		return (
			<div className="text-center py-10">
				<p className="text-red-500 mb-4">
					Erreur de chargement du cours
				</p>
				<p className="mb-4 text-sm">
					ID du cours ou container manquant
				</p>
				<Button onClick={handleBack}>Retour aux formations</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<Button variant="outline" onClick={handleBack} className="mb-4">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Retour aux formations
				</Button>

				{course && (
					<>
						<div className="flex items-start justify-between">
							<div>
								<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
									{course.name}
								</h1>
								<div className="flex items-center space-x-4 mb-2">
									<Badge
										variant="outline"
										className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
									>
										{course.difficulty}
									</Badge>
									<span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
										<Clock className="w-4 h-4 mr-1" />
										{course.duration}
									</span>
									<span className="flex items-center text-sm text-gray-500 dark:text-gray-400">
										<Book className="w-4 h-4 mr-1" />
										{course.category}
									</span>
								</div>
							</div>

							{userProgress && (
								<div className="text-right">
									<span className="text-lg font-semibold">
										{userProgress.progress}% complété
									</span>
									<Progress
										value={userProgress.progress}
										className="h-2 w-32 mt-1"
									/>
								</div>
							)}
						</div>

						<p className="text-gray-600 dark:text-gray-300 mt-4">
							{course.description}
						</p>
					</>
				)}
			</div>

			<Tabs
				defaultValue="details"
				className="w-full"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-8">
					<TabsTrigger value="details" className="px-6">
						Détails du cours
					</TabsTrigger>
					<TabsTrigger value="training" className="px-6">
						Formation en 3D
					</TabsTrigger>
				</TabsList>

				<TabsContent value="details">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="md:col-span-2">
							<Card>
								<CardHeader>
									<CardTitle>Modules de formation</CardTitle>
									<CardDescription>
										Progression dans les différents modules
										du cours
									</CardDescription>
								</CardHeader>
								<CardContent>
									{course &&
										course.modules &&
										course.modules.map((module, index) => (
											<div
												key={module.id}
												className="mb-6 last:mb-0"
											>
												<div className="flex items-start">
													<div
														className={`rounded-full w-8 h-8 flex items-center justify-center mr-3 ${
															module.completed
																? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
																: "bg-gray-100 text-gray-400 dark:bg-gray-800"
														}`}
													>
														{module.completed ? (
															<CheckCircle className="w-5 h-5" />
														) : (
															<span>
																{index + 1}
															</span>
														)}
													</div>
													<div className="flex-1">
														<h3 className="text-lg font-medium mb-1 flex items-center">
															{module.title}
															{module.completed && (
																<span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200">
																	{
																		module.score
																	}
																	%
																</span>
															)}
														</h3>
														<p className="text-gray-600 dark:text-gray-400 text-sm">
															{module.description}
														</p>
													</div>
												</div>
												{index <
													course.modules.length -
														1 && (
													<div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 h-8"></div>
												)}
											</div>
										))}
								</CardContent>
							</Card>
						</div>

						<div>
							<Card className="mb-6">
								<CardHeader>
									<CardTitle>Informations</CardTitle>
								</CardHeader>
								<CardContent>
									<dl className="space-y-4">
										<div>
											<dt className="text-sm text-gray-500 dark:text-gray-400">
												Auteur
											</dt>
											<dd className="font-medium">
												{course?.author ||
													"Non spécifié"}
											</dd>
										</div>
										{userProgress?.startDate && (
											<div>
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Commencé le
												</dt>
												<dd className="font-medium">
													{formatDate(
														userProgress.startDate
													)}
												</dd>
											</div>
										)}
										{userProgress?.lastAccessed && (
											<div>
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Dernier accès
												</dt>
												<dd className="font-medium">
													{formatDate(
														userProgress.lastAccessed
													)}
												</dd>
											</div>
										)}
										{course?.completedDate && (
											<div>
												<dt className="text-sm text-gray-500 dark:text-gray-400">
													Complété le
												</dt>
												<dd className="font-medium">
													{formatDate(
														course.completedDate
													)}
												</dd>
											</div>
										)}
									</dl>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Performance</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="text-center">
											<div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
												<span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
													{userProgress?.totalScore ||
														0}
												</span>
											</div>
											<h3 className="text-lg font-medium">
												Score total
											</h3>
										</div>

										<div className="grid grid-cols-2 gap-4 mt-4">
											<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
												<div className="text-xl font-bold text-gray-800 dark:text-gray-200">
													{userProgress?.completedModules ||
														0}
													/
													{userProgress?.totalModules ||
														0}
												</div>
												<div className="text-sm text-gray-500 dark:text-gray-400">
													Modules complétés
												</div>
											</div>
											<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
												<div className="text-xl font-bold text-gray-800 dark:text-gray-200">
													{userProgress?.progress ||
														0}
													%
												</div>
												<div className="text-sm text-gray-500 dark:text-gray-400">
													Progression
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</TabsContent>

				<TabsContent value="training">
					<Card className="mb-8">
						<CardHeader>
							<CardTitle>Environnement de formation 3D</CardTitle>
							<CardDescription>
								Naviguez dans l'environnement virtuel pour
								apprendre et interagir avec les différents
								éléments
							</CardDescription>
						</CardHeader>
						<CardContent>
							<UnityBuild
								ref={unityBuildRef}
								courseId={courseId}
								containerName={containerName}
								onQuestionnaireRequest={
									handleQuestionnaireRequest
								}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Instructions</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
								<li>
									Utilisez les touches{" "}
									<strong>W, A, S, D</strong> ou les{" "}
									<strong>flèches directionnelles</strong>{" "}
									pour vous déplacer
								</li>
								<li>
									Maintenez <strong>Shift</strong> pour courir
								</li>
								<li>
									Utilisez la <strong>souris</strong> pour
									regarder autour de vous
								</li>
								<li>
									Appuyez sur <strong>E</strong> ou{" "}
									<strong>clic gauche</strong> pour interagir
									avec les objets
								</li>
								<li>
									Appuyez sur <strong>F</strong> pour
									activer/désactiver la lampe torche si
									disponible
								</li>
								<li>
									Appuyez sur <strong>Esc</strong> pour
									accéder au menu
								</li>
							</ul>

							<div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 p-4 rounded-lg mt-6 flex items-start">
								<Info className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
								<div>
									<p className="font-semibold mb-1">
										Objectifs de la formation :
									</p>
									<p className="text-sm">
										Explorez l'environnement et interagissez
										avec les objets pour découvrir les
										différents scénarios de formation. Des
										questionnaires apparaîtront pour tester
										vos connaissances. Complétez tous les
										modules pour terminer la formation.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Ce bloc sera remplacé par un vrai composant de questionnaire */}
					{showQuestionnaire && (
						<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
							<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full">
								<h2 className="text-xl font-bold mb-4">
									Questionnaire:{" "}
									{currentScenario?.title || "Scénario"}
								</h2>
								<p className="mb-6">
									Ce questionnaire simulé serait normalement
									remplacé par votre composant de
									questionnaire réel.
								</p>
								<div className="flex justify-end space-x-3">
									<Button
										variant="outline"
										onClick={() =>
											handleScenarioComplete(
												"scenario-1",
												false,
												0
											)
										}
									>
										Échec
									</Button>
									<Button
										onClick={() =>
											handleScenarioComplete(
												"scenario-1",
												true,
												85
											)
										}
									>
										Réussite (85%)
									</Button>
								</div>
							</div>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
