//lib/hooks/organizations/currentOrganization/useCurrentOrganizationTrainings.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useCurrentOrganizationTrainings(organizationId) {
	const [trainings, setTrainings] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	const fetchTrainings = useCallback(async () => {
		if (!organizationId) return;

		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`/api/organizations/${organizationId}/trainings`
			);

			if (response.data.trainings) {
				setTrainings(response.data.trainings);
			}
		} catch (err) {
			console.error("Erreur lors du chargement des formations:", err);
			setError(err);
			toast({
				title: "Erreur",
				description: "Impossible de charger les formations",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [organizationId, toast]);

	// Charger les formations au montage du composant
	useEffect(() => {
		if (organizationId) {
			fetchTrainings();
		}
	}, [organizationId, fetchTrainings]);

	return {
		trainings,
		isLoading,
		error,
		fetchTrainings,
	};
}
