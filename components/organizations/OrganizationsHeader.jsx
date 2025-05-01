//components/organizations/OrganizationsHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OrganizationsHeader({
	title = "Vos organisations",
	description = "Gérez les organisations auxquelles vous appartenez",
	onCreateClick,
	createButtonText = "Créer une organisation",
	showCreateButton = true,
}) {
	return (
		<div className="flex justify-between items-center mb-6">
			<div>
				<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
					{title}
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					{description}
				</p>
			</div>

			{showCreateButton && (
				<Button
					onClick={onCreateClick}
					className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
				>
					<Plus className="mr-2 h-4 w-4" />
					{createButtonText}
				</Button>
			)}
		</div>
	);
}
