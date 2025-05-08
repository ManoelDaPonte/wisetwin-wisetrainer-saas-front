//components/wisetwin/WiseTwinViewer.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { useToast } from "@/lib/hooks/useToast";

// Import des hooks personnalisés
import { useWiseTwinBuilds } from "@/lib/hooks/useWiseTwinBuilds";
import { useWiseTwinOrganization } from "@/lib/hooks/useWiseTwinOrganization";

// Import des composants d'onglets
import CatalogBuildTab from "@/components/wisetwin/catalog/CatalogBuildTab";
import CatalogOrganizationTab from "@/components/wisetwin/catalog/CatalogOrganizationTab";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

export default function WiseTwinViewer() {
	const router = useRouter();
	const { containerName } = useAzureContainer();
	const [activeTab, setActiveTab] = useState("catalog");
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [selectedOrgId, setSelectedOrgId] = useState(null);
	const { toast } = useToast();
	const [importingBuildId, setImportingBuildId] = useState(null);

	// Utiliser les hooks personnalisés pour récupérer les données
	const { builds: wiseTwinBuilds, isLoading: isLoadingWiseTwin } =
		useWiseTwinBuilds(containerName);

	// Récupérer les organisations de l'utilisateur
	const [userOrganizations, setUserOrganizations] = useState([]);
	const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);

	// Utiliser le hook pour les builds d'organisation
	const { organizationBuilds, isLoading: isLoadingOrg } =
		useWiseTwinOrganization(selectedOrgId, containerName);

	// Configuration pour les animations
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.5 },
		},
	};

	// Effet pour charger les organisations de l'utilisateur
	useEffect(() => {
		fetchUserOrganizations();
	}, []);

	const fetchUserOrganizations = async () => {
		try {
			setIsLoadingOrgs(true);
			const response = await axios.get("/api/organization");

			if (response.data.organizations) {
				setUserOrganizations(response.data.organizations);

				// Sélectionner automatiquement la première organisation si elle existe
				if (response.data.organizations.length > 0 && !selectedOrgId) {
					setSelectedOrgId(response.data.organizations[0].id);
				}
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des organisations:",
				error
			);
			setUserOrganizations([]);
		} finally {
			setIsLoadingOrgs(false);
		}
	};

	const handleSelectOrganization = (orgId) => {
		setSelectedOrgId(orgId);
	};

	// Fonction pour accéder à un environnement 3D
	const handleViewBuild = (build) => {
		if (!containerName) {
			toast({
				title: "Erreur d'accès",
				description:
					"Impossible d'accéder aux environnements 3D. Veuillez vous reconnecter.",
				variant: "destructive",
			});
			return;
		}

		// Construire l'URL avec les paramètres supplémentaires si nécessaire
		let url = `/wisetwin/${build.id}`;

		// Ajouter les informations de source pour les builds d'organisation
		if (build.source?.type === "organization") {
			url += `?sourceContainer=${
				build.sourceContainer || ""
			}&organizationId=${
				build.source.organizationId || ""
			}&organizationName=${encodeURIComponent(build.source.name || "")}`;
		}

		// Rediriger directement vers la page de l'environnement 3D sans importation
		router.push(url);
	};

	const toggleCardFlip = (buildId) => {
		setFlippedCardId(flippedCardId === buildId ? null : buildId);
	};

	return (
		<div className="container mx-auto">
			<Tabs
				defaultValue="catalog"
				className="w-full"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-8">
					<TabsTrigger value="catalog" className="px-6">
						Mes Environnements
					</TabsTrigger>
					<TabsTrigger value="organization" className="px-6">
						Catalogue d'environnements
					</TabsTrigger>
				</TabsList>

				<TabsContent value="catalog">
					<CatalogBuildTab
						isLoading={isLoadingWiseTwin}
						builds={wiseTwinBuilds}
						onViewBuild={handleViewBuild}
						onToggleInfo={toggleCardFlip}
						flippedCardId={flippedCardId}
						importingBuildId={importingBuildId}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="organization">
					<CatalogOrganizationTab
						organizations={userOrganizations}
						selectedOrganizationId={selectedOrgId}
						onSelectOrganization={handleSelectOrganization}
						builds={(organizationBuilds || []).map((build) => {
							// S'assurer que chaque build a les informations de source complètes
							const selectedOrg = userOrganizations.find(
								(org) => org.id === selectedOrgId
							);
							return {
								...build,
								// Préserver le nom du build
								name:
									build.name ||
									build.id
										.split("-")
										.map(
											(word) =>
												word.charAt(0).toUpperCase() +
												word.slice(1)
										)
										.join(" "),
								source: {
									type: "organization",
									name: selectedOrg?.name || "Organisation",
									organizationId: selectedOrgId,
									containerName:
										selectedOrg?.azureContainer || null,
								},
							};
						})}
						isLoading={isLoadingOrgs || isLoadingOrg}
						onViewBuild={handleViewBuild}
						onToggleInfo={toggleCardFlip}
						flippedCardId={flippedCardId}
						importingBuildId={importingBuildId}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
