//components/wisetrainer/courses/CatalogCourseCard.jsx
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { Clock } from "lucide-react";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
const CatalogCourseCard = ({
	course,
	onEnroll,
	onToggleInfo,
	flippedCardId,
	isImporting,
	isEnrolled,
	itemVariants,
}) => {
	return (
		<motion.div variants={itemVariants}>
			<Card className="h-full hover:shadow-lg transition-shadow duration-300">
				<div className="relative h-48 w-full">
					<Image
						src={
							course.imageUrl || WISETRAINER_CONFIG.DEFAULT_IMAGE
						}
						alt={course.name}
						fill
						className="object-cover rounded-t-lg"
						onError={(e) => {
							e.target.src = WISETRAINER_CONFIG.DEFAULT_IMAGE;
						}}
					/>
				</div>
				<CardHeader>
					<div className="flex justify-between items-start">
						<CardTitle>{course.name}</CardTitle>
						<Badge
							variant="outline"
							className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
						>
							{course.difficulty}
						</Badge>
					</div>
					<CardDescription className="flex items-center">
						<Clock className="h-4 w-4 mr-1" />
						Durée: {course.duration}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
						{course.description}
					</p>
					{flippedCardId === course.id && (
						<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
							<h4 className="font-semibold mb-2">
								Ce que vous apprendrez:
							</h4>
							<ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
								{course.modules
									?.slice(0, 3)
									.map((module) => (
										<li key={module.id}>{module.title}</li>
									)) || (
									<>
										<li>
											Protocoles de sécurité et bonnes
											pratiques
										</li>
										<li>Évaluation des risques</li>
										<li>
											Procédures d'intervention d'urgence
										</li>
									</>
								)}
							</ul>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex gap-4">
					<Button
						className="flex-1 bg-wisetwin-blue hover:bg-wisetwin-blue-light"
						onClick={() => onEnroll(course)}
						disabled={isImporting === course.id || isEnrolled}
					>
						{isImporting === course.id
							? "Inscription..."
							: isEnrolled
							? "Déjà inscrit"
							: "S'inscrire"}
					</Button>
					<Button
						className="flex-1"
						variant="outline"
						onClick={(e) => {
							e.preventDefault();
							onToggleInfo(course.id);
						}}
					>
						{flippedCardId === course.id
							? "Moins d'infos"
							: "Plus d'infos"}
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
};
export default CatalogCourseCard;
