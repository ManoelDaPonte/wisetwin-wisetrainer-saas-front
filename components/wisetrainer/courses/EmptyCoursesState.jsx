//components/wisetrainer/courses/EmptyCoursesState.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const EmptyCoursesState = ({ onBrowseCatalog }) => {
	return (
		<Card className="w-full">
			<CardContent className="text-center py-12">
				<div className="flex justify-center mb-6">
					<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full">
						<BookOpen className="w-10 h-10 text-gray-400 dark:text-gray-500" />
					</div>
				</div>
				<h3 className="text-lg font-medium mb-2">
					Aucune formation en cours
				</h3>
				<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
					Vous n'avez pas encore commencé de formation. Découvrez
					notre catalogue et commencez votre parcours d'apprentissage
					dès maintenant.
				</p>
				<Button
					className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
					onClick={onBrowseCatalog}
				>
					Parcourir le catalogue
					<ArrowRight className="ml-2 h-4 w-4" />
				</Button>
			</CardContent>
		</Card>
	);
};

export default EmptyCoursesState;
