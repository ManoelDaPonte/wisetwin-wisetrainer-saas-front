// lib/hooks/organizations/currentOrganization/useCurrentOrganization.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useCurrentOrganization(organizationId) {
	const [organization, setOrganization] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	const fetchOrganizationDetails = useCallback(async () => {
		if (!organizationId) return;

		try {
			setIsLoading(true);
			setError(null);
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
		} catch (err) {
			console.error("Erreur lors du chargement de l'organisation:", err);
			setError(err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible d'accéder à cette organisation",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [organizationId, toast]);

	// Charger les détails de l'organisation au montage
	useEffect(() => {
		if (organizationId) {
			fetchOrganizationDetails();
		}
	}, [organizationId, fetchOrganizationDetails]);

	return {
		organization,
		isLoading,
		error,
		fetchOrganizationDetails,
	};
}
