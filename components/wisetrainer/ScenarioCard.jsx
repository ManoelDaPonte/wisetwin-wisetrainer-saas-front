import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ScenarioCard = ({ scenario, onClick }) => {
	// Utiliser une image par défaut si l'imageUrl du scénario n'est pas disponible
	const imageUrl = scenario.imageUrl || "/images/png/placeholder.png";

	return (
		<div
			className={cn(
				"bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden",
				"transition-transform duration-300 transform hover:scale-105 cursor-pointer"
			)}
			onClick={onClick}
		>
			{/* Image du scénario */}
			<div className="relative h-48 w-full">
				<div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 animate-pulse"></div>
				<div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
					{/* Placeholder en attendant que les vraies images soient disponibles */}
					{scenario.workerId}
				</div>
			</div>

			{/* Contenu du card */}
			<div className="p-4">
				<h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
					{scenario.title}
				</h3>
				<p className="text-sm text-gray-600 dark:text-gray-300">
					{scenario.description}
				</p>
				<div className="mt-4 flex justify-end">
					<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
						Commencer
					</span>
				</div>
			</div>
		</div>
	);
};

export default ScenarioCard;
