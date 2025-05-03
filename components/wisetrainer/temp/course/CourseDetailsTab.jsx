//components/wisetrainer/course/CourseDetailsTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Calendar, Play } from "lucide-react";

export default function CourseDetailsTab({
	course,
	userProgress,
	onModuleSelect,
	onSwitchTab,
}) {
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString(undefined, {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Fonction pour gérer le clic sur les boutons "Lancer la formation"
	const handleLaunchTraining = () => {
		// Appeler la fonction qui change l'onglet actif
		onSwitchTab("training");
	};

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				<div className="md:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Modules de formation</CardTitle>
							<CardDescription>
								Progression dans les différents modules du cours
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
													module.completed &&
													module.score >= 50
														? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
														: module.completed &&
														  module.score < 50
														? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
														: "bg-gray-100 text-gray-400 dark:bg-gray-800"
												}`}
											>
												{module.completed ? (
													module.score >= 50 ? (
														<CheckCircle className="w-5 h-5" />
													) : (
														<XCircle className="w-5 h-5" />
													)
												) : (
													<span>{index + 1}</span>
												)}
											</div>
											<div className="flex-1 group">
												<h3 className="text-lg font-medium mb-1 flex items-center">
													<span>{module.title}</span>
													{module.completed && (
														<span
															className={`ml-2 text-sm px-2 py-0.5 rounded-full ${
																module.score >=
																50
																	? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
																	: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
															}`}
														>
															{module.score}%
														</span>
													)}
												</h3>
												<p className="text-gray-600 dark:text-gray-400 text-sm">
													{module.description}
												</p>
											</div>
										</div>
										{index < course.modules.length - 1 && (
											<div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 h-8"></div>
										)}
									</div>
								))}
						</CardContent>
					</Card>

					{/* Bouton en dessous de la liste des modules */}
					<div className="mt-4 flex justify-center">
						<Button
							className="bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light text-white flex items-center gap-2"
							onClick={handleLaunchTraining}
						>
							<Play className="w-4 h-4" />
							Commencer
						</Button>
					</div>
				</div>

				<div>
					<CourseInfoCard
						course={course}
						userProgress={userProgress}
						formatDate={formatDate}
					/>
					<CoursePerformanceCard
						course={course}
						userProgress={userProgress}
					/>
				</div>
			</div>
		</>
	);
}

function CourseInfoCard({ course, userProgress, formatDate }) {
	return (
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
							{course?.author || "WiseTwin"}
						</dd>
					</div>
					{userProgress?.startDate && (
						<div>
							<dt className="text-sm text-gray-500 dark:text-gray-400">
								Commencé le
							</dt>
							<dd className="font-medium">
								{formatDate(userProgress.startDate)}
							</dd>
						</div>
					)}
					{userProgress?.lastAccessed && (
						<div>
							<dt className="text-sm text-gray-500 dark:text-gray-400">
								Dernier accès
							</dt>
							<dd className="font-medium">
								{formatDate(userProgress.lastAccessed)}
							</dd>
						</div>
					)}
					{userProgress?.completedAt && (
						<div>
							<dt className="text-sm text-gray-500 dark:text-gray-400">
								Complété le
							</dt>
							<dd className="font-medium">
								{formatDate(userProgress.completedAt)}
							</dd>
						</div>
					)}
				</dl>
			</CardContent>
		</Card>
	);
}

function CoursePerformanceCard({ course, userProgress }) {
	// Calculer le score moyen sans décimales
	const averageScore = () => {
		if (!course?.modules) return 0;

		const completedModules = course.modules.filter((m) => m.completed);
		if (completedModules.length === 0) return 0;

		const totalScore = completedModules.reduce(
			(sum, module) => sum + (module.score || 0),
			0
		);
		return Math.round(totalScore / completedModules.length);
	};

	// Obtenir la couleur du score moyen
	const getScoreColorClass = (score) => {
		if (score >= 70) return "text-blue-600 dark:text-blue-300";
		if (score >= 50) return "text-green-600 dark:text-green-300";
		return "text-red-600 dark:text-red-300";
	};

	const score = averageScore();

	return (
		<Card>
			<CardHeader>
				<CardTitle>Performance</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="text-center">
						<div
							className={`inline-flex items-center justify-center h-24 w-24 rounded-full ${
								score >= 70
									? "bg-blue-100 dark:bg-blue-900"
									: score >= 50
									? "bg-green-100 dark:bg-green-900"
									: "bg-red-100 dark:bg-red-900"
							} mb-4`}
						>
							<span
								className={`text-2xl font-bold ${getScoreColorClass(
									score
								)}`}
							>
								{score}%
							</span>
						</div>
						<h3 className="text-lg font-medium">Score moyen</h3>
					</div>

					<div className="grid grid-cols-2 gap-4 mt-4">
						<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className="text-xl font-bold text-gray-800 dark:text-gray-200">
								{userProgress?.completedModules || 0}/
								{userProgress?.totalModules || 0}
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400">
								Modules complétés
							</div>
						</div>
						<div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
							<div className="text-xl font-bold text-gray-800 dark:text-gray-200">
								{userProgress?.progress || 0}%
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400">
								Progression
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
