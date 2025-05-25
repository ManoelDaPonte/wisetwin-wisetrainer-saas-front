"use client";
import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useEffect,
} from "react";
import { useTheme } from "@/lib/hooks/useTheme";
// Utiliser useUser de la nouvelle architecture
import { useUser } from "@/lib/hooks/useUser";

// Création du contexte
const SettingsContext = createContext(undefined);

// Clés pour les préférences localStorage
const STORAGE_KEYS = {
	LANGUAGE: "wisetwin_language",
	NOTIFICATIONS: "wisetwin_notifications",
	EMAIL_ALERTS: "wisetwin_email_alerts",
};

/**
 * Hook personnalisé pour utiliser le contexte des paramètres
 * @returns {Object} Contexte des paramètres
 */
export const useSettings = () => {
	const context = useContext(SettingsContext);

	if (context === undefined) {
		throw new Error(
			"useSettings doit être utilisé à l'intérieur d'un SettingsProvider"
		);
	}

	return context;
};

/**
 * Fonction pour lire une valeur de localStorage avec valeur par défaut
 */
const getStorageValue = (key, defaultValue) => {
	if (typeof window === "undefined") return defaultValue;

	try {
		const storedValue = localStorage.getItem(key);
		return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
	} catch (error) {
		console.error(
			`Erreur lors de la lecture de ${key} depuis localStorage:`,
			error
		);
		return defaultValue;
	}
};

/**
 * Fonction pour sauvegarder une valeur dans localStorage
 */
const setStorageValue = (key, value) => {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(
			`Erreur lors de l'écriture de ${key} dans localStorage:`,
			error
		);
	}
};

/**
 * Fournisseur de contexte pour les paramètres
 * Centralise la gestion de l'état des paramètres de l'application
 *
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur de contexte
 */
export const SettingsProvider = ({ children }) => {
	// État du contexte
	const { theme, setTheme } = useTheme();
	const { user, updateUser, refreshUser } = useUser();

	const [activeTab, setActiveTab] = useState("preferences");
	const [language, setLanguage] = useState("fr");
	const [notifications, setNotifications] = useState(true);
	const [emailAlerts, setEmailAlerts] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [lastRefresh, setLastRefresh] = useState(new Date());

	// Initialiser les préférences depuis localStorage
	useEffect(() => {
		// Préférences UI depuis localStorage
		setLanguage(getStorageValue(STORAGE_KEYS.LANGUAGE, "fr"));
		setNotifications(getStorageValue(STORAGE_KEYS.NOTIFICATIONS, true));
		setEmailAlerts(getStorageValue(STORAGE_KEYS.EMAIL_ALERTS, true));
	}, []);

	// Gérer les mises à jour du langage
	const handleSetLanguage = useCallback((value) => {
		setLanguage(value);
		setStorageValue(STORAGE_KEYS.LANGUAGE, value);
	}, []);

	// Gérer les mises à jour des notifications
	const handleSetNotifications = useCallback((value) => {
		setNotifications(value);
		setStorageValue(STORAGE_KEYS.NOTIFICATIONS, value);
	}, []);

	// Gérer les mises à jour des alertes email
	const handleSetEmailAlerts = useCallback((value) => {
		setEmailAlerts(value);
		setStorageValue(STORAGE_KEYS.EMAIL_ALERTS, value);
	}, []);

	// Fonction pour rafraîchir les données des paramètres
	const refreshSettings = useCallback(async () => {
		setIsLoading(true);

		try {
			// Rafraîchir les données utilisateur
			await refreshUser();

			// Mise à jour des données
			setLastRefresh(new Date());
		} catch (error) {
			console.error(
				"Erreur lors du rafraîchissement des paramètres:",
				error
			);
		} finally {
			setIsLoading(false);
		}
	}, [refreshUser]);

	// Valeur du contexte à exposer
	const value = {
		// États
		activeTab,
		theme,
		language,
		notifications,
		emailAlerts,
		isLoading,
		lastRefresh,

		// Setters
		setActiveTab,
		setTheme,
		setLanguage: handleSetLanguage,
		setNotifications: handleSetNotifications,
		setEmailAlerts: handleSetEmailAlerts,

		// Actions
		refreshSettings,
	};

	return (
		<SettingsContext.Provider value={value}>
			{children}
		</SettingsContext.Provider>
	);
};
