//lib/hooks/useTrainingWiseTwin.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export function useTrainingWiseTwin(userId) {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [trainings, setTrainings] = useState([]);

	useEffect(() => {
		if (!userId) return;

		const fetchData = async () => {
			setIsLoading(true);
			try {
				// Récupérer les formations du container WiseTwin
				const response = await axios.get(
					"/api/db/wisetrainer/wisetwin-trainings"
				);

				if (response.data && response.data.trainings) {
					const wiseTwinData = response.data.trainings.map(
						(training) => ({
							...training,
							source: {
								type: "wisetwin",
								name: "WiseTwin",
							},
						})
					);

					setTrainings(wiseTwinData);
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération des formations WiseTwin:",
					error
				);
				setError(error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [userId]);

	return {
		isLoading,
		error,
		trainings,
	};
}
