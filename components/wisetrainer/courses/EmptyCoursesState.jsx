//components/wisetrainer/courses/EmptyCoursesState.jsx
import React from "react";
import { Button } from "@/components/ui/button";
const EmptyCoursesState = ({ onBrowseCatalog }) => {
	return (
		<div className="text-center py-16">
			<div className="text-4xl mb-4">🎓</div>
			<h3 className="text-lg font-medium mb-2">Aucune formation</h3>
			<p className="text-gray-500 dark:text-gray-400 mb-6">
				Inscrivez-vous à une formation depuis notre catalogue
			</p>
			<Button
				className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
				onClick={onBrowseCatalog}
			>
				Parcourir le catalogue
			</Button>
		</div>
	);
};
export default EmptyCoursesState;
