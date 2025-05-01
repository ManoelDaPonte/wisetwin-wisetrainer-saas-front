// lib/hooks/organizations/currentOrganization/useCurrentOrganizationDashboard.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useCurrentOrganizationDashboard(organizationId) {
	const [dashboardData, setDashboardData] = useState({
		members: { total: 0, active: 0 },
		trainings: { total: 0, completed: 0 },
		activity: [],
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	const fetchDashboardData = useCallback(async () => {
		if (!organizationId) return;

		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`/api/organization/${organizationId}/dashboard`
			);

			if (response.data) {
				setDashboardData(response.data);
			}
		} catch (err) {
			console.error(
				"Erreur lors du chargement des données du dashboard:",
				err
			);
			setError(err);
			toast({
				title: "Erreur",
				description: "Impossible de charger les données du dashboard",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [organizationId, toast]);

	const refreshDashboard = async () => {
		await fetchDashboardData();
	};

	// Charger les données du dashboard au montage du composant
	useEffect(() => {
		if (organizationId) {
			fetchDashboardData();
		}
	}, [organizationId, fetchDashboardData]);

	return {
		dashboardData,
		isLoading,
		error,
		refreshDashboard,
	};
}
