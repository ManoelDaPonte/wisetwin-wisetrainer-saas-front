//lib/hooks/useCurrentTraining.jsx
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export function useCurrentTraining() {
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [currentTrainings, setCurrentTrainings] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (containerName && !containerLoading) {
			fetchCurrentTrainings();
		}
	}, [containerName, containerLoading]);

	const fetchCurrentTrainings = async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Récupérer les formations de l'utilisateur
			const response = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${containerName}`
			);

			if (response.data && response.data.trainings) {
				// Filtrer les formations en cours (progress > 0 et < 100)
				const inProgress = response.data.trainings.filter(
					(training) =>
						training.progress > 0 && training.progress < 100
				);

				// Trier par date d'accès récente
				const sortedTrainings = inProgress.sort(
					(a, b) =>
						new Date(b.lastAccessed) - new Date(a.lastAccessed)
				);

				setCurrentTrainings(sortedTrainings);
			}
		} catch (err) {
			console.error(
				"Erreur lors de la récupération des formations en cours:",
				err
			);
			setError(err);
		} finally {
			setIsLoading(false);
		}
	};

	// Recharger les formations manuellement
	const refresh = () => {
		if (containerName) {
			fetchCurrentTrainings();
		}
	};

	return {
		currentTrainings,
		isLoading: isLoading || containerLoading,
		error,
		refresh,
	};
}
