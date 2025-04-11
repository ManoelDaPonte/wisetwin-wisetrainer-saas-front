//components/guide/TagBasedRecommendations.jsx
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tag, ArrowRight } from "lucide-react";
import TagBasedTrainingCard from "./TagBasedTrainingCard";

export default function TagBasedRecommendations({ userTags, taggedTrainings }) {
	const router = useRouter();

	console.log("TagBasedRecommendations rendu avec:", {
		userTags: userTags?.length,
		taggedTrainings: taggedTrainings?.length,
	});

	// Vérification de sécurité
	if (!userTags?.length || !taggedTrainings?.length) {
		console.log(
			"Pas de tags ou de formations associées, le composant ne sera pas rendu"
		);
		return null;
	}

	// Variables d'animation pour Framer Motion
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.4 },
		},
	};

	// Organiser les formations par tag
	const tagGroups = [];
	const processedTagIds = new Set();

	// Pour chaque tag, trouver les formations associées
	userTags.forEach((tag) => {
		// Éviter les doublons de tags
		if (processedTagIds.has(tag.id)) return;
		processedTagIds.add(tag.id);

		// Trouver les formations associées à ce tag
		const relatedTrainings = taggedTrainings.filter(
			(training) => training.tagInfo?.id === tag.id
		);

		console.log(
			`Tag ${tag.name} (${tag.id}): ${relatedTrainings.length} formations trouvées`
		);

		if (relatedTrainings.length > 0) {
			tagGroups.push({
				tag,
				trainings: relatedTrainings,
			});
		}
	});

	console.log("Groupes de tags avec formations:", tagGroups);

	if (tagGroups.length === 0) {
		console.log(
			"Aucun groupe de tag avec des formations, le composant ne sera pas rendu"
		);
		return null;
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Tag className="h-5 w-5 text-wisetwin-blue" />
					Formations recommandées selon vos tags
				</CardTitle>
			</CardHeader>
			<CardContent>
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-8"
				>
					{tagGroups.map((group) => (
						<motion.div
							key={group.tag.id}
							variants={itemVariants}
							className="space-y-4"
						>
							<div className="flex items-center gap-2">
								<div
									className="w-5 h-5 rounded-full"
									style={{
										backgroundColor:
											group.tag.color || "#3B82F6",
									}}
								></div>
								<h3 className="text-lg font-semibold">
									Parce que vous êtes tagué «{group.tag.name}»
									dans {group.tag.organizationName}
								</h3>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{group.trainings.map((training) => (
									<TagBasedTrainingCard
										key={`${training.id}-${group.tag.id}`}
										training={training}
										tag={group.tag}
										itemVariants={itemVariants}
										onSelect={() =>
											router.push(
												`/wisetrainer/${training.id}`
											)
										}
									/>
								))}
							</div>
						</motion.div>
					))}
				</motion.div>

				<div className="mt-6 text-center">
					<Button
						variant="outline"
						className="group"
						onClick={() => router.push("/wisetrainer")}
					>
						Voir toutes les formations
						<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
