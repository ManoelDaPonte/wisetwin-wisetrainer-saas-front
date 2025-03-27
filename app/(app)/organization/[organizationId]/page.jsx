// app/(app)/organization/[organizationId]/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/lib/hooks/useToast";
import OrganizationTabs from "@/components/organizations/organization/OrganizationTabs";

export default function OrganizationManagementPage() {
	const router = useRouter();
	const params = useParams();
	const { toast } = useToast();
	const [organization, setOrganization] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const organizationId = params?.organizationId;

	useEffect(() => {
		if (organizationId) {
			fetchOrganizationDetails();
		}
	}, [organizationId]);

	const fetchOrganizationDetails = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get(
				`/api/organization/${organizationId}`
			);

			if (response.data.organization) {
				setOrganization(response.data.organization);
			} else {
				toast({
					title: "Erreur",
					description:
						"Impossible de charger les détails de l'organisation",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error(
				"Erreur lors du chargement de l'organisation:",
				error
			);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible d'accéder à cette organisation",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleBack = () => {
		router.push("/organization");
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
			{/* En-tête avec informations sur l'organisation */}
			<div className="mb-6">
				<Button variant="outline" onClick={handleBack} className="mb-4">
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
									e.target.src =
										"/images/png/placeholder.png";
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

			{/* Utiliser le composant OrganizationTabs pour gérer les onglets */}
			<OrganizationTabs
				organization={organization}
				onDataChange={fetchOrganizationDetails}
			/>
		</div>
	);
}
