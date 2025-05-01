// app/(app)/organizations/page.jsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import OrganizationsTable from "@/components/organizations/OrganizationsTable";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
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

	return (
		<div className="container mx-auto py-8">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
						Vos organisations
					</h1>
					<p className="text-gray-600 dark:text-gray-300">
						Gérez les organisations auxquelles vous appartenez
					</p>
				</div>
				<Button
					onClick={() => setShowCreateModal(true)}
					className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
				>
					<Plus className="mr-2 h-4 w-4" />
					Créer une organisation
				</Button>
			</div>

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
