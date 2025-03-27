// components/wisetrainer/courses/PersonalCoursesTab.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import CourseCard from "@/components/wisetrainer/courses/CourseCard";
import EmptyCoursesState from "@/components/wisetrainer/courses/EmptyCoursesState";
import CoursesLoading from "@/components/wisetrainer/courses/CoursesLoading";
import { Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PersonalCoursesTab = ({
	isLoading,
	courses,
	onCourseSelect,
	onUnenroll,
	onBrowseCatalog,
	containerVariants,
	itemVariants,
}) => {
	// Divisez les cours en "En cours" et "Terminés"
	const inProgressCourses = courses.filter((course) => course.progress < 100);
	const completedCourses = courses.filter(
		(course) => course.progress === 100
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
			) : courses.length === 0 ? (
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
							<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
								<p className="text-gray-500 dark:text-gray-400">
									Vous n'avez pas de formations en cours.
									Parcourez le catalogue pour commencer une
									nouvelle formation.
								</p>
								<button
									className="mt-4 text-wisetwin-blue hover:underline"
									onClick={onBrowseCatalog}
								>
									Découvrir les formations
								</button>
							</div>
						) : (
							<motion.div
								variants={containerVariants}
								initial="hidden"
								animate="visible"
								className="grid grid-cols-1 md:grid-cols-2 gap-8"
							>
								{inProgressCourses.map((course) => (
									<CourseCard
										key={course.id}
										course={course}
										onSelect={onCourseSelect}
										onUnenroll={onUnenroll}
										itemVariants={itemVariants}
									/>
								))}
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
									{completedCourses.map((course) => (
										<CourseCard
											key={course.id}
											course={course}
											onSelect={onCourseSelect}
											onUnenroll={onUnenroll}
											itemVariants={itemVariants}
										/>
									))}
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
