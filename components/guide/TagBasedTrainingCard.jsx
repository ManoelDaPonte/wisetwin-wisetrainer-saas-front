//components/guide/TagBasedTrainingCard.jsx
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Tag, ArrowRight } from "lucide-react";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export default function TagBasedTrainingCard({
	training,
	tag,
	itemVariants,
	onSelect,
}) {
	if (!training) {
		console.warn("TagBasedTrainingCard: Aucune formation fournie");
		return null;
	}

	// S'assurer que les propriétés ont des valeurs par défaut
	const safeTraining = {
		name: training.name || "Formation sans titre",
		description: training.description || "Aucune description disponible",
		imageUrl: training.imageUrl || WISETRAINER_CONFIG.DEFAULT_IMAGE,
		category: training.category || "Formation",
		organizationName:
			training.organizationName ||
			tag?.organizationName ||
			"Organisation",
		...training,
	};

	const safeTag = {
		name: tag?.name || "Tag",
		color: tag?.color || "#3B82F6",
		...tag,
	};

	return (
		<motion.div variants={itemVariants}>
			<Card
				className="h-full flex flex-col transition-all hover:shadow-md hover:border-wisetwin-blue cursor-pointer"
				onClick={onSelect}
			>
				{/* Image et badges */}
				<div className="relative w-full h-36 overflow-hidden rounded-t-lg">
					<Image
						src={safeTraining.imageUrl}
						alt={safeTraining.name}
						fill
						className="object-cover"
						onError={(e) => {
							e.target.src = WISETRAINER_CONFIG.DEFAULT_IMAGE;
						}}
					/>

					{/* Badge d'organisation */}
					<div className="absolute top-2 left-2">
						<Badge className="bg-gray-700 text-white">
							<Building className="w-3 h-3 mr-1" />
							{safeTraining.organizationName}
						</Badge>
					</div>

					{/* Badge de tag */}
					<div className="absolute top-2 right-2">
						<Badge
							className="text-white"
							style={{ backgroundColor: safeTag.color }}
						>
							<Tag className="w-3 h-3 mr-1" />
							{safeTag.name}
						</Badge>
					</div>
				</div>

				{/* Contenu */}
				<CardHeader className="pb-2">
					<CardTitle className="line-clamp-1">
						{safeTraining.name}
					</CardTitle>
					<CardDescription className="line-clamp-2">
						{safeTraining.description}
					</CardDescription>
				</CardHeader>

				<CardContent className="flex-grow">
					{safeTraining.category && (
						<Badge variant="outline" className="mb-2">
							{safeTraining.category}
						</Badge>
					)}
				</CardContent>

				<CardFooter className="pt-0">
					<Button className="w-full bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white group">
						Démarrer la formation
						<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
}
