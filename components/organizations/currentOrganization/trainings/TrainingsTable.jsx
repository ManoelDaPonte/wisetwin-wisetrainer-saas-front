//components/organizations/currentOrganization/trainings/TrainingsTable.jsx
import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export default function TrainingsTable({
	trainings = [],
	isLoading = false,
	currentUserRole = "MEMBER",
}) {
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	// Si chargement en cours, afficher un état de chargement
	if (isLoading) {
		return (
			<div className="w-full">
				<div className="animate-pulse space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md"
						></div>
					))}
				</div>
			</div>
		);
	}

	// Si aucune formation, afficher un message
	if (trainings.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400">
					Aucune formation n'est disponible pour cette organisation
				</p>
			</div>
		);
	}

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Nom de la formation</TableHead>
						<TableHead>Catégorie</TableHead>
						<TableHead>Statut</TableHead>
						<TableHead>Build personnalisé</TableHead>
						<TableHead>Date d'ajout</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{trainings.map((training) => (
						<TableRow key={training.id}>
							<TableCell className="font-medium">
								{training.courseName}
							</TableCell>
							<TableCell>{training.courseCategory}</TableCell>
							<TableCell>
								{training.hasContent ? (
									<Badge
										variant="outline"
										className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800 flex items-center gap-1 w-fit"
									>
										<CheckCircle className="w-3.5 h-3.5" />{" "}
										Prête
									</Badge>
								) : (
									<Badge
										variant="outline"
										className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 flex items-center gap-1 w-fit"
									>
										<XCircle className="w-3.5 h-3.5" /> Non
										reliée
									</Badge>
								)}
							</TableCell>
							<TableCell>
								{training.isCustomBuild ? (
									<Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
										Personnalisé
									</Badge>
								) : (
									<Badge
										variant="outline"
										className="text-gray-500"
									>
										Standard
									</Badge>
								)}
							</TableCell>
							<TableCell>
								{formatDate(training.assignedAt)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
