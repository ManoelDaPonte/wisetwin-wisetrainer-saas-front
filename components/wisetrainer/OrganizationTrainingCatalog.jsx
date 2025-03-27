// components/wisetrainer/OrganizationTrainingCatalog.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
	Building,
	Users,
	Tag,
	Clock,
	BarChart,
	Filter,
	Search,
	Info,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/hooks/useToast";
import { useOrganization } from "@/lib/hooks/useOrganization";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export default function OrganizationTrainingCatalog({ organizationId }) {
	const router = useRouter();
	const { toast } = useToast();
	const {
		currentOrganization,
		userRole,
		trainings,
		groups,
		isLoading,
		isAdmin,
		loadOrganization,
		loadGroups,
		loadUserTrainings,
	} = useOrganization();

	// États locaux pour les filtres et la recherche
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [groupFilter, setGroupFilter] = useState("all");
	const [filteredTrainings, setFilteredTrainings] = useState([]);

	// Effet pour charger les données initiales
	useEffect(() => {
		if (organizationId) {
			loadOrganization(organizationId);
			loadGroups(organizationId);
			loadUserTrainings(organizationId);
		}
	}, [organizationId, loadOrganization, loadGroups, loadUserTrainings]);

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
					training.description.toLowerCase().includes(query)
			);
		}

		// Appliquer le filtre de catégorie
		if (categoryFilter !== "all") {
			filtered = filtered.filter(
				(training) => training.category === categoryFilter
			);
		}

		// Appliquer le filtre de groupe
		if (groupFilter !== "all") {
			filtered = filtered.filter((training) =>
				training.assignedGroups.some(
					(group) => group.id === groupFilter
				)
			);
		}

		setFilteredTrainings(filtered);
	}, [trainings, searchQuery, categoryFilter, groupFilter]);

	// Récupérer toutes les catégories disponibles
	const categories =
		trainings && trainings.length > 0
			? [...new Set(trainings.map((t) => t.category))]
			: [];

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

	// Accéder à une formation
	const handleAccessTraining = (training) => {
		router.push(`/wisetrainer/${training.id}`);
	};

	// États d'affichage
	const isEmptySearch =
		filteredTrainings.length === 0 && searchQuery.length > 0;
	const isEmptyFilters =
		filteredTrainings.length === 0 &&
		(categoryFilter !== "all" || groupFilter !== "all");
	const isEmptyCatalog = trainings.length === 0;

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

		if (isEmptySearch) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
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

		if (isEmptyFilters) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
					<Filter className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucun résultat avec ces filtres
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4">
						Essayez de modifier vos filtres pour voir plus de
						formations.
					</p>
					<Button
						variant="outline"
						onClick={() => {
							setCategoryFilter("all");
							setGroupFilter("all");
						}}
					>
						Réinitialiser les filtres
					</Button>
				</div>
			);
		}

		if (isEmptyCatalog) {
			return (
				<div className="flex flex-col items-center justify-center py-12">
					<Info className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
					<h3 className="text-lg font-medium mb-2">
						Aucune formation disponible
					</h3>
					<p className="text-gray-500 dark:text-gray-400 text-center mb-4">
						Votre organisation n'a pas encore de formations
						disponibles.
						{isAdmin &&
							" En tant qu'administrateur, vous pouvez ajouter des formations depuis l'onglet Formations dans la gestion de l'organisation."}
					</p>
					{isAdmin && (
						<Button
							onClick={() =>
								router.push(`/organization/${organizationId}`)
							}
						>
							Gérer l'organisation
						</Button>
					)}
				</div>
			);
		}

		return null;
	};

	return (
		<div className="space-y-6">
			{/* En-tête avec informations sur l'organisation */}
			{currentOrganization && (
				<div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
					<div className="flex items-center gap-4 mb-4">
						<div className="relative w-14 h-14 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-full flex items-center justify-center flex-shrink-0">
							<Building className="w-8 h-8 text-wisetwin-blue" />
						</div>
						<div>
							<h2 className="text-xl font-bold">
								{currentOrganization.name}
							</h2>
							<p className="text-sm text-gray-600 dark:text-gray-300">
								{currentOrganization.description ||
									"Catalogue de formations de l'organisation"}
							</p>
							{userRole && (
								<Badge className="mt-1">
									{userRole === "OWNER"
										? "Propriétaire"
										: userRole === "ADMIN"
										? "Administrateur"
										: "Membre"}
								</Badge>
							)}
						</div>
					</div>

					{trainings.length > 0 && (
						<div className="flex flex-wrap gap-4 mt-4">
							<div className="bg-white dark:bg-gray-700 p-3 rounded-md flex items-center gap-2">
								<Tag className="w-5 h-5 text-wisetwin-blue" />
								<div>
									<p className="text-xs text-gray-500 dark:text-gray-400">
										Formations
									</p>
									<p className="font-medium">
										{trainings.length}
									</p>
								</div>
							</div>

							{groups.length > 0 && (
								<div className="bg-white dark:bg-gray-700 p-3 rounded-md flex items-center gap-2">
									<Users className="w-5 h-5 text-wisetwin-blue" />
									<div>
										<p className="text-xs text-gray-500 dark:text-gray-400">
											Groupes
										</p>
										<p className="font-medium">
											{groups.length}
										</p>
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Barre de recherche et filtres */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-grow">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<Input
						placeholder="Rechercher une formation..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-10"
					/>
				</div>

				<div className="flex gap-2">
					{categories.length > 0 && (
						<Select
							value={categoryFilter}
							onValueChange={setCategoryFilter}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Catégorie" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									Toutes les catégories
								</SelectItem>
								{categories.map((category) => (
									<SelectItem key={category} value={category}>
										{category}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

					{groups.length > 0 && (
						<Select
							value={groupFilter}
							onValueChange={setGroupFilter}
						>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Groupe" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									Tous les groupes
								</SelectItem>
								{groups.map((group) => (
									<SelectItem key={group.id} value={group.id}>
										{group.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				</div>
			</div>

			{/* État vide ou chargement */}
			{(isLoading || isEmptySearch || isEmptyFilters || isEmptyCatalog) &&
				renderEmptyState()}

			{/* Liste des formations */}
			{!isLoading &&
				!isEmptySearch &&
				!isEmptyFilters &&
				!isEmptyCatalog && (
					<motion.div
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						{filteredTrainings.map((training) => (
							<motion.div
								key={training.id}
								variants={itemVariants}
								className="h-full"
							>
								<Card
									className="h-full flex flex-col hover:shadow-md hover:border-wisetwin-blue transition-all cursor-pointer"
									onClick={() =>
										handleAccessTraining(training)
									}
								>
									<div className="relative h-48 bg-gray-100 dark:bg-gray-800">
										<Image
											src={
												training.imageUrl ||
												WISETRAINER_CONFIG.DEFAULT_IMAGE
											}
											alt={training.name}
											fill
											className="object-cover rounded-t-lg"
											onError={(e) => {
												e.target.src =
													WISETRAINER_CONFIG.DEFAULT_IMAGE;
											}}
										/>
										{training.isCustomBuild && (
											<Badge className="absolute top-2 right-2 bg-wisetwin-blue text-white">
												Personnalisée
											</Badge>
										)}
									</div>

									<CardHeader className="pb-2">
										<CardTitle className="line-clamp-1">
											{training.name}
										</CardTitle>
										<CardDescription>
											{training.category}
										</CardDescription>
									</CardHeader>

									<CardContent className="flex-grow">
										<p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
											{training.description}
										</p>

										<div className="grid grid-cols-2 gap-2 text-sm">
											<div className="flex items-center">
												<BarChart className="w-4 h-4 mr-2 text-gray-400" />
												<span>
													{training.difficulty}
												</span>
											</div>
											<div className="flex items-center">
												<Clock className="w-4 h-4 mr-2 text-gray-400" />
												<span>{training.duration}</span>
											</div>
										</div>

										{training.assignedGroups &&
											training.assignedGroups.length >
												0 && (
												<div className="mt-4">
													<p className="text-xs text-gray-500 mb-1">
														Groupes assignés:
													</p>
													<div className="flex flex-wrap gap-1">
														{training.assignedGroups
															.slice(0, 2)
															.map((group) => (
																<Badge
																	key={
																		group.id
																	}
																	variant="outline"
																	className="text-xs"
																>
																	{group.name}
																</Badge>
															))}
														{training.assignedGroups
															.length > 2 && (
															<Badge
																variant="outline"
																className="text-xs"
															>
																+
																{training
																	.assignedGroups
																	.length - 2}
															</Badge>
														)}
													</div>
												</div>
											)}
									</CardContent>

									<CardFooter>
										<Button className="w-full">
											Accéder à la formation
										</Button>
									</CardFooter>
								</Card>
							</motion.div>
						))}
					</motion.div>
				)}
		</div>
	);
}
