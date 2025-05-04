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
import { Tag, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";
import TrainingCard from "./TrainingCard";

export default function OrganizationTrainingPanel({
	organization,
	taggedTrainings = [],
	hasCompletedTaggedTrainings = false,
}) {
	const router = useRouter();

	// Filtrer les formations taguées pour cette organisation
	const orgTaggedTrainings = taggedTrainings || [];
	const hasTaggedTrainings = orgTaggedTrainings.length > 0;

	// État à afficher:
	// 1. Formations taguées en cours
	// 2. Toutes les formations taguées complétées
	// 3. Aucune formation taguée

	return (
		<Card className="mb-0">
			<CardHeader className="pb-3">
				<div className="flex items-start">
					{/* Logo de l'organisation */}
					<div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mr-4 flex-shrink-0">
						{organization.logoUrl ? (
							<Image
								src={organization.logoUrl}
								alt={organization.name}
								fill
								className="object-cover"
								onError={(e) => {
									e.target.src =
										"/images/png/placeholder.png";
								}}
							/>
						) : (
							<div className="w-full h-full flex items-center justify-center bg-wisetwin-blue/10">
								<span className="text-2xl font-bold text-wisetwin-blue">
									{organization.name.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
					</div>

					{/* Informations de l'organisation */}
					<div className="flex-grow">
						<div className="flex items-center justify-between">
							<CardTitle>{organization.name}</CardTitle>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									router.push(
										`/organization/${organization.id}`
									)
								}
							>
								Voir l'organisation
							</Button>
						</div>
						<CardDescription>
							Formations recommandées par votre organisation
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-4">
				{/* Titre de section commun */}
				<h3 className="text-lg font-medium text-wisetwin-darkblue dark:text-wisetwin-blue mb-4 flex items-center">
					<Tag className="w-5 h-5 mr-2 text-wisetwin-blue" />
					Formations recommandées pour vous
				</h3>

				{/* 1. Cas: Formations taguées en cours */}
				{hasTaggedTrainings && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{orgTaggedTrainings.map((training, index) => (
							<TrainingCard
								key={`tag-${training.id}-${index}`}
								training={training}
								onClick={() =>
									router.push(`/wisetrainer/organization/${organization.id}/${training.id}`)
								}
								isTagged
							/>
						))}
					</div>
				)}

				{/* 2. Cas: Toutes les formations taguées complétées */}
				{hasCompletedTaggedTrainings && (
					<div className="text-center py-6 bg-green-50 dark:bg-green-900/10 rounded-lg">
						<div className="inline-flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 p-4 mb-3">
							<CheckCircle className="w-6 h-6 text-green-500" />
						</div>
						<h4 className="text-base font-medium mb-1">
							Toutes les formations recommandées sont terminées !
						</h4>
						<p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
							Vous avez complété toutes les formations qui vous
							ont été assignées par cette organisation.
						</p>
					</div>
				)}

				{/* 3. Cas: Aucune formation taguée */}
				{!hasTaggedTrainings && !hasCompletedTaggedTrainings && (
					<div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
						<div className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 p-4 mb-3">
							<AlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-500" />
						</div>
						<h4 className="text-base font-medium mb-1">
							Aucune formation assignée
						</h4>
						<p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
							Vous n'avez pas encore de formations recommandées
							par cette organisation.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}