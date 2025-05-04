// lib/hooks/formations/currentFormation/useFormationBuild3D.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useFormationBuild3D(formationId, source = null) {
	const [build3D, setBuild3D] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	// Référence pour suivre si une requête est déjà en cours
	const isLoadingRef = useRef(false);
	// Référence pour suivre si les données ont déjà été chargées
	const dataLoadedRef = useRef(false);

	useEffect(() => {
		// Fonction pour charger les données
		const fetchBuild3D = async () => {
			if (!formationId || isLoadingRef.current) return;

			// Si les données sont déjà chargées, ne pas recharger automatiquement
			if (dataLoadedRef.current && build3D) return;

			setIsLoading(true);
			setError(null);
			isLoadingRef.current = true;

			try {
				let url = `/api/formations/${formationId}/build3d`;
				if (
					source &&
					source.type === "organization" &&
					source.organizationId
				) {
					url += `?organizationId=${source.organizationId}`;
				}

				const response = await axios.get(url);

				if (response.data) {
					setBuild3D(response.data);
					dataLoadedRef.current = true;
				}
			} catch (err) {
				console.error("Erreur lors du chargement du Build 3D:", err);
				setError(
					err.response?.data?.error ||
						"Impossible de charger l'environnement 3D"
				);

				// Éviter d'afficher plusieurs toasts pour la même erreur
				if (!dataLoadedRef.current) {
					toast({
						title: "Erreur",
						description: "Impossible de charger l'environnement 3D",
						variant: "destructive",
					});
				}
			} finally {
				setIsLoading(false);
				isLoadingRef.current = false;
			}
		};

		fetchBuild3D();
	}, [formationId, source, toast]);

	// Fonction pour rafraîchir explicitement les données
	const refreshBuild3D = async () => {
		if (!formationId || isLoadingRef.current) return;

		isLoadingRef.current = true;
		setIsLoading(true);

		try {
			let url = `/api/formations/${formationId}/build3d`;
			if (
				source &&
				source.type === "organization" &&
				source.organizationId
			) {
				url += `?organizationId=${source.organizationId}`;
			}

			const response = await axios.get(url);

			if (response.data) {
				setBuild3D(response.data);
				dataLoadedRef.current = true;
			}
		} catch (err) {
			console.error("Erreur lors du rechargement du Build 3D:", err);
		} finally {
			setIsLoading(false);
			isLoadingRef.current = false;
		}
	};

	return {
		build3D,
		isLoading,
		error,
		refreshBuild3D,
	};
}
