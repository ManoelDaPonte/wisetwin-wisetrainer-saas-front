//components/organizations/organization/members/MemberTagsDisplay.jsx
import React from "react";

export default function MemberTagsDisplay({ tags }) {
	if (!tags || tags.length === 0) {
		return <span className="text-gray-400 text-sm">Aucun tag</span>;
	}

	return (
		<div className="flex flex-wrap gap-1.5 max-w-xs">
			{tags.map((tag) => (
				<div
					key={tag.id}
					className="w-4 h-4 rounded-full"
					style={{ backgroundColor: tag.color }}
					title={tag.name} // Ajouter un titre pour montrer le nom en survol
				></div>
			))}

			{/* Afficher un indicateur si plus de 5 tags */}
			{tags.length > 5 && (
				<div className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 text-xs">
					+{tags.length - 5}
				</div>
			)}
		</div>
	);
}
