//components/guide/TrainingCard.jsx
import React from "react";
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
import { Building, Tag, Calendar, Clock } from "lucide-react";

export default function TrainingCard({ training, onClick, isTagged = false }) {
	// Vérifier que les propriétés nécessaires existent
	if (!training) {
		return null;
	}

	// Formatter la date pour l'affichage
	const formatDate = (dateString) => {
		if (!dateString) return "Date inconnue";
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "short",
		});
	};

	return (
		<Card
			className="h-full hover:shadow-lg transition-shadow cursor-pointer border hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light"
			onClick={onClick}
			noPaddingTop
		>
			<div className="relative w-full h-36">
				<img
					src={training.imageUrl || "/images/png/placeholder.png"}
					alt={training.name}
					className="w-full h-full object-cover rounded-t-lg"
				/>

				{/* Source badge */}
				<div className="absolute top-2 left-2 z-10">
					{training.source?.type === "organization" ? (
						<Badge className="bg-gray-700 text-white">
							<Building className="w-3 h-3 mr-1" />
							{training.organizationName || training.source.name}
						</Badge>
					) : training.source?.type === "wisetwin" ? (
						<Badge className="bg-wisetwin-blue text-white">
							WiseTwin
						</Badge>
					) : null}
				</div>

				{/* Tag badge if applicable */}
				{isTagged && training.tagInfo && (
					<div className="absolute top-2 right-2 z-10">
						<Badge
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

				{/* Progress indicator if started */}
				{training.progress !== undefined && training.progress > 0 && (
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
				<CardDescription className="flex items-center gap-1 text-xs line-clamp-1">
					{training.lastAccessed ? (
						<>
							<Calendar className="h-3 w-3 flex-shrink-0" />
							{formatDate(training.lastAccessed)}
						</>
					) : (
						<>
							<Clock className="h-3 w-3 flex-shrink-0" />
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
	);
}
