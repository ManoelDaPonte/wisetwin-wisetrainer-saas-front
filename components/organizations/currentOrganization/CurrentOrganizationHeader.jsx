//components/organizations/currentOrganization/OrganizationHeader.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Image from "next/image";

export default function OrganizationHeader({ organization, onBackClick }) {
	if (!organization) {
		return null;
	}

	return (
		<div className="mb-6">
			<Button variant="outline" onClick={onBackClick} className="mb-4">
				<ArrowLeft className="w-4 h-4 mr-2" />
				Retour aux organisations
			</Button>

			<div className="flex items-center gap-6 mb-6">
				<div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
					{organization.logoUrl ? (
						<Image
							src={organization.logoUrl}
							alt={organization.name}
							fill
							className="object-cover"
							onError={(e) => {
								e.target.src = "/images/png/placeholder.png";
							}}
						/>
					) : (
						<div className="flex items-center justify-center h-full">
							<span className="text-2xl font-bold text-wisetwin-blue">
								{organization.name.charAt(0).toUpperCase()}
							</span>
						</div>
					)}
				</div>
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white">
						{organization.name}
					</h1>
					<p className="text-gray-600 dark:text-gray-300 mt-1">
						{organization.description || "Aucune description"}
					</p>
					<div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
						<Users className="w-4 h-4 mr-1" />
						{organization.membersCount} membres
					</div>
				</div>
			</div>
		</div>
	);
}
