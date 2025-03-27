// components/wisetrainer/courses/CatalogOrganizationTab.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Building, Info, Layers, Search } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export default function CatalogOrganizationTab({
	organizations = [],
	selectedOrganizationId,
	onSelectOrganization,
	trainings = [],
	isLoading = false,
	onCourseSelect,
	onEnroll,
	onToggleInfo,
	flippedCardId,
	personalCourses = [],
	isImporting,
	containerVariants,
	itemVariants,
}) {
	// États locaux pour la recherche
	const [searchQuery, setSearchQuery] = useState("");
	const [filteredTrainings, setFilteredTrainings] = useState([]);

	// Organisation sélectionnée
	const selectedOrganization = organizations.find(
		(org) => org.id === selectedOrganizationId
	);

	// Effet pour filtrer les formations
	useEffect(() => {
		if (!trainings || trainings.length === 0) {
			setFilteredTrainings([]);
			return;
		}

		let filtered = [...trainings];

		// Appliquer le filtre de recherche
		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(training) =>
					training.name.toLowerCase().includes(query) ||
					(training.description &&
						training.description.toLowerCase().includes(query))
			);
		}

		setFilteredTrainings(filtered);
	}, [trainings, searchQuery]);

	// États d'affichage
	const isEmptySearch =
		filteredTrainings.length === 0 && searchQuery.length > 0;
	const isEmptyCatalog = trainings.length === 0;
	const showNoOrganizations = organizations.length === 0;

	// Partie du rendu pour les états vides
	const renderEmptyState = () => {
		if (isLoading) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
					<div className="w-16 h-16 border-4 border-wisetwin-blue border-t-transparent rounded-full animate-spin mb-4"></div>
					<p className="text-gray-500 dark:text-gray-400 text-center">
						Chargement des formations...
					</p>
				</div>
			);
		}

		if (showNoOrganizations) {
			return (
				<div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<Building className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucune organisation
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4 max-w-md">
						Vous n'êtes membre d'aucune organisation. Rejoignez une
						organisation pour accéder aux formations spécifiques.
					</p>
				</div>
			);
		}

		if (isEmptySearch) {
			return (
				<div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucun résultat trouvé
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4">
						Aucune formation ne correspond à votre recherche "
						{searchQuery}".
					</p>
					<Button
						variant="outline"
						onClick={() => setSearchQuery("")}
					>
						Effacer la recherche
					</Button>
				</div>
			);
		}

		if (isEmptyCatalog) {
			return (
				<div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<Layers className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucune formation disponible
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4">
						{selectedOrganization
							? `L'organisation "${selectedOrganization.name}" n'a pas encore de formations disponibles.`
							: "Cette organisation n'a pas encore de formations disponibles."}
					</p>
				</div>
			);
		}

		return null;
	};

	// Sélection d'organisation
	const handleOrganizationChange = (orgId) => {
		// Réinitialiser les filtres
		setSearchQuery("");
		// Changer l'organisation
		onSelectOrganization(orgId);
	};

	// Vérifier si un cours est déjà inscrit
	const isEnrolled = (courseId) => {
		return personalCourses.some((course) => course.id === courseId);
	};

	return (
		<div className="space-y-6">
			{/* En-tête avec titre et description */}
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
					Formations de vos organisations
				</h2>
				<p className="text-gray-600 dark:text-gray-300">
					Accédez aux formations proposées par vos organisations
				</p>
			</div>

			{/* Sélection d'organisation si plusieurs sont disponibles */}
			{organizations.length > 1 && (
				<div className="mb-6">
					<Select
						value={selectedOrganizationId}
						onValueChange={handleOrganizationChange}
					>
						<SelectTrigger className="w-[300px]">
							<SelectValue placeholder="Sélectionner une organisation" />
						</SelectTrigger>
						<SelectContent>
							{organizations.map((org) => (
								<SelectItem key={org.id} value={org.id}>
									<div className="flex items-center gap-2">
										<Building className="w-4 h-4" />
										<span>{org.name}</span>
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}

			{showNoOrganizations ||
			isEmptyCatalog ||
			isEmptySearch ||
			isLoading ? (
				renderEmptyState()
			) : (
				<>
					{/* Barre de recherche */}
					<div className="flex flex-col sm:flex-row gap-4 mb-6">
						<div className="relative flex-grow">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Rechercher une formation..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Liste des formations */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 gap-8" // Augmenter l'espace entre les cartes
					>
						{filteredTrainings.map((course) => {
							const isAlreadyEnrolled = isEnrolled(course.id);
							const isFlipped = flippedCardId === course.id;

							return (
								<motion.div
									key={course.id}
									variants={itemVariants}
								>
									<Card
										className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
										noPaddingTop
									>
										{/* Image du cours couvrant toute la largeur */}
										{!isFlipped && (
											<div className="relative w-full h-52 overflow-hidden rounded-t-lg">
												<Image
													src={
														course.imageUrl ||
														WISETRAINER_CONFIG.DEFAULT_IMAGE
													}
													alt={course.name}
													fill
													className="object-cover"
													onError={(e) => {
														e.target.src =
															WISETRAINER_CONFIG.DEFAULT_IMAGE;
													}}
												/>
												{/* Badge de difficulté superposé sur l'image */}
												<div className="absolute top-3 right-3">
													<Badge
														variant="outline"
														className="bg-white/90 dark:bg-black/70 text-blue-700 dark:text-blue-200 font-medium"
													>
														{course.difficulty ||
															"Intermédiaire"}
													</Badge>
												</div>

												{/* Badge de l'organisation */}
												<div className="absolute top-3 left-3">
													<Badge className="bg-wisetwin-blue text-white">
														<Building className="w-3 h-3 mr-1" />
														{selectedOrganization
															? selectedOrganization.name
															: "Organisation"}
													</Badge>
												</div>
											</div>
										)}

										{isFlipped ? (
											<div className="flex-grow pt-6">
												<CardHeader>
													<div className="flex items-center justify-between">
														<CardTitle className="text-xl">
															{course.name}
														</CardTitle>
														<Badge
															variant="outline"
															className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
														>
															{course.difficulty ||
																"Intermédiaire"}
														</Badge>
													</div>
													<CardDescription className="flex items-center gap-1">
														<Building className="w-4 h-4" />
														{selectedOrganization
															? selectedOrganization.name
															: "Organisation"}
													</CardDescription>
												</CardHeader>

												<CardContent className="flex-grow">
													<div className="space-y-4">
														<div>
															<h4 className="font-semibold text-md mb-2 flex items-center gap-1">
																À propos de
																cette formation
															</h4>
															<p className="text-sm text-gray-600 dark:text-gray-300">
																{course.description ||
																	`Formation interactive sur ${course.name.toLowerCase()}`}
															</p>
														</div>

														<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
															<h4 className="font-semibold text-md mb-2">
																Informations
																complémentaires:
															</h4>
															<ul className="space-y-2 text-sm">
																<li className="flex items-center">
																	<span className="text-gray-600 dark:text-gray-400 w-32">
																		Organisation:
																	</span>
																	<span className="font-medium">
																		{selectedOrganization
																			? selectedOrganization.name
																			: "Organisation"}
																	</span>
																</li>
																<li className="flex items-center">
																	<span className="text-gray-600 dark:text-gray-400 w-32">
																		Difficulté:
																	</span>
																	<span className="font-medium">
																		{course.difficulty ||
																			"Intermédiaire"}
																	</span>
																</li>
																<li className="flex items-center">
																	<span className="text-gray-600 dark:text-gray-400 w-32">
																		Durée:
																	</span>
																	<span className="font-medium">
																		{course.duration ||
																			"30 min"}
																	</span>
																</li>
																<li className="flex items-center">
																	<span className="text-gray-600 dark:text-gray-400 w-32">
																		Catégorie:
																	</span>
																	<span className="font-medium">
																		{course.category ||
																			"Formation spécifique"}
																	</span>
																</li>
															</ul>
														</div>
													</div>
												</CardContent>
											</div>
										) : (
											<>
												<CardHeader>
													<CardTitle className="text-xl">
														{course.name}
													</CardTitle>
													<CardDescription className="flex items-center gap-1">
														<Building className="w-4 h-4" />
														{selectedOrganization
															? selectedOrganization.name
															: "Organisation"}
													</CardDescription>
												</CardHeader>

												<CardContent className="flex-grow">
													<p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
														{course.description ||
															`Formation interactive sur ${course.name.toLowerCase()}`}
													</p>

													<div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
														<span className="font-medium">
															{course.duration ||
																"30 min"}
														</span>
														<span>•</span>
														<span>
															{course.category ||
																"Formation spécifique"}
														</span>
													</div>
												</CardContent>
											</>
										)}

										<CardFooter className="flex gap-2 mt-auto pt-2">
											<Button
												className={`flex-1 ${
													isFlipped
														? "bg-wisetwin-blue hover:bg-wisetwin-blue-light"
														: "bg-wisetwin-blue hover:bg-wisetwin-blue-light"
												}`}
												onClick={() =>
													isAlreadyEnrolled
														? onCourseSelect(course)
														: onEnroll(course)
												}
												disabled={
													isImporting === course.id
												}
											>
												{isImporting === course.id
													? "Inscription..."
													: isAlreadyEnrolled
													? "Accéder"
													: "S'inscrire"}
											</Button>
											<Button
												className="flex-1"
												variant="outline"
												onClick={(e) => {
													e.preventDefault();
													onToggleInfo(course.id);
												}}
											>
												<Info className="h-4 w-4 mr-1" />
												{isFlipped
													? "Moins d'infos"
													: "Plus d'infos"}
											</Button>
										</CardFooter>
									</Card>
								</motion.div>
							);
						})}
					</motion.div>
				</>
			)}
		</div>
	);
}
