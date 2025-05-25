"use client";
import {
	useState,
	useEffect,
	useCallback,
	useContext,
	createContext,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Durée du cache en ms (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

// Contexte pour stocker les données utilisateur globalement
const UserContext = createContext(null);

/**
 * Provider qui gère l'état global de l'utilisateur et évite les requêtes redondantes
 */
export function UserProvider({ children }) {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [lastFetched, setLastFetched] = useState(null);
	const router = useRouter();

	// Fonction pour récupérer les données utilisateur
	const fetchUser = useCallback(
		async (force = false) => {
			// Si on a déjà les données et qu'elles sont récentes, on ne refait pas la requête
			if (
				!force &&
				user &&
				lastFetched &&
				Date.now() - lastFetched < CACHE_DURATION
			) {
				return user;
			}

			try {
				setIsLoading(true);
				setError(null);

				// Utiliser l'API unifiée qui combine initialization et profile
				const response = await axios.get("/api/user/initialize");

				if (response.data.success) {
					setUser(response.data.user);
					setLastFetched(Date.now());
					return response.data.user;
				} else {
					throw new Error(
						response.data.error || "Failed to fetch user data"
					);
				}
			} catch (err) {
				setError(err.message || "Error fetching user data");
				return null;
			} finally {
				setIsLoading(false);
			}
		},
		[user, lastFetched]
	);

	// Charger l'utilisateur au montage du composant
	useEffect(() => {
		// Vérifier si nous sommes sur une page qui nécessite l'authentification
		// (n'est pas la page de login, etc.)
		const isProtectedRoute = !window.location.pathname.includes("/login");

		if (isProtectedRoute) {
			fetchUser();
		} else {
			// Si on est sur une page non protégée, marquer comme non chargement
			setIsLoading(false);
		}
	}, [fetchUser]);

	// Fonction pour mettre à jour le cache utilisateur
	const refreshUser = useCallback(() => {
		return fetchUser(true);
	}, [fetchUser]);

	// Fonction pour mettre à jour les données utilisateur localement
	const updateUserData = useCallback(
		(updatedData) => {
			if (user) {
				setUser((prev) => ({
					...prev,
					...updatedData,
				}));
			}
		},
		[user]
	);

	const value = {
		user,
		isLoading,
		error,
		refreshUser,
		updateUserData,
	};

	return (
		<UserContext.Provider value={value}>{children}</UserContext.Provider>
	);
}

/**
 * Hook pour accéder aux données utilisateur avec mise en cache
 */
export function useUser() {
	const context = useContext(UserContext);

	if (!context) {
		throw new Error("useUser must be used within a UserProvider");
	}

	return context;
}

export default useUser;
