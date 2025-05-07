//components/guide/CurrentTrainingsPanel.jsx
import React, { memo } from "react";
import { motion } from "framer-motion";
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
import { Clock, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import TrainingCard from "./TrainingCard";

/**
 * Displays the user's current training sessions
 * Memoized to prevent unnecessary re-renders when other parts of the guide change
 * 
 * @param {Object} props - Component props
 * @param {Array} props.trainings - List of current trainings to display
 * @param {boolean} props.isLoading - Whether the trainings are still loading
 * @returns {JSX.Element} The current trainings panel
 */
function CurrentTrainingsPanel({
	trainings = [],
	isLoading = false,
}) {
	const router = useRouter();

	if (isLoading) {
		return (
			<Card className="mb-6">
				<CardHeader>
					<div className="animate-pulse h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
					<div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
								<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
								<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<Card className="mb-6">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 w-8 h-8 rounded-full flex items-center justify-center">
								<Clock className="w-4 h-4 text-wisetwin-blue" />
							</div>
							<CardTitle>Formations en cours</CardTitle>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push("/wisetrainer")}
						>
							{trainings.length > 0
								? "Voir toutes mes formations"
								: "Explorer le catalogue"}
						</Button>
					</div>
					<CardDescription>
						{trainings.length > 0
							? "Reprenez vos formations là où vous les avez laissées"
							: "Démarrez votre parcours de formation"}
					</CardDescription>
				</CardHeader>

				<CardContent>
					{trainings.length > 0 ? (
						// Affichage des formations en cours
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{trainings.slice(0, 3).map((training) => (
								<TrainingCard
									key={training.id}
									training={training}
									onClick={() => {
										// Si la formation appartient à une organisation, rediriger vers la page organisation
										if (
											training.source &&
											training.source.type === "organization" &&
											training.source.organizationId
										) {
											router.push(
												`/wisetrainer/organization/${training.source.organizationId}/${training.id}`
											);
										} else {
											// Rediriger vers la liste des formations
											router.push("/wisetrainer");
										}
									}}
								/>
							))}
						</div>
					) : (
						// État vide - aucune formation en cours
						<div className="text-center py-8">
							<div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 p-6 mb-4">
								<GraduationCap className="w-8 h-8 text-wisetwin-blue" />
							</div>
							<h3 className="text-lg font-medium mb-2">
								Vous n'avez pas encore commencé de formation
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
								Découvrez notre catalogue de formations
								interactives et développez vos compétences
								professionnelles.
							</p>
						</div>
					)}

					{trainings.length > 3 && (
						<div className="mt-4 text-center">
							<Button
								variant="outline"
								className="group"
								onClick={() => router.push("/wisetrainer")}
							>
								<BookOpen className="mr-2 h-4 w-4" />
								Voir les {trainings.length - 3} autres
								formations en cours
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
					)}
				</CardContent>

				{/* Ajouter un footer avec un bouton CTA seulement si aucune formation n'est en cours */}
				{trainings.length === 0 && (
					<CardFooter className="flex justify-center pt-0">
						<Button
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
							onClick={() => router.push("/wisetrainer")}
						>
							Découvrir les formations
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</CardFooter>
				)}
			</Card>
		</motion.div>
	);
}

// Export a memoized version to prevent unnecessary re-renders
export default memo(CurrentTrainingsPanel);