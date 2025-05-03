// components/wisetrainer/tabs/UserFormation.jsx
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, Award, BookX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserFormation({
	formations,
	isLoading,
	onCourseSelect,
	onUnenroll,
	onBrowseCatalog,
	containerVariants,
	itemVariants,
}) {
	// Fonction pour formater la durée (minutes -> heures et minutes)
	const formatDuration = (minutes) => {
		if (!minutes) return "Durée non spécifiée";

		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;

		if (hours === 0) return `${mins} min`;
		if (mins === 0) return `${hours} h`;
		return `${hours} h ${mins} min`;
	};

	// Afficher un état de chargement
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{[1, 2, 3, 4, 5, 6].map((item) => (
					<Card
						key={item}
						className="border border-gray-200 dark:border-gray-700"
					>
						<CardHeader className="pb-2">
							<Skeleton className="h-6 w-3/4 mb-2" />
							<Skeleton className="h-4 w-1/2" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-4 w-full mb-2" />
							<Skeleton className="h-32 w-full rounded-md mb-4" />
							<Skeleton className="h-4 w-3/4 mb-2" />
							<Skeleton className="h-4 w-1/2" />
						</CardContent>
						<CardFooter>
							<Skeleton className="h-10 w-full rounded-md" />
						</CardFooter>
					</Card>
				))}
			</div>
		);
	}

	// Si aucune formation n'est disponible, afficher un message et un bouton pour explorer le catalogue
	if (!formations || formations.length === 0) {
		return (
			<motion.div
				className="text-center py-12"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
					<BookX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h3 className="text-xl font-medium mb-2">
						Aucune formation
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						Vous n'êtes inscrit à aucune formation pour le moment.
						Explorez notre catalogue pour découvrir des formations
						qui correspondent à vos besoins.
					</p>
					<Button
						onClick={onBrowseCatalog}
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
					>
						Explorer le catalogue
						<BookOpen className="ml-2 h-4 w-4" />
					</Button>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
		>
			{formations.map((formation, index) => (
				<motion.div
					key={
						formation.id + (formation.source?.organizationId || "")
					}
					variants={itemVariants}
					custom={index}
				>
					<Card className="h-full flex flex-col border-gray-200 dark:border-gray-700 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue transition-all duration-300">
						<CardHeader className="pb-2">
							<CardTitle className="text-lg font-semibold">
								{formation.name}
							</CardTitle>
							{formation.source?.type === "organization" && (
								<div className="flex items-center mt-1">
									<span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full px-2 py-0.5">
										{formation.source.name}
									</span>
								</div>
							)}
						</CardHeader>

						<CardContent className="flex-grow">
							{/* Image ou placeholder */}
							<div className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-md h-32 flex items-center justify-center">
								{formation.imageUrl ? (
									<img
										src={formation.imageUrl}
										alt={formation.name}
										className="h-full w-full object-cover rounded-md"
									/>
								) : (
									<BookOpen className="h-12 w-12 text-gray-400" />
								)}
							</div>

							{/* Progression */}
							<div className="mb-4">
								<div className="flex justify-between items-center mb-1">
									<span className="text-sm text-gray-600 dark:text-gray-300">
										Progression
									</span>
									<span className="text-sm font-medium">
										{formation.progress || 0}%
									</span>
								</div>
								<Progress
									value={formation.progress || 0}
									className="h-2"
								/>
							</div>

							{/* Détails */}
							<div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
								<div className="flex items-center">
									<Clock className="h-4 w-4 mr-2" />
									<span>
										{formatDuration(formation.duration)}
									</span>
								</div>
								{formation.certification && (
									<div className="flex items-center">
										<Award className="h-4 w-4 mr-2 text-yellow-500" />
										<span>Certification disponible</span>
									</div>
								)}
							</div>
						</CardContent>

						<CardFooter className="pt-2">
							<div className="flex w-full gap-2">
								<Button
									className="flex-1 bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
									onClick={() => onCourseSelect(formation)}
								>
									{formation.progress > 0
										? "Continuer"
										: "Commencer"}
								</Button>
								<Button
									variant="outline"
									className="flex-shrink-0 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/30"
									onClick={() => onUnenroll(formation)}
								>
									Supprimer
								</Button>
							</div>
						</CardFooter>
					</Card>
				</motion.div>
			))}
		</motion.div>
	);
}
