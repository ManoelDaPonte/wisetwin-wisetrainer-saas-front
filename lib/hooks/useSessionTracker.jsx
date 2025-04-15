//lib/hooks/useSessionTracker.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";

export function useSessionTracker(courseId = null) {
	const { user } = useUser();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [sessionId, setSessionId] = useState(null);
	const [isActive, setIsActive] = useState(false);
	const [startTime, setStartTime] = useState(null);
	const [duration, setDuration] = useState(0);
	const [error, setError] = useState(null);
	const [modulesViewed, setModulesViewed] = useState([]);
	const [formattedTime, setFormattedTime] = useState("00:00");

	// Démarrer une session lorsque le composant est monté
	useEffect(() => {
		// Seulement démarrer une session si l'utilisateur est connecté et le container est disponible
		if (user && containerName && !containerLoading) {
			startSession();
		}

		// Configurer un intervalle pour mettre à jour la durée
		const intervalId = setInterval(() => {
			if (isActive && startTime) {
				const currentDuration = Math.round(
					(new Date() - startTime) / 1000
				);
				setDuration(currentDuration);

				// Mettre à jour le format du temps à chaque tic
				const minutes = Math.floor(currentDuration / 60);
				const seconds = currentDuration % 60;
				const formatted = `${minutes
					.toString()
					.padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
				setFormattedTime(formatted);
			}
		}, 1000);

		// Gérer le nettoyage lorsque le composant est démonté
		return () => {
			clearInterval(intervalId);
			if (isActive) {
				endSession();
			}
		};
	}, [user, containerName, containerLoading, isActive, startTime]);

	// Gérer la fin de session lorsque l'utilisateur quitte la page
	useEffect(() => {
		const handleBeforeUnload = () => {
			if (isActive && sessionId) {
				// Version synchrone pour le cas où l'utilisateur quitte la page
				const data = JSON.stringify({
					userId: containerName,
					sessionId: sessionId,
					modulesViewed: modulesViewed,
				});

				// Utiliser POST au lieu de PUT pour la compatibilité avec sendBeacon
				navigator.sendBeacon("/api/db/sessions/end", data);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [isActive, sessionId, containerName, modulesViewed]);

	// Fonction pour démarrer une session
	const startSession = async () => {
		try {
			setError(null);

			const response = await axios.post("/api/db/sessions", {
				userId: containerName,
				courseId,
			});

			if (response.data.success) {
				setSessionId(response.data.session.id);
				setIsActive(true);
				setStartTime(new Date());
				setDuration(0);
				setFormattedTime("00:00");
				setModulesViewed([]);
			} else {
				throw new Error(
					response.data.error || "Échec du démarrage de la session"
				);
			}
		} catch (err) {
			console.error("Erreur lors du démarrage de la session:", err);
			setError(
				err.response?.data?.error || err.message || "Erreur inconnue"
			);
		}
	};

	// Fonction pour terminer une session
	// Fonction pour terminer une session
	const endSession = async () => {
		if (!isActive || !sessionId) return;

		try {
			setError(null);

			// Utiliser le nouvel endpoint POST au lieu de PUT
			const response = await axios.post("/api/db/sessions/end", {
				userId: containerName,
				sessionId,
				modulesViewed,
			});

			if (response.data.success) {
				setIsActive(false);
				setSessionId(null);
			} else {
				throw new Error(
					response.data.error || "Échec de la fin de la session"
				);
			}
		} catch (err) {
			console.error("Erreur lors de la fin de la session:", err);
			setError(
				err.response?.data?.error || err.message || "Erreur inconnue"
			);
			// Même en cas d'erreur, marquer la session comme terminée localement
			setIsActive(false);
			setSessionId(null);
		}
	};

	// Fonction pour enregistrer un module vu
	const trackModuleView = (moduleId) => {
		if (!isActive) return;

		// Vérifier si le module est déjà dans la liste
		if (!modulesViewed.includes(moduleId)) {
			setModulesViewed([...modulesViewed, moduleId]);
		}
	};

	return {
		isActive,
		sessionId,
		duration,
		formattedDuration: formattedTime,
		error,
		modulesViewed,
		startSession,
		endSession,
		trackModuleView,
	};
}

export default useSessionTracker;
