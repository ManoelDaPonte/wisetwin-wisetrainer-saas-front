//components/wisetrainer/courses/EmptyCoursesState.jsx
import React from "react";
import { BookOpen } from "lucide-react";
import EmptyStateCard from "./EmptyStateCard";

const EmptyCoursesState = ({ onBrowseCatalog }) => {
	return (
		<EmptyStateCard
			icon={<BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />}
			title="Aucune formation en cours"
			description="Vous n'avez pas encore commencé de formation. Découvrez notre catalogue et commencez votre parcours d'apprentissage dès maintenant."
			actionFn={onBrowseCatalog}
			actionText="Parcourir le catalogue"
		/>
	);
};

export default EmptyCoursesState;
