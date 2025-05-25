"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, Settings, Users, Tag, Mail } from "lucide-react";
import { useOrganization } from "@/lib/hooks/useOrganization";
import CallToAction from "@/components/common/CallToAction";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
import OrganizationTabs from "@/components/organizations/organization/OrganizationTabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationPage() {
	const router = useRouter();
	const {
		currentOrganization,
		currentOrganizationId,
		organizations,
		hasOrganizations,
		isLoading,
		createOrganization,
		selectOrganization,
	} = useOrganization();

	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Récupérer l'organisation active depuis le localStorage
	useEffect(() => {
		const storedContext = localStorage.getItem("wisetwin-active-context");
		if (storedContext) {
			try {
				const context = JSON.parse(storedContext);
				if (context.type === "organization" && context.id) {
					// Sélectionner l'organisation sans navigation (navigate = false)
					if (currentOrganizationId !== context.id) {
						selectOrganization(context.id, false);
					}
				}
			} catch (error) {
				console.error("Erreur lors de la lecture du contexte:", error);
			}
		}
	}, [currentOrganizationId, selectOrganization]);

	// Gérer la création d'organisation
	const handleCreateOrganization = async (orgData) => {
		try {
			const newOrg = await createOrganization(orgData);
			if (newOrg) {
				// Mettre à jour le contexte dans localStorage
				const newContext = {
					type: "organization",
					id: newOrg.id,
					name: newOrg.name,
					logoUrl: newOrg.logoUrl,
					azureContainer: newOrg.azureContainer,
				};
				localStorage.setItem(
					"wisetwin-active-context",
					JSON.stringify(newContext)
				);

				// Notifier la sidebar du changement de contexte
				window.dispatchEvent(new Event("wisetwin-context-changed"));

				setIsCreateModalOpen(false);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la création de l'organisation:",
				error
			);
			throw error;
		}
	};

	// État de chargement
	if (isLoading) {
		return (
			<div className="container mx-auto py-8 space-y-6">
				<div className="space-y-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-96" />
				</div>
				<Skeleton className="h-64 w-full" />
			</div>
		);
	}

	// Aucune organisation ou mode personnel actif
	const storedContext = localStorage.getItem("wisetwin-active-context");
	let isPersonalMode = true;

	if (storedContext) {
		try {
			const context = JSON.parse(storedContext);
			isPersonalMode = context.type !== "organization";
		} catch {
			isPersonalMode = true;
		}
	}

	if (isPersonalMode || !currentOrganization) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="max-w-md mx-auto px-4">
					<CallToAction
						title="Aucune organisation sélectionnée"
						description="Vous devez sélectionner ou créer une organisation pour accéder à cette page. Les organisations vous permettent de gérer des équipes et des formations."
						actionText="Créer une organisation"
						onAction={() => setIsCreateModalOpen(true)}
						icon={Building2}
						size="lg"
					/>
				</div>

				{/* Modale de création d'organisation */}
				<CreateOrganizationModal
					isOpen={isCreateModalOpen}
					onClose={() => setIsCreateModalOpen(false)}
					onSubmit={handleCreateOrganization}
				/>
			</div>
		);
	}

	// Affichage de la gestion de l'organisation
	return (
		<div className="container mx-auto py-8">
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-2">
					{currentOrganization.logoUrl ? (
						<img
							src={currentOrganization.logoUrl}
							alt={currentOrganization.name}
							className="w-10 h-10 rounded-lg object-cover"
						/>
					) : (
						<div className="w-10 h-10 rounded-lg bg-wisetwin-darkblue flex items-center justify-center">
							<Building2 className="w-5 h-5 text-white" />
						</div>
					)}
					<div>
						<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white">
							{currentOrganization.name}
						</h1>
						<p className="text-gray-600 dark:text-gray-300">
							Gestion de votre organisation
						</p>
					</div>
				</div>
				{currentOrganization.description && (
					<p className="text-muted-foreground mt-2">
						{currentOrganization.description}
					</p>
				)}
			</div>

			{/* Onglets de gestion de l'organisation */}
			<OrganizationTabs organization={currentOrganization} />
		</div>
	);
}
