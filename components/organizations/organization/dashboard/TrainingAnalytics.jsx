// components/organizations/organization/dashboard/TrainingAnalytics.jsx
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	BarChart,
	Users,
	Clock,
	Award,
	Calendar,
	BookOpen,
	AlertTriangle,
	CheckCircle,
	ArrowUpRight,
	ArrowDownRight,
	ChevronRight,
} from "lucide-react";

// Graphique en barres horizontales pour les modules
const ModuleBarChart = ({ modules }) => {
	// Trier les modules par taux de complétion
	const sortedModules = [...modules].sort(
		(a, b) => b.completionRate - a.completionRate
	);

	return (
		<div className="space-y-4">
			{sortedModules.map((module, index) => (
				<div key={index} className="space-y-1">
					<div className="flex justify-between text-sm mb-1">
						<div
							className="font-medium truncate pr-4"
							title={module.name}
						>
							{module.name}
						</div>
						<div className="flex items-center gap-2">
							<Users className="h-3 w-3 text-muted-foreground" />
							<span className="text-xs">
								{module.completedCount}/{module.totalUsers}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Progress
							value={module.completionRate}
							className="h-2 flex-grow"
						/>
						<span className="text-xs font-medium w-9 text-right">
							{module.completionRate}%
						</span>
					</div>
				</div>
			))}
		</div>
	);
};

// Carte qui montre les performances globales d'une formation
const TrainingPerformanceCard = ({ training, onSelect }) => {
	const getCompletionColor = (rate) => {
		if (rate >= 80) return "text-green-500";
		if (rate >= 50) return "text-amber-500";
		return "text-red-500";
	};

	return (
		<Card
			className="hover:shadow-md transition-shadow cursor-pointer"
			onClick={() => onSelect(training.id)}
		>
			<CardHeader className="pb-2">
				<div className="flex justify-between items-start">
					<CardTitle className="text-base">{training.name}</CardTitle>
					<Badge
						className={
							training.isActive
								? "bg-green-100 text-green-800"
								: "bg-gray-100 text-gray-800"
						}
					>
						{training.isActive ? "Actif" : "Inactif"}
					</Badge>
				</div>
				<CardDescription className="line-clamp-2 text-xs">
					{training.description}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-2 text-center">
						<div className="space-y-1">
							<div className="text-xs text-muted-foreground flex justify-center">
								<Users className="h-3 w-3 mr-1" />
								Utilisateurs
							</div>
							<div className="text-sm font-bold">
								{training.enrolledUsers}
							</div>
						</div>
						<div className="space-y-1">
							<div className="text-xs text-muted-foreground flex justify-center">
								<CheckCircle className="h-3 w-3 mr-1" />
								Complétion
							</div>
							<div
								className={`text-sm font-bold ${getCompletionColor(
									training.completionRate
								)}`}
							>
								{training.completionRate}%
							</div>
						</div>
						<div className="space-y-1">
							<div className="text-xs text-muted-foreground flex justify-center">
								<Award className="h-3 w-3 mr-1" />
								Score
							</div>
							<div className="text-sm font-bold">
								{training.averageScore}
							</div>
						</div>
					</div>

					<Progress
						value={training.completionRate}
						className="h-1.5"
					/>

					<div className="flex justify-between items-center pt-2 text-xs text-muted-foreground">
						<div className="flex items-center">
							<Calendar className="h-3 w-3 mr-1" />
							{new Date(training.updatedAt).toLocaleDateString(
								"fr-FR",
								{
									day: "numeric",
									month: "short",
									year: "numeric",
								}
							)}
						</div>
						<div className="flex items-center">
							<ChevronRight className="h-4 w-4 text-wisetwin-blue" />
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

// Composant principal
export default function TrainingAnalytics({ trainings, users }) {
	const [selectedTrainingId, setSelectedTrainingId] = useState(
		trainings[0]?.id || null
	);
	const [analysisView, setAnalysisView] = useState("overview");

	// Trouver la formation sélectionnée
	const selectedTraining =
		trainings.find((t) => t.id === selectedTrainingId) || trainings[0];

	// Formatage des dates pour l'affichage
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	// Retourner les utilisateurs inscrits à la formation sélectionnée
	const getEnrolledUsers = () => {
		if (!selectedTraining) return [];

		return users
			.filter((user) =>
				user.trainings.some((t) => t.id === selectedTraining.id)
			)
			.sort((a, b) => {
				// Trier par progression décroissante
				const progressA =
					a.trainings.find((t) => t.id === selectedTraining.id)
						?.progress || 0;
				const progressB =
					b.trainings.find((t) => t.id === selectedTraining.id)
						?.progress || 0;
				return progressB - progressA;
			});
	};

	return (
		<div className="space-y-6">
			{selectedTraining ? (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Liste des formations */}
					<div className="lg:col-span-1 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg flex items-center">
									<BookOpen className="h-5 w-5 mr-2" />
									Formations
								</CardTitle>
							</CardHeader>
							<CardContent className="max-h-[600px] overflow-y-auto pr-2">
								<div className="space-y-4">
									{trainings.map((training) => (
										<TrainingPerformanceCard
											key={training.id}
											training={training}
											onSelect={setSelectedTrainingId}
										/>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Détails de la formation sélectionnée */}
					<div className="lg:col-span-2 space-y-6">
						<Card>
							<CardHeader className="pb-2">
								<div className="flex justify-between items-center">
									<div>
										<CardTitle className="text-xl flex items-center">
											{selectedTraining.name}
										</CardTitle>
										<CardDescription>
											{selectedTraining.description}
										</CardDescription>
									</div>
									<Badge
										className={
											selectedTraining.isActive
												? "bg-green-100 text-green-800"
												: "bg-gray-100 text-gray-800"
										}
									>
										{selectedTraining.isActive
											? "Actif"
											: "Inactif"}
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<Tabs
									defaultValue="overview"
									onValueChange={setAnalysisView}
									value={analysisView}
								>
									<TabsList className="mb-4">
										<TabsTrigger value="overview">
											Vue d'ensemble
										</TabsTrigger>
										<TabsTrigger value="modules">
											Modules
										</TabsTrigger>
										<TabsTrigger value="users">
											Utilisateurs
										</TabsTrigger>
									</TabsList>

									<TabsContent value="overview">
										<div className="space-y-6">
											{/* Statistiques de la formation */}
											<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
												<Card>
													<CardContent className="pt-6">
														<div className="flex flex-col items-center text-center">
															<Users className="h-8 w-8 text-wisetwin-blue mb-2" />
															<div className="text-sm font-medium mb-1">
																Utilisateurs
																inscrits
															</div>
															<div className="text-2xl font-bold">
																{
																	selectedTraining.enrolledUsers
																}
															</div>
														</div>
													</CardContent>
												</Card>

												<Card>
													<CardContent className="pt-6">
														<div className="flex flex-col items-center text-center">
															<CheckCircle className="h-8 w-8 text-wisetwin-blue mb-2" />
															<div className="text-sm font-medium mb-1">
																Taux de
																complétion
															</div>
															<div className="text-2xl font-bold">
																{
																	selectedTraining.completionRate
																}
																%
															</div>
														</div>
													</CardContent>
												</Card>

												<Card>
													<CardContent className="pt-6">
														<div className="flex flex-col items-center text-center">
															<Award className="h-8 w-8 text-wisetwin-blue mb-2" />
															<div className="text-sm font-medium mb-1">
																Score moyen
															</div>
															<div className="text-2xl font-bold">
																{
																	selectedTraining.averageScore
																}
															</div>
														</div>
													</CardContent>
												</Card>

												<Card>
													<CardContent className="pt-6">
														<div className="flex flex-col items-center text-center">
															<Clock className="h-8 w-8 text-wisetwin-blue mb-2" />
															<div className="text-sm font-medium mb-1">
																Temps moyen
															</div>
															<div className="text-2xl font-bold">
																{
																	selectedTraining.averageTimeSpent
																}
																h
															</div>
														</div>
													</CardContent>
												</Card>
											</div>

											{/* Points problématiques */}
											{selectedTraining.problemAreas &&
												selectedTraining.problemAreas
													.length > 0 && (
													<Card>
														<CardHeader className="pb-2">
															<CardTitle className="text-sm flex items-center text-amber-500">
																<AlertTriangle className="h-4 w-4 mr-2" />
																Points
																d'attention
															</CardTitle>
														</CardHeader>
														<CardContent>
															<ul className="space-y-2">
																{selectedTraining.problemAreas.map(
																	(
																		problem,
																		index
																	) => (
																		<li
																			key={
																				index
																			}
																			className="flex items-start"
																		>
																			<AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
																			<span className="text-sm">
																				{
																					problem
																				}
																			</span>
																		</li>
																	)
																)}
															</ul>
														</CardContent>
													</Card>
												)}
										</div>
									</TabsContent>

									<TabsContent value="modules">
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm">
													Progression par module
												</CardTitle>
											</CardHeader>
											<CardContent>
												<ModuleBarChart
													modules={
														selectedTraining.modules
													}
												/>
											</CardContent>
										</Card>
									</TabsContent>

									<TabsContent value="users">
										<Card>
											<CardHeader className="pb-2">
												<CardTitle className="text-sm flex items-center">
													<Users className="h-4 w-4 mr-2" />
													Utilisateurs inscrits
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													{getEnrolledUsers().map(
														(user, index) => {
															const trainingData =
																user.trainings.find(
																	(t) =>
																		t.id ===
																		selectedTraining.id
																);
															if (!trainingData)
																return null;

															return (
																<div
																	key={
																		user.id
																	}
																	className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800"
																>
																	<div className="flex items-center">
																		<div className="mr-3 text-sm font-medium text-muted-foreground w-6 text-center">
																			{index +
																				1}
																		</div>
																		<div>
																			<div className="font-medium">
																				{
																					user.name
																				}
																			</div>
																			<div className="text-xs text-muted-foreground">
																				{
																					user.email
																				}
																			</div>
																		</div>
																	</div>
																	<div className="flex items-center gap-3">
																		<div className="text-sm text-right mr-4">
																			<div>
																				<span className="font-medium">
																					{trainingData.score ||
																						0}
																				</span>{" "}
																				<span className="text-muted-foreground text-xs">
																					score
																				</span>
																			</div>
																			<div className="text-xs text-muted-foreground">
																				{trainingData.completedModules ||
																					0}
																				/
																				{
																					selectedTraining
																						.modules
																						.length
																				}{" "}
																				modules
																			</div>
																		</div>
																		<div className="w-24">
																			<Progress
																				value={
																					trainingData.progress
																				}
																				className="h-2"
																			/>
																			<div className="text-xs text-right mt-1 font-medium">
																				{
																					trainingData.progress
																				}
																				%
																			</div>
																		</div>
																	</div>
																</div>
															);
														}
													)}
												</div>
											</CardContent>
										</Card>
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					</div>
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						Aucune formation disponible
					</p>
				</div>
			)}
		</div>
	);
}
