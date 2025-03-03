//components/wisetrainer/courses/PersonalCoursesTab.jsx
import React from "react";
import { motion } from "framer-motion";
import CourseCard from "@/components/wisetrainer/courses/CourseCard";
import EmptyCoursesState from "@/components/wisetrainer/courses/EmptyCoursesState";
import CoursesLoading from "@/components/wisetrainer/courses/CoursesLoading";
const PersonalCoursesTab = ({
	isLoading,
	courses,
	onCourseSelect,
	onUnenroll,
	onBrowseCatalog,
	containerVariants,
	itemVariants,
}) => {
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
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 gap-8" // Augmenter l'espace entre les cartes
				>
					{courses.map((course) => (
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
		</>
	);
};
export default PersonalCoursesTab;
