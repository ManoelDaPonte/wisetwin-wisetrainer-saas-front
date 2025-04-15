//components/organizations/organization/dashboard/UserProgressTable.jsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Search,
	Calendar,
	Clock,
	Award,
	SlidersHorizontal,
	BookOpen,
	Download,
	Eye,
	Users,
	Tag,
	X,
} from "lucide-react";

// Importation du composant modal de détails utilisateur
import UserDetailsModal from "./UserDetailsModal";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

// Composant pour afficher l'indicateur de progression
const ProgressIndicator = ({ value, size = "md" }) => {
	const getColorClass = (val) => {
		if (val < 30) return "bg-red-500";
		if (val < 70) return "bg-amber-500";
		return "bg-green-500";
	};

	return (
		<div className="flex items-center gap-2">
			<Progress
				value={value}
				className={`${size === "sm" ? "h-1.5" : "h-2"} ${getColorClass(
					value
				)}`}
			/>
			<span className="text-sm font-medium">{value}%</span>
		</div>
	);
};

// États de progression
const ProgressStatus = ({ status }) => {
	const configs = {
		completed: {
			bg: "bg-green-100",
			text: "text-green-800",
			label: "Terminé",
		},
		"in-progress": {
			bg: "bg-blue-100",
			text: "text-blue-800",
			label: "En cours",
		},
		"not-started": {
			bg: "bg-gray-100",
			text: "text-gray-800",
			label: "Non commencé",
		},
		overdue: { bg: "bg-red-100", text: "text-red-800", label: "En retard" },
	};

	const config = configs[status] || configs["not-started"];

	return (
		<Badge className={`${config.bg} ${config.text} hover:${config.bg}`}>
			{config.label}
		</Badge>
	);
};

export default function UserProgressTable({ users, trainings, tags = [] }) {
	const [search, setSearch] = useState("");
	const [filteredUsers, setFilteredUsers] = useState(users);
	const [sortConfig, setSortConfig] = useState({
		key: "name",
		direction: "asc",
	});
	const [selectedTraining, setSelectedTraining] = useState("all");
	const [selectedUser, setSelectedUser] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedTags, setSelectedTags] = useState([]);
	const [tagFilterOpen, setTagFilterOpen] = useState(false);

	// Formatage de date pour l'affichage
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	// Appliquer tous les filtres (recherche, formation, tags)
	const applyFilters = () => {
		let filtered = [...users];

		// Filtre par recherche
		if (search.trim()) {
			const searchLower = search.toLowerCase();
			filtered = filtered.filter(
				(user) =>
					user.name.toLowerCase().includes(searchLower) ||
					user.email.toLowerCase().includes(searchLower) ||
					user.role.toLowerCase().includes(searchLower)
			);
		}

		// Filtre par formation
		if (selectedTraining !== "all") {
			filtered = filtered.filter((user) =>
				user.trainings.some((t) => t.id === selectedTraining)
			);
		}

		// Filtre par tags
		if (selectedTags.length > 0) {
			filtered = filtered.filter((user) => {
				// Si l'utilisateur n'a pas de tags, le filtrer
				if (!user.tags || user.tags.length === 0) return false;

				// Vérifier si l'utilisateur a au moins un des tags sélectionnés
				return user.tags.some((tag) => selectedTags.includes(tag.id));
			});
		}

		setFilteredUsers(filtered);
	};

	// Gestionnaire de recherche
	const handleSearch = (e) => {
		const value = e.target.value;
		setSearch(value);

		// Appliquer tous les filtres
		applyFilters();
	};

	// Gestionnaire de tri
	const handleSort = (key) => {
		let direction = "asc";
		if (sortConfig.key === key && sortConfig.direction === "asc") {
			direction = "desc";
		}
		setSortConfig({ key, direction });

		const sortedUsers = [...filteredUsers].sort((a, b) => {
			if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
			if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
			return 0;
		});

		setFilteredUsers(sortedUsers);
	};

	// Gestionnaire de filtre par formation
	const handleTrainingFilter = (trainingId) => {
		setSelectedTraining(trainingId);

		// Appliquer tous les filtres
		applyFilters();
	};

	// Gestionnaire de filtre par tags
	const handleTagFilter = (tagId) => {
		setSelectedTags((prev) => {
			// Si le tag est déjà sélectionné, le retirer
			if (prev.includes(tagId)) {
				return prev.filter((id) => id !== tagId);
			}
			// Sinon l'ajouter
			return [...prev, tagId];
		});

		// Appliquer tous les filtres
		applyFilters();
	};

	// Effacer tous les filtres de tags
	const clearTagFilters = () => {
		setSelectedTags([]);
		applyFilters();
	};

	// Gestionnaire pour ouvrir le modal de détails d'un utilisateur
	const handleViewUserDetails = (user) => {
		setSelectedUser(user);
		setIsModalOpen(true);
	};

	// Calculer la progression moyenne pour un utilisateur
	const getUserProgressForTraining = (user, trainingId) => {
		if (trainingId === "all") {
			// Calculer la moyenne de progression sur toutes les formations
			const trainings = user.trainings;
			if (!trainings.length) return 0;

			const sum = trainings.reduce((acc, curr) => acc + curr.progress, 0);
			return Math.round(sum / trainings.length);
		}

		// Trouver la formation spécifique
		const training = user.trainings.find((t) => t.id === trainingId);
		return training ? training.progress : 0;
	};

	// Déterminer le statut de progression
	const getUserStatusForTraining = (user, trainingId) => {
		if (trainingId === "all") {
			// Déterminer le statut global en fonction de la moyenne
			const progress = getUserProgressForTraining(user, trainingId);

			if (progress >= 100) return "completed";
			if (progress > 0) return "in-progress";
			return "not-started";
		}

		// Trouver la formation spécifique
		const training = user.trainings.find((t) => t.id === trainingId);
		if (!training) return "not-started";

		if (training.progress >= 100) return "completed";
		if (training.progress > 0) return "in-progress";

		// Vérifier si la formation est en retard
		const deadline = new Date(training.deadline);
		if (deadline < new Date() && training.progress < 100) return "overdue";

		return "not-started";
	};

	// Fonction pour exporter les données
	const handleExportData = () => {
		// Créer un tableau de données pour l'export
		const exportData = filteredUsers.map((user) => ({
			Nom: user.name,
			Email: user.email,
			Role: user.role,
			"Dernière activité": formatDate(user.lastActive),
			"Temps de formation (h)": user.trainingTime,
			"Formations complétées": user.completedTrainings,
			"Formations totales": user.totalTrainings,
			"Progression moyenne (%)": getUserProgressForTraining(
				user,
				selectedTraining
			),
			Statut: getUserStatusForTraining(user, selectedTraining),
			Tags: user.tags ? user.tags.map((t) => t.name).join(", ") : "",
		}));

		// Convertir en CSV
		const headers = Object.keys(exportData[0]);
		const csvRows = [
			headers.join(","),
			...exportData.map((row) =>
				headers
					.map((header) => JSON.stringify(row[header] || ""))
					.join(",")
			),
		];
		const csvContent = csvRows.join("\n");

		// Créer un blob et télécharger
		const blob = new Blob([csvContent], {
			type: "text/csv;charset=utf-8;",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`utilisateurs-statistiques-${new Date()
				.toISOString()
				.slice(0, 10)}.csv`
		);
		link.click();
	};

	return (
		<Card>
			<CardHeader className="pb-3">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
					<CardTitle className="text-lg flex items-center">
						<Users className="h-5 w-5 mr-2" />
						Progression des utilisateurs
					</CardTitle>

					<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
						<div className="relative w-full sm:w-64">
							<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input
								type="search"
								placeholder="Rechercher un utilisateur..."
								className="pl-8"
								value={search}
								onChange={handleSearch}
							/>
						</div>

						<div className="relative">
							<select
								className="w-full sm:w-auto appearance-none block px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-wisetwin-blue focus:border-wisetwin-blue dark:bg-gray-700"
								value={selectedTraining}
								onChange={(e) =>
									handleTrainingFilter(e.target.value)
								}
							>
								<option value="all">
									Toutes les formations
								</option>
								{trainings.map((training) => (
									<option
										key={training.id}
										value={training.id}
									>
										{training.name}
									</option>
								))}
							</select>
							<SlidersHorizontal className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						</div>

						{tags && tags.length > 0 && (
							<Popover
								open={tagFilterOpen}
								onOpenChange={setTagFilterOpen}
							>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className="flex items-center gap-2"
									>
										<Tag className="h-4 w-4" />
										Tags
										{selectedTags.length > 0 && (
											<Badge className="bg-wisetwin-blue text-white ml-1">
												{selectedTags.length}
											</Badge>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-56 p-3">
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<h4 className="text-sm font-medium">
												Filtrer par tags
											</h4>
											{selectedTags.length > 0 && (
												<Button
													variant="ghost"
													size="sm"
													className="h-6 px-2 text-xs"
													onClick={clearTagFilters}
												>
													<X className="h-3 w-3 mr-1" />
													Effacer
												</Button>
											)}
										</div>
										<div className="space-y-2 max-h-60 overflow-y-auto">
											{tags.map((tag) => (
												<div
													key={tag.id}
													className="flex items-center space-x-2"
												>
													<Checkbox
														id={`filter-tag-${tag.id}`}
														checked={selectedTags.includes(
															tag.id
														)}
														onCheckedChange={() =>
															handleTagFilter(
																tag.id
															)
														}
													/>
													<label
														htmlFor={`filter-tag-${tag.id}`}
														className="text-sm flex items-center cursor-pointer"
													>
														<div
															className="w-3 h-3 rounded-full mr-2"
															style={{
																backgroundColor:
																	tag.color,
															}}
														></div>
														{tag.name}
													</label>
												</div>
											))}
										</div>
										<Button
											size="sm"
											className="w-full mt-2 bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
											onClick={() =>
												setTagFilterOpen(false)
											}
										>
											Appliquer
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead
									className="w-44 cursor-pointer"
									onClick={() => handleSort("name")}
								>
									<div className="flex items-center">
										Utilisateur
										{sortConfig.key === "name" && (
											<span className="ml-1">
												{sortConfig.direction === "asc"
													? "↑"
													: "↓"}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead className="w-32">Rôle</TableHead>
								<TableHead className="w-32">Tags</TableHead>
								<TableHead
									className="cursor-pointer"
									onClick={() => handleSort("lastActive")}
								>
									<div className="flex items-center">
										Dernière activité
										{sortConfig.key === "lastActive" && (
											<span className="ml-1">
												{sortConfig.direction === "asc"
													? "↑"
													: "↓"}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer"
									onClick={() => handleSort("trainingTime")}
								>
									<div className="flex items-center">
										<Clock className="h-4 w-4 mr-1" />
										Temps
										{sortConfig.key === "trainingTime" && (
											<span className="ml-1">
												{sortConfig.direction === "asc"
													? "↑"
													: "↓"}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead
									className="cursor-pointer"
									onClick={() =>
										handleSort("completedTrainings")
									}
								>
									<div className="flex items-center">
										<BookOpen className="h-4 w-4 mr-1" />
										Formations
										{sortConfig.key ===
											"completedTrainings" && (
											<span className="ml-1">
												{sortConfig.direction === "asc"
													? "↑"
													: "↓"}
											</span>
										)}
									</div>
								</TableHead>
								<TableHead>Statut</TableHead>
								<TableHead className="w-44">
									Progression
								</TableHead>
								<TableHead className="w-16 text-right">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredUsers.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={9}
										className="text-center py-8 text-muted-foreground"
									>
										Aucun utilisateur trouvé avec les
										critères de recherche actuels.
									</TableCell>
								</TableRow>
							) : (
								filteredUsers.map((user) => (
									<TableRow key={user.id}>
										<TableCell className="font-medium">
											<div className="flex flex-col">
												<span>{user.name}</span>
												<span className="text-xs text-muted-foreground">
													{user.email}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<Badge variant="outline">
												{user.role}
											</Badge>
										</TableCell>
										<TableCell>
											<div className="flex flex-wrap gap-1.5">
												{user.tags &&
												user.tags.length > 0 ? (
													user.tags.map((tag) => (
														<div
															key={tag.id}
															className="w-3.5 h-3.5 rounded-full"
															style={{
																backgroundColor:
																	tag.color,
															}}
															title={tag.name} // Pour voir le nom au survol
														></div>
													))
												) : (
													<span className="text-gray-400 text-xs">
														Aucun
													</span>
												)}
												{user.tags &&
													user.tags.length > 5 && (
														<div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 dark:bg-gray-700 text-xs">
															+
															{user.tags.length -
																5}
														</div>
													)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												<Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
												<span className="text-sm">
													{formatDate(
														user.lastActive
													)}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												<Clock className="h-3 w-3 mr-1 text-muted-foreground" />
												<span className="text-sm">
													{user.trainingTime}h
												</span>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center">
												<span className="font-medium">
													{user.completedTrainings}
												</span>
												<span className="text-xs text-muted-foreground ml-1">
													/ {user.totalTrainings}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<ProgressStatus
												status={getUserStatusForTraining(
													user,
													selectedTraining
												)}
											/>
										</TableCell>
										<TableCell>
											<ProgressIndicator
												value={getUserProgressForTraining(
													user,
													selectedTraining
												)}
											/>
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												onClick={() =>
													handleViewUserDetails(user)
												}
												title="Voir détails utilisateur"
											>
												<Eye className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
			<div className="flex items-center justify-between px-6 py-4 border-t">
				<div className="text-sm text-muted-foreground">
					Affichage de{" "}
					<span className="font-medium">{filteredUsers.length}</span>{" "}
					sur <span className="font-medium">{users.length}</span>{" "}
					utilisateurs
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleExportData}
					>
						<Download className="h-4 w-4 mr-2" />
						Exporter
					</Button>
				</div>
			</div>

			{/* Modal de détails utilisateur */}
			{selectedUser && (
				<UserDetailsModal
					user={selectedUser}
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					trainings={trainings}
				/>
			)}
		</Card>
	);
}
