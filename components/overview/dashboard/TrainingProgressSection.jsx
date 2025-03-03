import React from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight } from "lucide-react";

export default function TrainingProgressSection({
	trainings,
	isLoading,
	onViewAll,
}) {
	const router = useRouter();

	// Formatage des dates
	const formatDate = (dateString) => {
		if (!dateString) return "Date inconnue";
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Trier les formations par dernier accès
	const sortedTrainings = [...trainings].sort(
		(a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)
	);

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center">
					<Activity className="w-5 h-5 mr-2" />
					Progression des Formations
				</CardTitle>
				<CardDescription>
					État d'avancement de vos formations en cours
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<ProgressSkeletonLoader />
				) : sortedTrainings.length > 0 ? (
					<TrainingProgressList
						trainings={sortedTrainings}
						formatDate={formatDate}
					/>
				) : (
					<EmptyTrainingState router={router} />
				)}
			</CardContent>
			{trainings.length > 0 && (
				<CardFooter>
					<Button
						variant="outline"
						className="w-full"
						onClick={onViewAll}
					>
						Voir toutes les formations
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
// Composant pour afficher la liste des formations avec leur progression
function TrainingProgressList({ trainings, formatDate }) {
	// Fonction pour déterminer le nombre correct de modules
	const getModuleCount = (training) => {
		// Si nous avons les données explicites de modules
		if (training.modules && Array.isArray(training.modules)) {
			return {
				total: training.modules.length,
				completed: training.modules.filter((m) => m.completed).length,
			};
		}

		// Si nous avons des données de totalModules explicites
		if (
			training.totalModules &&
			typeof training.totalModules === "number"
		) {
			return {
				total: training.totalModules,
				completed: training.completedModules || 0,
			};
		}

		// Valeur par défaut pour les cours (3 modules est une valeur typique)
		return {
			total: 3,
			completed: 0,
		};
	};
	return (
		<div className="space-y-6">
			{trainings.slice(0, 3).map((training) => {
				const moduleCount = getModuleCount(training);

				return (
					<div key={training.id} className="space-y-2">
						<div className="flex justify-between items-center">
							<span className="font-medium">{training.name}</span>
							<div>
								<span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
									{training.progress}%
								</span>
								<Button
									variant="ghost"
									className="p-0 h-6 w-6 rounded-full hover:bg-wisetwin-blue/10"
									onClick={() =>
										(window.location.href = `/wisetrainer/${training.id}`)
									}
								>
									<ArrowRight className="h-4 w-4 text-wisetwin-blue" />
								</Button>
							</div>
						</div>
						<Progress value={training.progress} className="h-2" />
						<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
							<span>
								Dernier accès:{" "}
								{formatDate(training.lastAccessed)}
							</span>
							<span>
								{moduleCount.completed}/{moduleCount.total}{" "}
								modules
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

// Composant pour afficher l'état vide
function EmptyTrainingState({ router }) {
	return (
		<div className="text-center py-8">
			<p className="text-gray-500 dark:text-gray-400 mb-4">
				Vous n'avez pas encore commencé de formation
			</p>
			<Button onClick={() => router.push("/wisetrainer")}>
				Découvrir les formations
			</Button>
		</div>
	);
}

// Composant pour afficher l'état de chargement
function ProgressSkeletonLoader() {
	return (
		<div className="space-y-4">
			{[1, 2].map((i) => (
				<div key={i} className="animate-pulse">
					<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
					<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
				</div>
			))}
		</div>
	);
}
