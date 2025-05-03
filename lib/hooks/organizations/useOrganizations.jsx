// lib/hooks/useOrganizations.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";

export function useOrganizations() {
	const [organizations, setOrganizations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();
	const router = useRouter();

	const fetchOrganizations = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get("/api/organizations");

			if (response.data.organizations) {
				setOrganizations(response.data.organizations);
			} else {
				// Si aucune organisation n'est retournée, définir un tableau vide
				setOrganizations([]);
			}
		} catch (err) {
			console.error("Erreur lors du chargement des organisations:", err);
			setError(err);
			toast({
				title: "Erreur",
				description: "Impossible de charger les organisations",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [toast]);

	const createOrganization = async (organizationData) => {
		try {
			const response = await axios.post(
				"/api/organizations",
				organizationData
			);

			if (response.data.success) {
				toast({
					title: "Organisation créée",
					description: "L'organisation a été créée avec succès",
					variant: "success",
				});

				await fetchOrganizations(); // Rafraîchir la liste

				// Retourner l'organisation créée pour une redirection éventuelle
				return response.data.organization;
			} else {
				throw new Error(
					response.data.error ||
						"Échec de la création de l'organisation"
				);
			}
		} catch (err) {
			console.error("Erreur lors de la création de l'organisation:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible de créer l'organisation",
				variant: "destructive",
			});
			return null;
		}
	};

	const navigateToOrganization = (organizationId) => {
		router.push(`/organizations/${organizationId}`);
	};

	// Charger les organisations au montage du composant
	useEffect(() => {
		fetchOrganizations();
	}, [fetchOrganizations]);

	return {
		organizations,
		isLoading,
		error,
		fetchOrganizations,
		createOrganization,
		navigateToOrganization,
	};
}
