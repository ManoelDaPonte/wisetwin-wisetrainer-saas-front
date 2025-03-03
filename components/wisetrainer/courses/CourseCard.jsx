//components/wisetrainer/courses/CourseCard.jsx
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
import { Progress } from "@/components/ui/progress";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";
const CourseCard = ({ course, onSelect, onUnenroll, itemVariants }) => {
	return (
		<motion.div variants={itemVariants}>
			<Card
				className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light"
				onClick={() => onSelect(course)}
			>
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
							{course.difficulty || "Intermédiaire"}
						</Badge>
					</div>
					<CardDescription>
						Dernier accès:{" "}
						{new Date(course.lastAccessed).toLocaleDateString()}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
						{course.description}
					</p>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">
								Progression
							</span>
							<span className="text-sm font-medium">
								{course.progress}%
							</span>
						</div>
						<Progress value={course.progress} className="h-2" />
						<div className="text-sm text-gray-500 mt-2">
							{course.completedModules}/{course.totalModules || 3}{" "}
							modules complétés
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex gap-2">
					<Button
						className="flex-1"
						onClick={(e) => {
							e.stopPropagation();
							onSelect(course);
						}}
					>
						{course.progress > 0 ? "Continuer" : "Commencer"}
					</Button>
					<Button
						variant="outline"
						className="flex-shrink-0"
						onClick={(e) => {
							e.stopPropagation();
							onUnenroll(course);
						}}
					>
						Supprimer
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
};
export default CourseCard;
