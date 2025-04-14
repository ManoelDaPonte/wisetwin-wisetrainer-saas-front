import React from "react";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Tag } from "lucide-react";
import Image from "next/image";
import TrainingCard from "./TrainingCard";

export default function OrganizationTrainingPanel({
	organization,
	taggedTrainings = [],
	organizationTrainings = [],
	showAllTrainings = false,
	showTaggedOnly = false,
	noSampleData = false,
}) {
	const router = useRouter();

	// Filtrer les formations pour cette organisation spécifique
	const orgTaggedTrainings = taggedTrainings || [];
	const orgTrainings = organizationTrainings || [];

	// Si nous affichons uniquement les formations taguées, et qu'il n'y en a pas, ne pas afficher le panneau
	if (showTaggedOnly && orgTaggedTrainings.length === 0) {
		return null;
	}

	// Si nous affichons toutes les formations, et qu'il n'y en a pas, vérifier si nous devons afficher un message
	const hasAnyTrainings =
		orgTrainings.length > 0 || orgTaggedTrainings.length > 0;
	if (showAllTrainings && !hasAnyTrainings && noSampleData) {
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
										{organization.name
											.charAt(0)
											.toUpperCase()}
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
								{organization.description ||
									"Formations disponibles pour cette organisation"}
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-0">
					<div className="text-center py-8">
						<div className="inline-flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 p-6 mb-4">
							<BookOpen className="w-8 h-8 text-gray-400 dark:text-gray-500" />
						</div>
						<h3 className="text-lg font-medium mb-2">
							Aucune formation disponible
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
							Votre administrateur n'a pas encore assigné de
							formations pour cette organisation.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

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
							{organization.description ||
								"Formations disponibles pour cette organisation"}
						</CardDescription>
					</div>
				</div>
			</CardHeader>

			<CardContent className="pt-4">
				{/* Formations taguées spécifiquement pour l'utilisateur */}
				{orgTaggedTrainings.length > 0 && (
					<div className="mb-6">
						<h3 className="text-lg font-medium text-wisetwin-darkblue dark:text-wisetwin-blue mb-4 flex items-center">
							<Tag className="w-5 h-5 mr-2 text-wisetwin-blue" />
							Formations recommandées pour vous
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{orgTaggedTrainings.map((training, index) => (
								<TrainingCard
									key={`tag-${training.id}-${index}`}
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

				{/* Toutes les formations de l'organisation */}
				{showAllTrainings && orgTrainings.length > 0 && (
					<div>
						<h3 className="text-lg font-medium text-wisetwin-darkblue dark:text-wisetwin-blue mb-4">
							Toutes les formations
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{orgTrainings.map((training, index) => (
								<TrainingCard
									key={`org-${training.id}-${index}`}
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
