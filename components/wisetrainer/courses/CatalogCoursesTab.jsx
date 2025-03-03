//components/wisetrainer/courses/CatalogCoursesTab.jsx
import React from "react";
import { motion } from "framer-motion";
import CatalogCourseCard from "@/components/wisetrainer/courses/CatalogCourseCard";
import CoursesLoading from "@/components/wisetrainer/courses/CoursesLoading";
const CatalogCoursesTab = ({
	isLoading,
	courses,
	personalCourses,
	onEnroll,
	onToggleInfo,
	flippedCardId,
	isImporting,
	containerVariants,
	itemVariants,
}) => {
	return (
		<>
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
					Formations disponibles
				</h2>
				<p className="text-gray-600 dark:text-gray-300">
					Découvrez et inscrivez-vous à nos formations
					professionnelles en réalité virtuelle
				</p>
			</div>
			{isLoading ? (
				<CoursesLoading />
			) : (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{courses.map((course) => (
						<CatalogCourseCard
							key={course.id}
							course={course}
							onEnroll={onEnroll}
							onToggleInfo={onToggleInfo}
							flippedCardId={flippedCardId}
							isImporting={isImporting}
							isEnrolled={personalCourses.some(
								(c) => c.id === course.id
							)}
							itemVariants={itemVariants}
						/>
					))}
				</motion.div>
			)}
		</>
	);
};
export default CatalogCoursesTab;
