"use client";
import React from "react";
import WiseTrainerCourses from "@/components/wisetrainer/WiseTrainerCourses";

export default function WiseTrainerPage() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-6">
				WiseTrainer™ - Formation en Réalité Virtuelle
			</h1>
			<p className="text-gray-600 dark:text-gray-300 mb-8">
				Parcourez nos modules de formation industrielle en 3D et
				développez vos compétences
			</p>

			<WiseTrainerCourses />
		</div>
	);
}
