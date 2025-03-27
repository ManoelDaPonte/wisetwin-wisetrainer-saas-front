// components/wisetrainer/courses/CourseCard.jsx
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
import { Clock, BookOpen, Calendar, Building, Sparkles } from "lucide-react";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

const CourseCard = ({ course, onSelect, onUnenroll, itemVariants }) => {
	// Formatage de la date
	const formatDate = (dateString) => {
		if (!dateString) return "Date inconnue";
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Gérer le clic sur la carte
	const handleCardClick = () => {
		onSelect(course);
	};

	// Déterminer la source de la formation (WiseTwin par défaut ou organisation)
	const source = course.source || { type: "wisetwin", name: "WiseTwin" };
	const isOrganizationCourse = source.type === "organization";

	return (
		<motion.div variants={itemVariants}>
			<Card
				className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
				noPaddingTop
				onClick={handleCardClick}
			>
				{/* Image du cours couvrant toute la largeur */}
				<div className="relative w-full h-52 overflow-hidden rounded-t-lg">
					<Image
						src={
							course.imageUrl || WISETRAINER_CONFIG.DEFAULT_IMAGE
						}
						alt={course.name}
						fill
						className="object-cover"
						onError={(e) => {
							e.target.src = WISETRAINER_CONFIG.DEFAULT_IMAGE;
						}}
					/>
					{/* Badge de difficulté superposé sur l'image */}
					<div className="absolute top-3 right-3">
						<Badge
							variant="outline"
							className="bg-white/90 dark:bg-black/70 text-blue-700 dark:text-blue-200 font-medium"
						>
							{course.difficulty || "Intermédiaire"}
						</Badge>
					</div>

					{/* Badge de provenance sur l'image */}
					<div className="absolute top-3 left-3">
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
									{source.name}
								</>
							) : (
								<>
									<Sparkles className="w-3 h-3 mr-1" />
									WiseTwin
								</>
							)}
						</Badge>
					</div>

					<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
						<Badge
							className={
								course.progress === 100
									? "bg-green-500"
									: course.progress > 0
									? "bg-blue-500"
									: "bg-gray-500"
							}
						>
							{course.progress === 100
								? "Terminé"
								: course.progress > 0
								? "En cours"
								: "Non commencé"}
						</Badge>
					</div>
				</div>

				<CardHeader className="pb-2">
					<CardTitle className="text-xl">{course.name}</CardTitle>
					<CardDescription className="flex items-center gap-1 text-sm">
						<Calendar className="h-4 w-4" />
						Dernier accès: {formatDate(course.lastAccessed)}
					</CardDescription>
				</CardHeader>

				<CardContent className="flex-grow">
					<p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
						{course.description}
					</p>

					<div className="space-y-4">
						<div>
							<div className="flex justify-between mb-1">
								<span className="text-sm text-muted-foreground">
									Progression
								</span>
								<span className="text-sm font-medium">
									{course.progress}%
								</span>
							</div>
							<Progress value={course.progress} className="h-2" />
						</div>

						<div className="pt-3 border-t border-gray-100 dark:border-gray-800">
							<h4 className="text-sm font-medium mb-2 flex items-center gap-1">
								<BookOpen className="h-4 w-4" />
								Modules ({course.completedModules || 0}/
								{course.totalModules || 3})
							</h4>
							<ul className="space-y-1">
								{course.modules?.slice(0, 3).map((module) => (
									<li
										key={module.id}
										className="flex items-center justify-between text-sm"
									>
										<div className="flex items-center">
											<div
												className={`w-2 h-2 rounded-full mr-2 ${
													module.completed
														? "bg-green-500"
														: "bg-gray-300 dark:bg-gray-600"
												}`}
											></div>
											<span
												className={
													module.completed
														? ""
														: "text-gray-500"
												}
											>
												{module.title ||
													`Module ${module.id}`}
											</span>
										</div>
										<span
											className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
												module.completed
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
													: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
											}`}
										>
											{module.completed
												? `${module.score || 0}%`
												: "0%"}
										</span>
									</li>
								))}
								{(course.totalModules > 3 ||
									(course.modules?.length || 0) > 3) && (
									<li className="text-xs text-gray-500 pl-4">
										+{" "}
										{(course.totalModules ||
											course.modules?.length ||
											3) - 3}{" "}
										autres modules
									</li>
								)}
							</ul>
						</div>
					</div>
				</CardContent>

				<CardFooter className="flex gap-2 mt-auto pt-2">
					<Button
						className="flex-1"
						onClick={(e) => {
							e.stopPropagation(); // Empêcher la propagation du clic au parent
							onSelect(course);
						}}
					>
						{course.progress > 0 ? "Continuer" : "Commencer"}
					</Button>
					<Button
						variant="outline"
						className="flex-shrink-0"
						onClick={(e) => {
							e.stopPropagation(); // Empêcher la propagation du clic au parent
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
