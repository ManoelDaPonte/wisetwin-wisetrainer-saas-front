//app/(app)/organizations/page.jsx
"use client";
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import OrganizationsTable from "@/components/organizations/OrganizationsTable";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
import OrganizationsHeader from "@/components/organizations/OrganizationsHeader";
import { useOrganizations } from "@/lib/hooks/organizations/useOrganizations";

export default function OrganizationPage() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const {
		organizations,
		isLoading,
		createOrganization,
		navigateToOrganization,
	} = useOrganizations();

	const handleCreateOrganization = async (organizationData) => {
		const newOrganization = await createOrganization(organizationData);

		if (newOrganization) {
			setShowCreateModal(false);

			// Rediriger vers la page de l'organisation nouvellement créée
			if (newOrganization.id) {
				navigateToOrganization(newOrganization.id);
			}
		}
	};

	const handleCreateClick = () => {
		setShowCreateModal(true);
	};

	return (
		<div className="container mx-auto py-8">
			{/* Utilisation du composant d'en-tête */}
			<OrganizationsHeader onCreateClick={handleCreateClick} />

			<Card>
				<CardHeader>
					<CardTitle>Liste des organisations</CardTitle>
					<CardDescription>
						Vous trouverez ci-dessous toutes les organisations
						auxquelles vous êtes affilié
					</CardDescription>
				</CardHeader>
				<CardContent>
					<OrganizationsTable
						organizations={organizations}
						isLoading={isLoading}
						onManage={navigateToOrganization}
					/>
				</CardContent>
			</Card>

			{/* Modal de création d'organisation */}
			{showCreateModal && (
				<CreateOrganizationModal
					isOpen={showCreateModal}
					onClose={() => setShowCreateModal(false)}
					onSubmit={handleCreateOrganization}
				/>
			)}
		</div>
	);
}
