//lib/hooks/usePopularTrainings.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export function usePopularTrainings() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [trainings, setTrainings] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Appel à l'API pour récupérer les formations recommandées/populaires
				const response = await axios.get(
					"/api/db/wisetrainer/recommended-trainings"
				);

				if (response.data && response.data.trainings) {
					// Ajouter le type de source pour chaque formation
					const popularTrainings = response.data.trainings.map(
						(training) => ({
							...training,
							source: {
								type: "wisetwin",
								name: "WiseTwin",
							},
						})
					);

					setTrainings(popularTrainings);
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des formations populaires:",
					error
				);
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, []);

	return {
		isLoading,
		error,
		trainings,
	};
}
