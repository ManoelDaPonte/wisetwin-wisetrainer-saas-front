import React from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building, Tag, BookOpen } from "lucide-react";
import TrainingCard from "./TrainingCard";

export default function OrganizationTrainingPanel({
	organization,
	taggedTrainings,
	organizationTrainings = [],
	inProgressTrainings,
	showAllTrainings = false,
}) {
	const router = useRouter();

	// Filtrer les formations pour cette organisation spécifique
	const orgTaggedTrainings = taggedTrainings.filter(
		(t) =>
			t.organizationId === organization.id ||
			(t.tagInfo && t.tagInfo.organizationId === organization.id)
	);

	const orgInProgressTrainings = inProgressTrainings.filter(
		(t) =>
			t.organizationId === organization.id ||
			(t.source &&
				t.source.type === "organization" &&
				t.source.organizationId === organization.id)
	);

	// Filtrer les formations spécifiques à l'organisation qui ne sont pas déjà incluses dans
	// les formations taguées ou en cours pour éviter les doublons
	const orgOtherTrainings = showAllTrainings
		? organizationTrainings.filter((training) => {
				// Éviter les doublons avec formations taguées
				const isTagged = orgTaggedTrainings.some(
					(t) =>
						t.id === training.id || t.courseId === training.courseId
				);

				// Éviter les doublons avec formations en cours
				const isInProgress = orgInProgressTrainings.some(
					(t) =>
						t.id === training.id || t.courseId === training.courseId
				);

				return !isTagged && !isInProgress;
		  })
		: [];

	// Si aucune formation n'est associée à cette organisation, on n'affiche pas le panel
	if (
		orgTaggedTrainings.length === 0 &&
		orgInProgressTrainings.length === 0 &&
		orgOtherTrainings.length === 0
	) {
		return null;
	}

	return (
		<Card className="mb-6">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="bg-gray-100 dark:bg-gray-800 w-8 h-8 rounded-full flex items-center justify-center">
							<Building className="w-4 h-4 text-wisetwin-blue" />
						</div>
						<CardTitle>{organization.name}</CardTitle>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							router.push(`/organization/${organization.id}`)
						}
					>
						Voir l'organisation
					</Button>
				</div>
				<CardDescription>
					{organization.description ||
						"Formations disponibles pour cette organisation"}
				</CardDescription>
			</CardHeader>
			<CardContent>
				{/* Formations recommandées via tags */}
				{orgTaggedTrainings.length > 0 && (
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-3">
							<Tag className="w-4 h-4 text-wisetwin-blue" />
							<h3 className="font-medium">
								Formations recommandées pour vous
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{orgTaggedTrainings.map((training) => (
								<TrainingCard
									key={`tag-${training.id}-${training.tagInfo?.id}`}
									training={training}
									onClick={() =>
										router.push(
											`/wisetrainer/${training.id}`
										)
									}
									isTagged
								/>
							))}
						</div>
					</div>
				)}

				{/* Formations en cours */}
				{orgInProgressTrainings.length > 0 && (
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-3">
							<ArrowRight className="w-4 h-4 text-wisetwin-blue" />
							<h3 className="font-medium">Formations en cours</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{orgInProgressTrainings.map((training) => (
								<TrainingCard
									key={`inprogress-${training.id}`}
									training={training}
									onClick={() =>
										router.push(
											`/wisetrainer/${training.id}`
										)
									}
								/>
							))}
						</div>
					</div>
				)}

				{/* Toutes les autres formations de l'organisation */}
				{orgOtherTrainings.length > 0 && (
					<div>
						<div className="flex items-center gap-2 mb-3">
							<BookOpen className="w-4 h-4 text-wisetwin-blue" />
							<h3 className="font-medium">
								Toutes les formations
							</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{orgOtherTrainings.map((training) => (
								<TrainingCard
									key={`org-${training.id}`}
									training={training}
									onClick={() =>
										router.push(
											`/wisetrainer/${training.id}`
										)
									}
								/>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
