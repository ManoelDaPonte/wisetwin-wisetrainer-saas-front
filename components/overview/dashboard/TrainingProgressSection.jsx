//components/overview/dashboard/TrainingProgressSection.jsx
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
import { Activity } from "lucide-react";

export default function TrainingProgressSection({
	trainings,
	isLoading,
	onViewAll,
}) {
	const router = useRouter();

	// Formatage des dates
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

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
				) : trainings.length > 0 ? (
					<TrainingProgressList
						trainings={trainings}
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
	return (
		<div className="space-y-6">
			{trainings.slice(0, 3).map((training) => (
				<div key={training.id} className="space-y-2">
					<div className="flex justify-between items-center">
						<span className="font-medium">{training.name}</span>
						<span className="text-sm text-gray-500 dark:text-gray-400">
							{training.progress}%
						</span>
					</div>
					<Progress value={training.progress} className="h-2" />
					<div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
						<span>
							Dernier accès: {formatDate(training.lastAccessed)}
						</span>
						<span>
							{training.modules?.filter((m) => m.completed)
								.length || 0}
							/{training.modules?.length || 0} modules
						</span>
					</div>
				</div>
			))}
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
