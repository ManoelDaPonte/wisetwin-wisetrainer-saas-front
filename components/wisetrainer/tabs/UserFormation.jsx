// components/wisetrainer/tabs/MesFormations.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import FormationCard from "@/components/wisetrainer/common/FormationCard";

const UserFormation = ({ formations, isLoading, onUnenroll }) => {
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");

	// Filtrer les formations en fonction du terme de recherche
	const filteredFormations = formations.filter(
		(formation) =>
			formation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			formation.description
				.toLowerCase()
				.includes(searchTerm.toLowerCase()) ||
			formation.category.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const handleViewFormation = (formation) => {
		// Déterminer la route en fonction de la source de la formation
		if (formation.source && formation.source.type === "organization") {
			router.push(
				`/wisetrainer/organization/${formation.source.organizationId}/${formation.id}`
			);
		} else {
			router.push(`/wisetrainer/${formation.id}`);
		}
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="flex justify-between">
					<div className="w-64 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
					<div className="w-32 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[...Array(6)].map((_, index) => (
						<div
							key={index}
							className="bg-gray-200 dark:bg-gray-700 h-80 rounded animate-pulse"
						></div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Barre de recherche */}
			<div className="flex flex-col md:flex-row gap-4 justify-between">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
					<Input
						placeholder="Rechercher une formation..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10"
					/>
				</div>
			</div>

			{/* Message si aucune formation n'est trouvée */}
			{filteredFormations.length === 0 && (
				<div className="text-center py-10">
					<p className="text-gray-500 dark:text-gray-400">
						{searchTerm
							? `Aucune formation trouvée pour "${searchTerm}".`
							: "Vous n'êtes inscrit à aucune formation pour le moment."}
					</p>
					{!searchTerm && (
						<Button
							className="mt-4 bg-wisetwin-blue hover:bg-wisetwin-blue-light"
							onClick={() =>
								router.push("/wisetrainer?tab=public")
							}
						>
							Parcourir le catalogue
						</Button>
					)}
				</div>
			)}

			{/* Affichage des formations */}
			{filteredFormations.length > 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredFormations.map((formation) => (
						<FormationCard
							key={formation.compositeId || formation.id}
							formation={formation}
							isEnrolled={true}
							onEnroll={() => {}} // Non utilisé ici
							onView={handleViewFormation}
							showProgress={true}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default UserFormation;
