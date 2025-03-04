"use client";

import { useState, useEffect } from "react";

export function useTheme() {
	// Initialiser l'état avec une valeur par défaut
	const [theme, setTheme] = useState("");
	const [mounted, setMounted] = useState(false);

	// Effet pour initialiser le thème lors du montage du composant
	useEffect(() => {
		// Marquer que le composant est monté
		setMounted(true);

		// Récupérer le thème depuis localStorage ou les préférences système
		const savedTheme = localStorage.getItem("theme");

		if (savedTheme) {
			// Si un thème est enregistré, l'utiliser
			setTheme(savedTheme);
		} else {
			// Sinon, utiliser les préférences système
			const systemPreference = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches
				? "dark"
				: "light";
			setTheme(systemPreference);
		}
	}, []);

	// Effet pour appliquer le thème quand il change
	useEffect(() => {
		if (!mounted || !theme) return;

		if (theme === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}

		// Sauvegarder le thème dans localStorage
		localStorage.setItem("theme", theme);
	}, [theme, mounted]);

	// Fonction pour basculer entre les thèmes clair et sombre
	const toggleTheme = () => {
		setTheme(theme === "light" ? "dark" : "light");
	};

	return {
		theme,
		setTheme,
		toggleTheme,
		isDark: theme === "dark",
		isLight: theme === "light",
		mounted,
	};
}
