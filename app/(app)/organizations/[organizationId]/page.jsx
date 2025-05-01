//app/(app)/organizations/[organizationId]/page.jsx
"use client";
import React from "react";
import { useRouter, useParams } from "next/navigation";
import CurrentOrganizationHeader from "@/components/organizations/currentOrganization/CurrentOrganizationHeader";
import CurrentOrganizationTabs from "@/components/organizations/currentOrganization/CurrentOrganizationTabs";
import { useCurrentOrganization } from "@/lib/hooks/organizations/currentOrganization/useCurrentOrganization";

export default function OrganizationManagementPage() {
	const router = useRouter();
	const params = useParams();
	const organizationId = params?.organizationId;

	// Utilisation du hook pour gérer les données de l'organisation
	const { organization, isLoading, error, fetchOrganizationDetails } =
		useCurrentOrganization(organizationId);

	const handleBack = () => {
		router.push("/organizations");
	};

	// Afficher un état de chargement
	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="flex justify-between items-center mb-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
					</div>
				</div>
				<div className="animate-pulse">
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
					<div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
				</div>
			</div>
		);
	}

	// Si nous n'avons pas d'organisation (après le chargement), afficher un message d'erreur
	if (!organization) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center py-12">
					<div className="text-red-500 text-xl mb-4">
						Organisation non trouvée
					</div>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						L'organisation demandée n'existe pas ou vous n'avez pas
						les droits pour y accéder.
					</p>
					<Button onClick={handleBack}>
						Retour aux organisations
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			{/* Utilisation du composant OrganizationHeader */}
			<CurrentOrganizationHeader
				organization={organization}
				onBackClick={handleBack}
			/>

			{/* Utiliser le composant OrganizationTabs avec la fonction fetchOrganization du hook */}
			<CurrentOrganizationTabs
				organization={organization}
				onDataChange={fetchOrganizationDetails}
			/>
		</div>
	);
}
