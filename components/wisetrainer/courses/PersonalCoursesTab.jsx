//components/wisetrainer/courses/PersonalCoursesTab.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "@/components/wisetrainer/courses/CourseCard";
import EmptyCoursesState from "@/components/wisetrainer/courses/EmptyCoursesState";
import CoursesLoading from "@/components/wisetrainer/courses/CoursesLoading";
import { Building, BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PersonalCoursesTab = ({
	isLoading,
	courses = [], // Valeur par défaut
	onCourseSelect,
	onUnenroll,
	onBrowseCatalog,
	containerVariants,
	itemVariants,
}) => {
	// S'assurer que courses est un tableau valide
	const validCourses = Array.isArray(courses) ? courses : [];

	// Divisez les cours en "En cours" et "Terminés"
	const inProgressCourses = validCourses.filter(
		(course) => course && course.progress < 100
	);
	const completedCourses = validCourses.filter(
		(course) => course && course.progress === 100
	);

	// État pour contrôler si la section "Terminés" est réduite ou développée
	const [showCompleted, setShowCompleted] = useState(true);

	return (
		<>
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
					Vos programmes de formation
				</h2>
			</div>
			{isLoading ? (
				<CoursesLoading />
			) : validCourses.length === 0 ? (
				<EmptyCoursesState onBrowseCatalog={onBrowseCatalog} />
			) : (
				<div className="space-y-10">
					{/* Section des formations en cours */}
					<div>
						<h3 className="text-lg font-medium mb-4 text-wisetwin-darkblue dark:text-white flex items-center">
							Formations en cours
							{inProgressCourses.length > 0 && (
								<Badge
									className="ml-2 bg-blue-500"
									variant="secondary"
								>
									{inProgressCourses.length}
								</Badge>
							)}
						</h3>

						{inProgressCourses.length === 0 ? (
							<Card className="border-gray-200 dark:border-gray-700">
								<CardContent className="flex flex-col items-center justify-center py-10 text-center">
									<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
										<BookOpen className="h-8 w-8 text-wisetwin-blue dark:text-wisetwin-blue-light" />
									</div>
									<h4 className="text-lg font-medium mb-2">
										Aucune formation en cours
									</h4>
									<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
										Parcourez notre catalogue et commencez
										une nouvelle formation pour développer
										vos compétences.
									</p>
									<Button
										className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white flex items-center gap-2"
										onClick={onBrowseCatalog}
									>
										Découvrir les formations
										<ArrowRight className="h-4 w-4" />
									</Button>
								</CardContent>
							</Card>
						) : (
							<motion.div
								variants={containerVariants}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 md:grid-cols-2 gap-8"
							>
								{inProgressCourses.map(
									(course) =>
										course && (
											<CourseCard
												key={
													course.compositeId ||
													`${course.id}_${
														course.source?.type
													}_${
														course.source
															?.organizationId ||
														"wisetwin"
													}`
												}
												course={course}
												onSelect={onCourseSelect}
												onUnenroll={onUnenroll}
												itemVariants={itemVariants}
											/>
										)
								)}
							</motion.div>
						)}
					</div>

					{/* Section des formations terminées */}
					{completedCourses.length > 0 && (
						<div>
							<h3
								className="text-lg font-medium mb-4 text-wisetwin-darkblue dark:text-white flex items-center cursor-pointer"
								onClick={() => setShowCompleted(!showCompleted)}
							>
								Formations terminées
								<Badge
									className="ml-2 bg-green-500"
									variant="secondary"
								>
									{completedCourses.length}
								</Badge>
								<span className="ml-2 text-sm text-gray-500">
									{showCompleted
										? "(Cliquer pour masquer)"
										: "(Cliquer pour afficher)"}
								</span>
							</h3>

							{showCompleted && (
								<motion.div
									variants={containerVariants}
									initial="hidden"
									animate="visible"
									className="grid grid-cols-1 md:grid-cols-2 gap-8"
								>
									{completedCourses.map(
										(course) =>
											course && (
												<CourseCard
													key={
														course.compositeId ||
														`${course.id}_${
															course.source?.type
														}_${
															course.source
																?.organizationId ||
															"wisetwin"
														}`
													}
													course={course}
													onSelect={onCourseSelect}
													onUnenroll={onUnenroll}
													itemVariants={itemVariants}
												/>
											)
									)}
								</motion.div>
							)}
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default PersonalCoursesTab;
