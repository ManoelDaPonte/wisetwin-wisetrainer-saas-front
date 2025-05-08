//components/wisetrainer/courses/CatalogCoursesTab.jsx
import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import CatalogCourseCard from "@/components/wisetrainer/courses/CatalogCourseCard";
import CoursesLoading from "@/components/wisetrainer/courses/CoursesLoading";
import EmptyStateCard from "@/components/wisetrainer/courses/EmptyStateCard";

const CatalogCoursesTab = ({
	isLoading,
	courses = [], // Valeur par défaut pour éviter les erreurs si undefined
	personalCourses = [], // Valeur par défaut
	onEnroll,
	onToggleInfo,
	flippedCardId,
	isImporting,
	containerVariants,
	itemVariants,
	isUserEnrolled, // Accepter la fonction de vérification
}) => {
	// Vérifier si courses est un tableau valide
	const validCourses = Array.isArray(courses) ? courses : [];
	const validPersonalCourses = Array.isArray(personalCourses)
		? personalCourses
		: [];

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
			) : validCourses.length === 0 ? (
				<EmptyStateCard
					icon={<Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />}
					title="Aucune formation disponible"
					description="Nous n'avons pas trouvé de formations disponibles dans le catalogue pour le moment."
				/>
			) : (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 gap-8"
				>
					{validCourses.map(
						(course) =>
							course && (
								<CatalogCourseCard
									key={course.compositeId || course.id} // Utiliser l'ID composite si disponible
									course={{
										...course,
										// Ajouter WiseTwin comme source s'il n'y en a pas déjà une
										source: course.source || {
											type: "wisetwin",
											name: "WiseTwin",
										},
									}}
									onEnroll={onEnroll}
									onToggleInfo={onToggleInfo}
									flippedCardId={flippedCardId}
									isImporting={isImporting === course.id}
									isEnrolled={
										isUserEnrolled
											? isUserEnrolled(
													course,
													validPersonalCourses
											  )
											: false
									}
									itemVariants={itemVariants}
								/>
							)
					)}
				</motion.div>
			)}
		</>
	);
};

export default CatalogCoursesTab;
