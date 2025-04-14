//components/overview/ActivityHistoryTab.jsx (partie corrigée)
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/contexts/DashboardContext";
import {
	BookOpen,
	CheckCircle,
	Calendar,
	Award,
	Clock,
	Filter,
	ChevronDown,
	User,
} from "lucide-react";

export default function ActivityHistoryTab() {
	// S'assurer que activities est toujours un tableau, même si undefined est passé
	const { activities = [], isLoading } = useDashboard();
	const [filter, setFilter] = useState("all");
	const [expandedDays, setExpandedDays] = useState({});
	const [showMoreCount, setShowMoreCount] = useState(7); // Nombre d'activités à afficher initialement

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.4 },
		},
	};

	// Vérifier que activities est un tableau avant d'appliquer filter
	const filteredActivities = Array.isArray(activities)
		? activities.filter((activity) => {
				if (filter === "all") return true;
				if (filter === "trainings")
					return activity.type && activity.type.includes("training");
				if (filter === "modules")
					return activity.type && activity.type.includes("module");
				if (filter === "assessments")
					return (
						(activity.type && activity.type.includes("quiz")) ||
						(activity.type && activity.type.includes("assessment"))
					);
				return true;
		  })
		: [];

	// Grouper les activités par jour
	const groupActivitiesByDay = (activities) => {
		const groups = {};

		if (!Array.isArray(activities)) return [];

		activities.forEach((activity) => {
			if (!activity || !activity.timestamp) return;

			const date = new Date(activity.timestamp);
			const dateKey = date.toDateString();

			if (!groups[dateKey]) {
				groups[dateKey] = {
					date,
					items: [],
				};
			}

			groups[dateKey].items.push(activity);
		});

		// Convertir en tableau et trier par date décroissante
		return Object.values(groups).sort((a, b) => b.date - a.date);
	};

	const groupedActivities = groupActivitiesByDay(filteredActivities);

	// Toggle pour développer/réduire un jour
	const toggleDayExpanded = (dateKey) => {
		setExpandedDays({
			...expandedDays,
			[dateKey]: !expandedDays[dateKey],
		});
	};

	// Charger plus d'activités
	const handleLoadMore = () => {
		setShowMoreCount((prevCount) => prevCount + 10);
	};

	// Formatter le titre du jour
	const formatDayTitle = (date) => {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) {
			return "Aujourd'hui";
		} else if (date.toDateString() === yesterday.toDateString()) {
			return "Hier";
		}

		return date.toLocaleDateString("fr-FR", {
			weekday: "long",
			day: "numeric",
			month: "long",
		});
	};

	// Formatage de date et heure
	const formatDateTime = (dateString) => {
		const date = new Date(dateString);

		const today = new Date();
		const yesterday = new Date(today);
		//components/overview/ActivityHistoryTab.jsx (suite)
		yesterday.setDate(yesterday.getDate() - 1);

		// Vérifier si c'est aujourd'hui ou hier
		if (date.toDateString() === today.toDateString()) {
			return `Aujourd'hui à ${date
				.getHours()
				.toString()
				.padStart(2, "0")}:${date
				.getMinutes()
				.toString()
				.padStart(2, "0")}`;
		} else if (date.toDateString() === yesterday.toDateString()) {
			return `Hier à ${date.getHours().toString().padStart(2, "0")}:${date
				.getMinutes()
				.toString()
				.padStart(2, "0")}`;
		}

		// Sinon afficher la date complète
		return date.toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Configuration de l'icône et de la couleur en fonction du type d'activité
	// Configuration de l'icône et de la couleur en fonction du type d'activité
	const getIconConfig = (type) => {
		if (!type)
			return {
				icon: <User className="h-5 w-5 text-gray-500" />,
				bgColor: "bg-gray-100",
				borderColor: "border-gray-200",
			};

		const configs = {
			training_started: {
				icon: <BookOpen className="h-5 w-5 text-blue-500" />,
				bgColor: "bg-blue-100",
				borderColor: "border-blue-200",
			},
			// Le reste de la config...
		};

		return (
			configs[type] || {
				icon: <User className="h-5 w-5 text-gray-500" />,
				bgColor: "bg-gray-100",
				borderColor: "border-gray-200",
			}
		);
	};

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="space-y-6"
		>
			<Card>
				<CardHeader className="pb-3">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
						<CardTitle className="flex items-center text-lg">
							<Calendar className="h-5 w-5 mr-2" />
							Historique d'activités
						</CardTitle>

						<div className="mt-3 sm:mt-0 flex items-center">
							<Filter className="h-4 w-4 mr-2 text-muted-foreground" />
							<select
								className="appearance-none block px-3 py-1.5 pr-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-wisetwin-blue focus:border-wisetwin-blue dark:bg-gray-700"
								value={filter}
								onChange={(e) => setFilter(e.target.value)}
							>
								<option value="all">
									Toutes les activités
								</option>
								<option value="trainings">Formations</option>
								<option value="modules">Modules</option>
								<option value="assessments">Évaluations</option>
							</select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-6">
							{[1, 2, 3].map((i) => (
								<div key={i} className="animate-pulse">
									<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
									<div className="space-y-4">
										{[1, 2].map((j) => (
											<div key={j} className="flex gap-4">
												<div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
												<div className="flex-1">
													<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
													<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					) : filteredActivities.length === 0 ? (
						<div className="text-center py-12">
							<Calendar className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
							<p className="text-muted-foreground">
								Aucune activité trouvée pour cette période
							</p>
						</div>
					) : (
						<div className="flow-root">
							{groupedActivities
								.slice(0, showMoreCount)
								.map((group, groupIndex) => (
									<div
										key={group.date.toString()}
										className="mb-8"
									>
										<h4 className="text-sm font-semibold mb-4 text-muted-foreground flex items-center">
											{formatDayTitle(group.date)}
											<span className="ml-2 text-xs font-normal">
												({group.items.length} activité
												{group.items.length > 1
													? "s"
													: ""}
												)
											</span>
											<Button
												variant="ghost"
												size="sm"
												className="ml-auto h-6 px-1"
												onClick={() =>
													toggleDayExpanded(
														group.date.toString()
													)
												}
											>
												<ChevronDown
													className={`h-4 w-4 transition-transform ${
														expandedDays[
															group.date.toString()
														]
															? "rotate-180"
															: ""
													}`}
												/>
											</Button>
										</h4>
										<div
											className={
												expandedDays[
													group.date.toString()
												]
													? "hidden"
													: ""
											}
										>
											{group.items
												.slice(0, 5)
												.map((activity, index) => {
													const iconConfig =
														getIconConfig(
															activity.type
														);

													return (
														<div
															key={activity.id}
															className="relative pb-8"
														>
															{/* Ligne verticale connectant les éléments */}
															<div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

															<div className="relative flex items-start space-x-4">
																{/* Icône */}
																<div
																	className={`relative flex h-10 w-10 items-center justify-center rounded-full ${iconConfig.bgColor} border ${iconConfig.borderColor} z-10`}
																>
																	{
																		iconConfig.icon
																	}
																</div>

																{/* Contenu */}
																<div className="flex-1 pt-0.5">
																	<h3 className="text-sm font-medium">
																		{
																			activity.title
																		}
																	</h3>
																	<p className="mt-1 text-sm text-muted-foreground">
																		{
																			activity.description
																		}
																	</p>
																	<div className="mt-2 flex items-center space-x-2">
																		<Clock className="h-3 w-3 text-muted-foreground" />
																		<span className="text-xs text-muted-foreground">
																			{formatDateTime(
																				activity.timestamp
																			)}
																		</span>

																		{activity.entityType && (
																			<>
																				<span className="text-muted-foreground">
																					•
																				</span>
																				<Badge
																					variant="outline"
																					className="text-xs py-0 px-2"
																				>
																					{activity.entityType ===
																					"training"
																						? "Formation"
																						: activity.entityType ===
																						  "module"
																						? "Module"
																						: activity.entityType ===
																						  "quiz"
																						? "Quiz"
																						: "Session"}
																				</Badge>
																			</>
																		)}
																	</div>
																</div>
															</div>
														</div>
													);
												})}
											{group.items.length > 5 &&
												!expandedDays[
													group.date.toString()
												] && (
													<div className="text-center pt-4">
														<Button
															variant="outline"
															size="sm"
															onClick={() =>
																toggleDayExpanded(
																	group.date.toString()
																)
															}
														>
															Voir{" "}
															{group.items
																.length -
																5}{" "}
															de plus
														</Button>
													</div>
												)}
										</div>
										<div
											className={
												!expandedDays[
													group.date.toString()
												]
													? "hidden"
													: ""
											}
										>
											{group.items.map(
												(activity, index) => {
													const iconConfig =
														getIconConfig(
															activity.type
														);

													return (
														<div
															key={activity.id}
															className="relative pb-8"
														>
															{/* Ligne verticale connectant les éléments */}
															<div className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

															<div className="relative flex items-start space-x-4">
																{/* Icône */}
																<div
																	className={`relative flex h-10 w-10 items-center justify-center rounded-full ${iconConfig.bgColor} border ${iconConfig.borderColor} z-10`}
																>
																	{
																		iconConfig.icon
																	}
																</div>

																{/* Contenu */}
																<div className="flex-1 pt-0.5">
																	<h3 className="text-sm font-medium">
																		{
																			activity.title
																		}
																	</h3>
																	<p className="mt-1 text-sm text-muted-foreground">
																		{
																			activity.description
																		}
																	</p>
																	<div className="mt-2 flex items-center space-x-2">
																		<Clock className="h-3 w-3 text-muted-foreground" />
																		<span className="text-xs text-muted-foreground">
																			{formatDateTime(
																				activity.timestamp
																			)}
																		</span>

																		{activity.entityType && (
																			<>
																				<span className="text-muted-foreground">
																					•
																				</span>
																				<Badge
																					variant="outline"
																					className="text-xs py-0 px-2"
																				>
																					{activity.entityType ===
																					"training"
																						? "Formation"
																						: activity.entityType ===
																						  "module"
																						? "Module"
																						: activity.entityType ===
																						  "quiz"
																						? "Quiz"
																						: "Session"}
																				</Badge>
																			</>
																		)}
																	</div>
																</div>
															</div>
														</div>
													);
												}
											)}
										</div>
									</div>
								))}

							{/* Bouton pour charger plus d'activités */}
							{groupedActivities.length > showMoreCount && (
								<div className="text-center pt-6">
									<Button
										variant="outline"
										onClick={handleLoadMore}
									>
										Charger plus d'activités
									</Button>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
