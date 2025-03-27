// app/(app)/organization/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import OrganizationsTable from "@/components/organizations/OrganizationsTable";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";
import { useToast } from "@/lib/hooks/useToast";

export default function OrganizationPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [organizations, setOrganizations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);

	useEffect(() => {
		fetchOrganizations();
	}, []);

	const fetchOrganizations = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get("/api/organization");

			if (response.data.organizations) {
				setOrganizations(response.data.organizations);
			} else {
				// Si aucune organisation n'est retournée, définir un tableau vide
				setOrganizations([]);
			}
		} catch (error) {
			console.error(
				"Erreur lors du chargement des organisations:",
				error
			);
			toast({
				title: "Erreur",
				description: "Impossible de charger les organisations",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateOrganization = async (organizationData) => {
		try {
			const response = await axios.post(
				"/api/organization",
				organizationData
			);

			if (response.data.success) {
				toast({
					title: "Organisation créée",
					description: "L'organisation a été créée avec succès",
					variant: "success",
				});

				setShowCreateModal(false);
				await fetchOrganizations(); // Rafraîchir la liste

				// Rediriger vers la page de l'organisation nouvellement créée
				if (response.data.organization?.id) {
					router.push(
						`/organization/${response.data.organization.id}`
					);
				}
			} else {
				throw new Error(
					response.data.error ||
						"Échec de la création de l'organisation"
				);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la création de l'organisation:",
				error
			);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible de créer l'organisation",
				variant: "destructive",
			});
		}
	};

	const handleManageOrganization = (organizationId) => {
		router.push(`/organization/${organizationId}`);
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
						onManage={handleManageOrganization}
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
