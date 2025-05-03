// lib/hooks/formations/currentFormation/useFormationModules.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useFormationModules(formationId, source = null) {
	const [modules, setModules] = useState({
		modules3D: [],
		lessons: [],
		isEnrolled: false,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	useEffect(() => {
		const fetchModules = async () => {
			if (!formationId) return;

			setIsLoading(true);
			setError(null);

			try {
				// Faire la requête API
				const response = await axios.get(
					`/api/formations/${formationId}/modules`
				);

				if (response.data) {
					setModules(response.data);
				}
			} catch (err) {
				console.error("Erreur lors du chargement des modules:", err);
				setError(
					err.response?.data?.error ||
						"Impossible de charger les modules"
				);

				toast({
					title: "Erreur",
					description:
						"Impossible de charger les modules de la formation",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchModules();
	}, [formationId, toast]);

	return {
		...modules,
		isLoading,
		error,
		refreshModules: async () => {
			setIsLoading(true);
			try {
				const response = await axios.get(
					`/api/formations/${formationId}/modules`
				);
				if (response.data) {
					setModules(response.data);
				}
			} catch (err) {
				console.error("Erreur lors du rechargement des modules:", err);
			} finally {
				setIsLoading(false);
			}
		},
	};
}
