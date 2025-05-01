// components/organizations/organization/dashboard/UserDetailsModal.jsx
import React, { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
	User,
	Mail,
	Calendar,
	Clock,
	BookOpen,
	Award,
	GraduationCap,
	CheckCircle,
	BarChart3,
	Activity,
} from "lucide-react";

// Composant pour afficher les détails complets d'un utilisateur
export default function UserDetailsModal({ user, isOpen, onClose, trainings }) {
	const [activeTab, setActiveTab] = useState("overview");

	if (!user) return null;

	// Formatage de date pour l'affichage
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	// Formatage de temps pour l'affichage
	const formatTime = (hours) => {
		if (hours < 1) {
			const minutes = Math.round(hours * 60);
			return `${minutes} minutes`;
		}
		return `${hours.toFixed(1)}h`;
	};

	// Calculer le nombre total de modules complétés
	const calculateTotalModules = () => {
		let completed = 0;
		let total = 0;

		user.trainings.forEach((userTraining) => {
			const training = trainings.find((t) => t.id === userTraining.id);
			if (training) {
				completed += userTraining.completedModules || 0;
				total += training.modules.length;
			}
		});

		return { completed, total };
	};

	const moduleStats = calculateTotalModules();

	// Calculer le score moyen global
	const calculateAverageScore = () => {
		if (!user.trainings.length) return 0;

		const scores = user.trainings.map((t) => t.score || 0);
		const sum = scores.reduce((acc, curr) => acc + curr, 0);
		return Math.round(sum / scores.length);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl flex items-center">
						<User className="mr-2 h-5 w-5" />
						Détails de l'utilisateur
					</DialogTitle>
				</DialogHeader>

				<div className="py-4">
					{/* En-tête avec informations de base de l'utilisateur */}
					<div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
						<div className="bg-wisetwin-blue text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
							{user.name.charAt(0).toUpperCase()}
						</div>
						<div className="flex-grow">
							<h2 className="text-2xl font-bold">{user.name}</h2>
							<div className="flex items-center text-muted-foreground">
								<Mail className="h-4 w-4 mr-1" />
								<span>{user.email}</span>
							</div>
							<div className="flex flex-wrap gap-2 mt-2">
								{user.tags && user.tags.length > 0 ? (
									user.tags.map((tag) => (
										<Badge
											key={tag.id}
											className="px-2 py-0.5 text-sm"
											style={{
												backgroundColor: tag.color,
												color: "#fff",
											}}
										>
											{tag.name}
										</Badge>
									))
								) : (
									<Badge
										variant="outline"
										className="text-sm"
									>
										Aucun tag
									</Badge>
								)}
							</div>
							<div className="flex items-center gap-4 mt-2">
								<Badge>{user.role}</Badge>
								<span className="text-sm flex items-center">
									<Calendar className="h-4 w-4 mr-1" />
									Inscrit le {formatDate(user.joinedAt)}
								</span>
							</div>
						</div>
						<div className="text-right">
							<div className="text-sm text-muted-foreground">
								Dernière activité
							</div>
							<div className="font-medium">
								{formatDate(user.lastActive)}
							</div>
						</div>
					</div>

					{/* Onglets pour différentes sections */}
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className="mt-6"
					>
						<TabsList className="mb-4">
							<TabsTrigger value="overview">
								<BarChart3 className="h-4 w-4 mr-2" />
								Vue d'ensemble
							</TabsTrigger>
							<TabsTrigger value="trainings">
								<GraduationCap className="h-4 w-4 mr-2" />
								Formations
							</TabsTrigger>
							<TabsTrigger value="activity">
								<Activity className="h-4 w-4 mr-2" />
								Activité
							</TabsTrigger>
						</TabsList>

						{/* Onglet d'aperçu */}
						<TabsContent value="overview">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
								{/* Statistiques principales */}
								<div>
									<Card>
										<CardHeader>
											<CardTitle className="text-base">
												Statistiques globales
											</CardTitle>
										</CardHeader>
										<CardContent className="space-y-4">
											<div className="grid grid-cols-2 gap-4">
												<div className="space-y-1">
													<div className="text-xs text-muted-foreground flex items-center">
														<Clock className="h-3 w-3 mr-1" />
														Temps de formation
													</div>
													<div className="text-xl font-bold">
														{formatTime(
															user.trainingTime
														)}
													</div>
												</div>
												<div className="space-y-1">
													<div className="text-xs text-muted-foreground flex items-center">
														<BookOpen className="h-3 w-3 mr-1" />
														Formations actives
													</div>
													<div className="text-xl font-bold">
														{user.trainings.length}
													</div>
												</div>
												<div className="space-y-1">
													<div className="text-xs text-muted-foreground flex items-center">
														<CheckCircle className="h-3 w-3 mr-1" />
														Taux de complétion
													</div>
													<div className="text-xl font-bold">
														{Math.round(
															user.trainings.reduce(
																(sum, t) =>
																	sum +
																	(t.progress ||
																		0),
																0
															) /
																(user.trainings
																	.length ||
																	1)
														)}
														%
													</div>
												</div>
												<div className="space-y-1">
													<div className="text-xs text-muted-foreground flex items-center">
														<Award className="h-3 w-3 mr-1" />
														Score moyen
													</div>
													<div className="text-xl font-bold">
														{calculateAverageScore()}
													</div>
												</div>
											</div>

											<div className="space-y-1 pt-2">
												<div className="flex justify-between text-sm">
													<span>
														Modules complétés
													</span>
													<span className="font-medium">
														{moduleStats.completed}/
														{moduleStats.total}
													</span>
												</div>
												<Progress
													value={
														moduleStats.total
															? (moduleStats.completed /
																	moduleStats.total) *
															  100
															: 0
													}
													className="h-2"
												/>
											</div>
										</CardContent>
									</Card>
								</div>

								{/* Dernières formations */}
								<div>
									<Card className="h-full">
										<CardHeader>
											<CardTitle className="text-base">
												Dernières formations
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												{user.trainings.length === 0 ? (
													<div className="text-center py-6 text-muted-foreground">
														Aucune formation en
														cours
													</div>
												) : (
													user.trainings
														.slice(0, 3)
														.map((userTraining) => {
															const trainingDetails =
																trainings.find(
																	(t) =>
																		t.id ===
																		userTraining.id
																);
															if (
																!trainingDetails
															)
																return null;

															return (
																<div
																	key={
																		userTraining.id
																	}
																	className="border-b border-border pb-3 last:border-0 last:pb-0"
																>
																	<div className="flex justify-between mb-1">
																		<div className="font-medium">
																			{
																				trainingDetails.name
																			}
																		</div>
																		<div className="text-sm">
																			{
																				userTraining.progress
																			}
																			%
																		</div>
																	</div>
																	<Progress
																		value={
																			userTraining.progress
																		}
																		className="h-1.5 mb-1"
																	/>
																	<div className="flex justify-between text-xs text-muted-foreground">
																		<span>
																			Commencé
																			le{" "}
																			{formatDate(
																				userTraining.startDate
																			)}
																		</span>
																		<Badge
																			variant="outline"
																			className="text-xs"
																		>
																			{userTraining.score
																				? `Score: ${userTraining.score}`
																				: "Non évalué"}
																		</Badge>
																	</div>
																</div>
															);
														})
												)}
											</div>
										</CardContent>
									</Card>
								</div>
							</div>
						</TabsContent>

						{/* Onglet de formations */}
						<TabsContent value="trainings">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">
										Liste des formations
									</CardTitle>
									<CardDescription>
										{user.trainings.length} formation
										{user.trainings.length > 1
											? "s"
											: ""}{" "}
										suivie
										{user.trainings.length > 1 ? "s" : ""}
									</CardDescription>
								</CardHeader>
								<CardContent>
									{user.trainings.length === 0 ? (
										<div className="text-center py-12 text-muted-foreground">
											Cet utilisateur n'a commencé aucune
											formation
										</div>
									) : (
										<div className="space-y-6">
											{user.trainings.map(
												(userTraining) => {
													const trainingDetails =
														trainings.find(
															(t) =>
																t.id ===
																userTraining.id
														);
													if (!trainingDetails)
														return null;

													// Calculer le nombre de modules complétés
													const completedModules =
														userTraining.completedModules ||
														0;
													const totalModules =
														trainingDetails.modules
															?.length || 0;

													return (
														<div
															key={
																userTraining.id
															}
															className="border border-border rounded-lg p-4"
														>
															<div className="flex justify-between items-start mb-4">
																<div>
																	<div className="font-bold text-lg">
																		{
																			trainingDetails.name
																		}
																	</div>
																	<div className="text-sm text-muted-foreground">
																		{
																			trainingDetails.description
																		}
																	</div>
																</div>
																<Badge
																	className={
																		userTraining.progress ===
																		100
																			? "bg-green-100 text-green-800"
																			: userTraining.progress >
																			  0
																			? "bg-blue-100 text-blue-800"
																			: "bg-gray-100 text-gray-800"
																	}
																>
																	{userTraining.progress ===
																	100
																		? "Terminé"
																		: userTraining.progress >
																		  0
																		? "En cours"
																		: "Non commencé"}
																</Badge>
															</div>

															<div className="space-y-2 mb-4">
																<div className="flex justify-between text-sm">
																	<span>
																		Progression
																	</span>
																	<span className="font-medium">
																		{
																			userTraining.progress
																		}
																		%
																	</span>
																</div>
																<Progress
																	value={
																		userTraining.progress
																	}
																	className="h-2"
																/>
															</div>

															<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
																<div className="space-y-1">
																	<div className="text-xs text-muted-foreground">
																		Commencé
																		le
																	</div>
																	<div className="font-medium">
																		{formatDate(
																			userTraining.startDate
																		)}
																	</div>
																</div>
																<div className="space-y-1">
																	<div className="text-xs text-muted-foreground">
																		Modules
																		complétés
																	</div>
																	<div className="font-medium">
																		{
																			completedModules
																		}
																		/
																		{
																			totalModules
																		}
																	</div>
																</div>
																<div className="space-y-1">
																	<div className="text-xs text-muted-foreground">
																		Score
																	</div>
																	<div className="font-medium">
																		{userTraining.score ||
																			"N/A"}
																	</div>
																</div>
																<div className="space-y-1">
																	<div className="text-xs text-muted-foreground">
																		Date
																		limite
																	</div>
																	<div className="font-medium">
																		{userTraining.deadline
																			? formatDate(
																					userTraining.deadline
																			  )
																			: "Aucune"}
																	</div>
																</div>
															</div>
														</div>
													);
												}
											)}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Onglet d'activité */}
						<TabsContent value="activity">
							<Card>
								<CardHeader>
									<CardTitle className="text-base">
										Historique d'activité
									</CardTitle>
									<CardDescription>
										Activités récentes de cet utilisateur
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="relative space-y-0">
										{/* Ligne verticale décorative */}
										<div className="absolute left-0 top-0 h-full w-0.5 bg-border ml-3"></div>

										{/* Activités générées dynamiquement */}
										{user.trainings.map((training, idx) => {
											const trainingDetails =
												trainings.find(
													(t) => t.id === training.id
												);
											if (!trainingDetails) return null;

											// Générer quelques événements fictifs pour l'activité
											const events = [
												{
													type: "training_started",
													date: training.startDate,
													title: "Formation démarrée",
													description: `A commencé la formation "${trainingDetails.name}"`,
												},
											];

											// Ajouter l'événement de complétion si la formation est terminée
											if (training.progress === 100) {
												// Générer une date de complétion fictive (après la date de début)
												const completionDate = new Date(
													training.startDate
												);
												completionDate.setDate(
													completionDate.getDate() +
														Math.floor(
															Math.random() * 30
														) +
														5
												);

												events.push({
													type: "training_completed",
													date: completionDate,
													title: "Formation terminée",
													description: `A terminé la formation "${
														trainingDetails.name
													}" avec un score de ${
														training.score || "N/A"
													}`,
												});
											}

											// Ajouter quelques événements de module complété
											for (
												let i = 0;
												i <
												(training.completedModules ||
													0);
												i++
											) {
												const moduleDate = new Date(
													training.startDate
												);
												moduleDate.setDate(
													moduleDate.getDate() +
														i * 2 +
														1
												);

												const moduleName =
													trainingDetails.modules &&
													trainingDetails.modules[i]
														? trainingDetails
																.modules[i].name
														: `Module ${i + 1}`;

												events.push({
													type: "module_completed",
													date: moduleDate,
													title: "Module terminé",
													description: `A terminé le module "${moduleName}" de la formation "${trainingDetails.name}"`,
												});
											}

											return events.map(
												(event, eventIdx) => (
													<div
														key={`${idx}-${eventIdx}`}
														className="relative pl-8 py-3"
													>
														<div
															className={`absolute left-0 p-1.5 rounded-full ${
																event.type ===
																"training_started"
																	? "bg-blue-100 border-2 border-blue-300"
																	: event.type ===
																	  "training_completed"
																	? "bg-green-100 border-2 border-green-300"
																	: "bg-purple-100 border-2 border-purple-300"
															}`}
															style={{
																marginLeft:
																	"0.5px",
															}}
														>
															{event.type ===
															"training_started" ? (
																<BookOpen className="h-3 w-3 text-blue-500" />
															) : event.type ===
															  "training_completed" ? (
																<CheckCircle className="h-3 w-3 text-green-500" />
															) : (
																<Award className="h-3 w-3 text-purple-500" />
															)}
														</div>
														<div className="mb-1 font-medium text-sm">
															{event.title}
														</div>
														<div className="text-sm text-muted-foreground">
															{event.description}
														</div>
														<div className="text-xs text-muted-foreground mt-1">
															{formatDate(
																event.date
															)}
														</div>
													</div>
												)
											);
										})}

										{/* Message si aucune activité */}
										{!user.trainings.length && (
											<div className="text-center py-12 text-muted-foreground">
												Aucune activité enregistrée pour
												cet utilisateur
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Fermer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
