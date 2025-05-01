// lib/hooks/useUser.js
import { useState, useEffect } from "react";
import { useUser as useAuth0User } from "@auth0/nextjs-auth0";
import axios from "axios";

export function useUser() {
	const {
		user: auth0User,
		error: auth0Error,
		isLoading: auth0Loading,
	} = useAuth0User();
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		// Si l'utilisateur Auth0 n'est pas encore chargé ou s'il y a une erreur, ne rien faire
		if (auth0Loading || auth0Error || !auth0User) {
			setIsLoading(auth0Loading);
			setError(auth0Error);
			return;
		}

		async function initializeUser() {
			try {
				setIsLoading(true);
				// Appeler votre API pour initialiser/récupérer l'utilisateur
				const response = await axios.post("/api/auth/initialize-user");

				if (response.data && response.data.user) {
					setUser(response.data.user);
				}
			} catch (err) {
				console.error(
					"Erreur lors de l'initialisation de l'utilisateur:",
					err
				);
				setError(err);
			} finally {
				setIsLoading(false);
			}
		}

		initializeUser();
	}, [auth0User, auth0Loading, auth0Error]);

	return {
		user, // Données utilisateur de votre base
		auth0User, // Données brutes d'Auth0
		isLoading, // État de chargement combiné
		error, // Erreur éventuelle
		isAuthenticated: !!user, // L'utilisateur est authentifié et initialisé
	};
}
