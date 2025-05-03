// lib/hooks/formations/useFormationBuild3D.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useFormationBuild3D(formationId) {
	const [build3D, setBuild3D] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	useEffect(() => {
		const fetchBuild3D = async () => {
			if (!formationId) return;

			setIsLoading(true);
			setError(null);

			try {
				const response = await axios.get(
					`/api/formations/${formationId}/build3d`
				);

				if (response.data) {
					setBuild3D(response.data);
				}
			} catch (err) {
				console.error("Erreur lors du chargement du Build 3D:", err);
				setError(
					err.response?.data?.error ||
						"Impossible de charger l'environnement 3D"
				);

				toast({
					title: "Erreur",
					description: "Impossible de charger l'environnement 3D",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchBuild3D();
	}, [formationId, toast]);

	return {
		build3D,
		isLoading,
		error,
		refreshBuild3D: async () => {
			setIsLoading(true);
			try {
				const response = await axios.get(
					`/api/formations/${formationId}/build3d`
				);
				if (response.data) {
					setBuild3D(response.data);
				}
			} catch (err) {
				console.error("Erreur lors du rechargement du Build 3D:", err);
			} finally {
				setIsLoading(false);
			}
		},
	};
}
