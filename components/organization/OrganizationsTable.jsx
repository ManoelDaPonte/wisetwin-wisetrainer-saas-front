// components/organization/OrganizationsTable.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Users, Calendar, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function OrganizationsTable({
	organizations,
	isLoading,
	onManage,
}) {
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	// Afficher un état de chargement
	if (isLoading) {
		return (
			<div className="w-full">
				<div className="animate-pulse space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="flex items-center justify-between p-4 border rounded-lg"
						>
							<div className="flex items-center space-x-4">
								<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
								<div>
									<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
								</div>
							</div>
							<div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Afficher un message si aucune organisation
	if (!organizations || organizations.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 p-6 mb-4">
					<Users className="w-8 h-8 text-wisetwin-blue" />
				</div>
				<h3 className="text-lg font-medium mb-2">
					Aucune organisation trouvée
				</h3>
				<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
					Vous n'appartenez à aucune organisation pour le moment.
					Créez-en une ou demandez à être invité.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{organizations.map((org) => (
				<div
					key={org.id}
					className="flex items-center justify-between p-4 border rounded-lg hover:border-wisetwin-blue transition-colors"
				>
					<div className="flex items-center space-x-4">
						{/* <div className="relative w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
							{org.logoUrl ? (
								<Image
									src={org.logoUrl}
									alt={org.name}
									fill
									className="object-cover"
									onError={(e) => {
										e.target.src =
											"/images/png/placeholder.png";
									}}
								/>
							) : (
								<div className="flex items-center justify-center h-full">
									<span className="text-xl font-bold text-wisetwin-blue">
										{org.name.charAt(0).toUpperCase()}
									</span>
								</div>
							)}
						</div> */}
						<div>
							<h3 className="font-semibold">{org.name}</h3>
							<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
								<span className="flex items-center">
									<Users className="w-4 h-4 mr-1" />
									{org.membersCount || 0} membres
								</span>
								<span className="flex items-center">
									<Calendar className="w-4 h-4 mr-1" />
									Créée le {formatDate(org.createdAt)}
								</span>
							</div>
						</div>
					</div>

					<div className="flex space-x-2">
						{(org.userRole === "OWNER" ||
							org.userRole === "ADMIN") && (
							<Button
								onClick={() => onManage(org.id)}
								className="bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light text-white"
							>
								<Settings className="w-4 h-4 mr-2" />
								Gérer
							</Button>
						)}
						{org.userRole === "MEMBER" && (
							<Button
								variant="outline"
								onClick={() => onManage(org.id)}
							>
								<ExternalLink className="w-4 h-4 mr-2" />
								Voir
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
