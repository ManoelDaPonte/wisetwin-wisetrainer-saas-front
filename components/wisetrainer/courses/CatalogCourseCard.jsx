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
import { Clock, BookOpen, Info } from "lucide-react";
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
	const isFlipped = flippedCardId === course.id;

	return (
		<motion.div variants={itemVariants}>
			<Card
				className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300"
				noPaddingTop
			>
				{/* Image du cours couvrant toute la largeur */}
				{!isFlipped && (
					<div className="relative w-full h-52 overflow-hidden rounded-t-lg">
						<Image
							src={
								course.imageUrl ||
								WISETRAINER_CONFIG.DEFAULT_IMAGE
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
					</div>
				)}

				{isFlipped ? (
					<div className="flex-grow pt-6">
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle className="text-xl">
									{course.name}
								</CardTitle>
								<Badge
									variant="outline"
									className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
								>
									{course.difficulty}
								</Badge>
							</div>
							<CardDescription className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								Durée: {course.duration}
							</CardDescription>
						</CardHeader>

						<CardContent className="flex-grow">
							<div className="space-y-4">
								<div>
									<h4 className="font-semibold text-md mb-2 flex items-center gap-1">
										<BookOpen className="h-4 w-4" />
										Contenu de la formation:
									</h4>
									<ul className="space-y-2">
										{course.modules?.map((module) => (
											<li
												key={module.id}
												className="flex items-start gap-2"
											>
												<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
												<div>
													<div className="font-medium">
														{module.title}
													</div>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														{module.description}
													</p>
												</div>
											</li>
										))}
										{!course.modules && (
											<>
												<li className="flex items-start gap-2">
													<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
													<div>
														<div className="font-medium">
															Protocoles de
															sécurité
														</div>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Apprentissage des
															bonnes pratiques et
															protocoles de
															sécurité
														</p>
													</div>
												</li>
												<li className="flex items-start gap-2">
													<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
													<div>
														<div className="font-medium">
															Évaluation des
															risques
														</div>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Méthodes
															d'identification et
															d'évaluation des
															risques
														</p>
													</div>
												</li>
												<li className="flex items-start gap-2">
													<div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
													<div>
														<div className="font-medium">
															Procédures d'urgence
														</div>
														<p className="text-sm text-gray-600 dark:text-gray-400">
															Interventions en cas
															d'urgence et mesures
															préventives
														</p>
													</div>
												</li>
											</>
										)}
									</ul>
								</div>

								<div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
									<h4 className="font-semibold text-md mb-2">
										À propos de cette formation:
									</h4>
									<p className="text-sm text-gray-600 dark:text-gray-300">
										{course.description}
									</p>
								</div>
							</div>
						</CardContent>
					</div>
				) : (
					<>
						<CardHeader>
							<CardTitle className="text-xl">
								{course.name}
							</CardTitle>
							<CardDescription className="flex items-center gap-1">
								<Clock className="h-4 w-4" />
								Durée: {course.duration}
							</CardDescription>
						</CardHeader>

						<CardContent className="flex-grow">
							<p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
								{course.description}
							</p>

							<div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
								<BookOpen className="h-4 w-4" />
								<span>
									{course.modules?.length || 3} modules
								</span>
							</div>
						</CardContent>
					</>
				)}

				<CardFooter className="flex gap-2 mt-auto pt-2">
					<Button
						className={`flex-1 ${
							isFlipped
								? "bg-wisetwin-blue hover:bg-wisetwin-blue-light"
								: "bg-wisetwin-blue hover:bg-wisetwin-blue-light"
						}`}
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
						<Info className="h-4 w-4 mr-1" />
						{isFlipped ? "Moins d'infos" : "Plus d'infos"}
					</Button>
				</CardFooter>
			</Card>
		</motion.div>
	);
};

export default CatalogCourseCard;
