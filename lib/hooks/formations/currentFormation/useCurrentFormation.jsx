// lib/hooks/formations/currentFormation/useCurrentFormation.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useCurrentFormation(formationId, source = null) {
	const [formation, setFormation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	useEffect(() => {
		const fetchFormation = async () => {
			if (!formationId) return;

			setIsLoading(true);
			setError(null);

			try {
				// Construire les paramètres de requête
				let params = new URLSearchParams();
				if (
					source &&
					source.type === "organization" &&
					source.organizationId
				) {
					params.append("organizationId", source.organizationId);
				}

				// Faire la requête API
				const response = await axios.get(
					`/api/formations/${formationId}${
						params.toString() ? `?${params.toString()}` : ""
					}`
				);

				if (response.data.formation) {
					setFormation(response.data.formation);
				} else {
					setError("Formation non trouvée");
				}
			} catch (err) {
				console.error(
					"Erreur lors du chargement de la formation:",
					err
				);
				setError(
					err.response?.data?.error ||
						"Impossible de charger cette formation"
				);

				toast({
					title: "Erreur",
					description:
						"Impossible de charger les détails de la formation",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchFormation();
	}, [formationId, source, toast]);

	return {
		formation,
		isLoading,
		error,
		refreshFormation: async () => {
			setIsLoading(true);
			// Recharger les données
			try {
				const params = new URLSearchParams();
				if (
					source &&
					source.type === "organization" &&
					source.organizationId
				) {
					params.append("organizationId", source.organizationId);
				}

				const response = await axios.get(
					`/api/formations/${formationId}${
						params.toString() ? `?${params.toString()}` : ""
					}`
				);

				if (response.data.formation) {
					setFormation(response.data.formation);
				}
			} catch (err) {
				console.error(
					"Erreur lors du rechargement de la formation:",
					err
				);
			} finally {
				setIsLoading(false);
			}
		},
	};
}
