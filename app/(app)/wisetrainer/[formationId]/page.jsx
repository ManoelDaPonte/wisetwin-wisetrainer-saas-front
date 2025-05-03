// app/(app)/wisetrainer/[formationId]/page.jsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useCurrentFormation } from "@/lib/hooks/formations/currentFormation/useCurrentFormation";
import { useFormations } from "@/lib/hooks/formations/useFormations";
import FormationHeader from "@/components/wisetrainer/formation/FormationHeader";
import FormationTabs from "@/components/wisetrainer/formation/FormationTabs";
import UnenrollModal from "@/components/wisetrainer/modals/UnenrollModal";
import { Skeleton } from "@/components/ui/skeleton";

export default function FormationDetailPage() {
	const router = useRouter();
	const params = useParams();
	const formationId = params?.formationId;

	const [showUnenrollModal, setShowUnenrollModal] = useState(false);

	// Utiliser le hook pour charger les détails de la formation
	const { formation, isLoading, error } = useCurrentFormation(formationId);

	// Utiliser le hook des formations pour les actions d'inscription/désinscription
	const { enrollFormation, unenrollFormation } = useFormations();

	// Fonctions de navigation
	const handleBack = () => {
		router.push("/wisetrainer");
	};

	// Gérer l'inscription
	const handleEnroll = async () => {
		if (!formation) return;

		const result = await enrollFormation(formation);
		if (result.success) {
			// Recharger la page pour voir les mises à jour
			window.location.reload();
		}
	};

	// Gérer la désinscription
	const handleUnenroll = () => {
		setShowUnenrollModal(true);
	};

	const confirmUnenroll = async () => {
		if (!formation) return;

		const result = await unenrollFormation(formation);
		if (result.success) {
			setShowUnenrollModal(false);
			router.push("/wisetrainer");
		}
	};

	// Afficher un état de chargement
	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<Skeleton className="h-10 w-32 mb-4" />
				<div className="space-y-4 mb-8">
					<Skeleton className="h-12 w-3/4" />
					<div className="flex gap-2">
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-24" />
					</div>
					<Skeleton className="h-4 w-64" />
				</div>

				<div className="flex gap-2 mb-6">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-32" />
				</div>

				<Skeleton className="h-64 w-full rounded-lg" />
			</div>
		);
	}

	// Afficher un message d'erreur
	if (error || !formation) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center py-12">
					<div className="text-red-500 text-xl mb-4">
						{error || "Formation non trouvée"}
					</div>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						Impossible de charger cette formation. Veuillez
						réessayer plus tard.
					</p>
					<button
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white px-4 py-2 rounded-md"
						onClick={handleBack}
					>
						Retour aux formations
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			{/* En-tête de la formation */}
			<FormationHeader
				formation={formation}
				onBack={handleBack}
				onEnroll={handleEnroll}
				onUnenroll={handleUnenroll}
			/>

			{/* Onglets de la formation */}
			<FormationTabs formation={formation} />

			{/* Modal de désinscription */}
			<UnenrollModal
				isOpen={showUnenrollModal}
				onClose={() => setShowUnenrollModal(false)}
				onConfirm={confirmUnenroll}
				courseName={formation?.name || ""}
			/>
		</div>
	);
}
