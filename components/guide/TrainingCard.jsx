//components/guide/TrainingCard.jsx
import React from "react";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Building, Sparkles, Tag, Calendar, Clock } from "lucide-react";

// Animation variants
const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 100, damping: 15 },
	},
};

export default function TrainingCard({ training, onClick, isTagged = false }) {
	// Déterminer le type de source (organisation, tag ou WiseTwin)
	const isOrganizationCourse = training.source?.type === "organization";
	const isWiseTwinCourse = !isOrganizationCourse;

	// Formatage de date pour l'affichage
	const formatDate = (dateString) => {
		if (!dateString) return "Date inconnue";
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
		});
	};

	return (
		<motion.div variants={itemVariants}>
			<Card
				className="hover:shadow-lg transition-shadow cursor-pointer border hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light h-full"
				onClick={onClick}
			>
				<div className="relative w-full h-40">
					<img
						src={training.imageUrl || "/images/png/placeholder.png"}
						alt={training.name}
						className="w-full h-full object-cover rounded-t-lg"
					/>

					{/* Source badge */}
					<div className="absolute top-3 left-3 z-10">
						<Badge
							className={
								isOrganizationCourse
									? "bg-gray-700 text-white"
									: "bg-wisetwin-blue text-white"
							}
						>
							{isOrganizationCourse ? (
								<>
									<Building className="w-3 h-3 mr-1" />
									{training.organizationName ||
										training.source.name}
								</>
							) : (
								<>
									<Sparkles className="w-3 h-3 mr-1" />
									WiseTwin
								</>
							)}
						</Badge>
					</div>

					{/* Tag badge, if applicable */}
					{isTagged && training.tagInfo && (
						<div className="absolute top-3 right-3 z-10">
							<Badge
								className="flex items-center"
								style={{
									backgroundColor: training.tagInfo.color,
									color: "#fff",
								}}
							>
								<Tag className="w-3 h-3 mr-1" />
								{training.tagInfo.name}
							</Badge>
						</div>
					)}

					{/* Progress indicator (if started) */}
					{training.progress !== undefined &&
						training.progress > 0 && (
							<div className="absolute bottom-0 left-0 right-0">
								<Progress
									value={training.progress}
									className="h-1 rounded-none"
								/>
							</div>
						)}
				</div>

				<CardHeader className="pb-2 pt-3">
					<CardTitle className="line-clamp-1 text-base">
						{training.name}
					</CardTitle>
					<CardDescription className="flex items-center gap-1 text-xs">
						{training.lastAccessed ? (
							<>
								<Calendar className="h-3 w-3" />
								Dernier accès:{" "}
								{formatDate(training.lastAccessed)}
							</>
						) : (
							<>
								<Clock className="h-3 w-3" />
								{training.duration || "45 min"}
							</>
						)}
					</CardDescription>
				</CardHeader>

				<CardContent className="py-1">
					<p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
						{training.description}
					</p>

					{training.progress !== undefined && (
						<div className="flex justify-between items-center text-xs mt-3">
							<span className="text-gray-500">Progression</span>
							<span className="font-medium">
								{training.progress}%
							</span>
						</div>
					)}
				</CardContent>

				<CardFooter className="pt-2">
					<Button className="w-full" size="sm">
						{training.progress
							? training.progress === 100
								? "Revoir"
								: "Continuer"
							: "Commencer"}
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
}
