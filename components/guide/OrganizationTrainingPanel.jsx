//components/guide/OrganizationTrainingPanel.jsx
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
import { ArrowRight, BookOpen, Tag } from "lucide-react";
import Image from "next/image";
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
	const orgTaggedTrainings = taggedTrainings || [];
	const orgInProgressTrainings = inProgressTrainings || [];

	// Filtrer les formations spécifiques à l'organisation qui ne sont pas déjà incluses dans
	// les formations taguées ou en cours pour éviter les doublons
	const orgOtherTrainings = showAllTrainings
		? (organizationTrainings || []).filter((training) => {
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
	const hasAnyTrainings =
		orgTaggedTrainings.length > 0 ||
		orgInProgressTrainings.length > 0 ||
		orgOtherTrainings.length > 0;

	if (!hasAnyTrainings && !showAllTrainings) {
		return null;
	}

	// Pour les besoins de la démonstration, assurons-nous que nous avons toujours des formations à afficher
	const allOrgTrainings =
		orgOtherTrainings.length > 0 ? orgOtherTrainings : [];

	// S'assurer qu'on affiche toujours la section "Toutes les formations"
	// même si nous n'avons pas de formations spécifiques à l'organisation
	if (allOrgTrainings.length === 0 && showAllTrainings) {
		// Utiliser des exemples de formations statiques
		allOrgTrainings.push(
			{
				id: `${organization.id}-formation-1`,
				name: "Sécurité industrielle basique",
				description:
					"Formation sur les fondamentaux de la sécurité en environnement industriel",
				imageUrl: "/images/png/placeholder.png",
				duration: "30 min",
				difficulty: "Débutant",
				category: "Sécurité",
				organizationId: organization.id,
				organizationName: organization.name,
			},
			{
				id: `${organization.id}-formation-2`,
				name: "Manipulation d'équipements",
				description:
					"Techniques de manipulation sécurisée des équipements industriels",
				imageUrl: "/images/png/placeholder.png",
				duration: "45 min",
				difficulty: "Intermédiaire",
				category: "Opérations",
				organizationId: organization.id,
				organizationName: organization.name,
			},
			{
				id: `${organization.id}-formation-3`,
				name: "Prévention des risques",
				description:
					"Identifier et prévenir les risques dans l'environnement de travail",
				imageUrl: "/images/png/placeholder.png",
				duration: "60 min",
				difficulty: "Avancé",
				category: "Sécurité",
				organizationId: organization.id,
				organizationName: organization.name,
			},
			{
				id: `${organization.id}-formation-3`,
				name: "Prévention des risques",
				description:
					"Identifier et prévenir les risques dans l'environnement de travail",
				imageUrl: "/images/png/placeholder.png",
				duration: "60 min",
				difficulty: "Avancé",
				category: "Sécurité",
				organizationId: organization.id,
				organizationName: organization.name,
			}
		);
	}

	return (
		<Card className="mb-6">
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

			<CardContent className="pt-6">
				{/* Toutes les formations de l'organisation - TOUJOURS AFFICHÉ */}
				<div className="mb-8">
					<h3 className="font-medium text-lg text-wisetwin-darkblue dark:text-wisetwin-blue">
						Toutes les formations de cette organisation
					</h3>
					<div className="flex">
						<div className="flex-grow overflow-x-auto pb-4">
							<div className="flex gap-4 pb-2">
								{allOrgTrainings.map((training, index) => (
									<div
										key={`org-${training.id}-${index}`}
										className="w-72 flex-shrink-0"
									>
										<TrainingCard
											training={training}
											onClick={() =>
												router.push(
													`/wisetrainer/${training.id}`
												)
											}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Formations recommandées via tags */}
				{orgTaggedTrainings.length > 0 && (
					<div className="mb-8">
						<h3 className="font-medium text-lg text-wisetwin-darkblue dark:text-wisetwin-blue">
							Selon vos tags
						</h3>
						<div className="flex">
							<div className="flex-grow overflow-x-auto pb-4">
								<div className="flex gap-4 pb-2">
									{orgTaggedTrainings.map(
										(training, index) => (
											<div
												key={`tag-${training.id}-${index}`}
												className="w-72 flex-shrink-0"
											>
												<TrainingCard
													training={training}
													onClick={() =>
														router.push(
															`/wisetrainer/${training.id}`
														)
													}
													isTagged
												/>
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Formations en cours */}
				{orgInProgressTrainings.length > 0 && (
					<div>
						<div className="pl-20 mb-4">
							<h3 className="font-medium text-lg text-wisetwin-darkblue dark:text-wisetwin-blue">
								Formations en cours
							</h3>
						</div>
						<div className="flex">
							<div className="w-20 flex-shrink-0"></div>
							<div className="flex-grow overflow-x-auto pb-4">
								<div className="flex gap-4 pb-2">
									{orgInProgressTrainings.map(
										(training, index) => (
											<div
												key={`inprogress-${training.id}-${index}`}
												className="w-72 flex-shrink-0"
											>
												<TrainingCard
													training={training}
													onClick={() =>
														router.push(
															`/wisetrainer/${training.id}`
														)
													}
												/>
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
