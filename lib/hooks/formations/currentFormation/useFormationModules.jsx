// lib/hooks/formations/currentFormation/useFormationModules.jsx
import { useState, useEffect, useRef } from "react";
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

	// Référence pour suivre si une requête est déjà en cours
	const isLoadingRef = useRef(false);
	// Référence pour suivre si les données ont déjà été chargées
	const dataLoadedRef = useRef(false);

	useEffect(() => {
		const fetchModules = async () => {
			if (!formationId || isLoadingRef.current) return;

			// Si les données sont déjà chargées, ne pas recharger automatiquement
			if (dataLoadedRef.current && modules.modules3D.length > 0) return;

			setIsLoading(true);
			setError(null);
			isLoadingRef.current = true;

			try {
				// Construire l'URL avec les paramètres si nécessaire
				let url = `/api/formations/${formationId}/modules`;
				if (
					source &&
					source.type === "organization" &&
					source.organizationId
				) {
					url += `?organizationId=${source.organizationId}`;
				}

				const response = await axios.get(url);

				if (response.data) {
					setModules(response.data);
					dataLoadedRef.current = true;
				}
			} catch (err) {
				console.error("Erreur lors du chargement des modules:", err);
				setError(
					err.response?.data?.error ||
						"Impossible de charger les modules"
				);

				// Éviter d'afficher plusieurs toasts pour la même erreur
				if (!dataLoadedRef.current) {
					toast({
						title: "Erreur",
						description:
							"Impossible de charger les modules de la formation",
						variant: "destructive",
					});
				}
			} finally {
				setIsLoading(false);
				isLoadingRef.current = false;
			}
		};

		fetchModules();
	}, [formationId, source, toast]);

	const refreshModules = async () => {
		if (!formationId || isLoadingRef.current) return;

		isLoadingRef.current = true;
		setIsLoading(true);

		try {
			let url = `/api/formations/${formationId}/modules`;
			if (
				source &&
				source.type === "organization" &&
				source.organizationId
			) {
				url += `?organizationId=${source.organizationId}`;
			}

			const response = await axios.get(url);
			if (response.data) {
				setModules(response.data);
				dataLoadedRef.current = true;
			}
		} catch (err) {
			console.error("Erreur lors du rechargement des modules:", err);
		} finally {
			setIsLoading(false);
			isLoadingRef.current = false;
		}
	};

	return {
		...modules,
		isLoading,
		error,
		refreshModules,
	};
}
