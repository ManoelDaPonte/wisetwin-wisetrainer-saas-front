"use client";

import { useState, useEffect } from "react";

export function useTheme() {
	// Initialiser l'état avec "light" comme valeur par défaut
	const [theme, setTheme] = useState("light");
	const [mounted, setMounted] = useState(false);

	// Effet pour initialiser le thème lors du montage du composant
	useEffect(() => {
		// Marquer que le composant est monté
		setMounted(true);

		// Récupérer le thème depuis localStorage ou utiliser "light" par défaut
		const savedTheme = localStorage.getItem("theme");

		if (savedTheme) {
			// Si un thème est enregistré, l'utiliser
			setTheme(savedTheme);
		} else {
			// Sinon, utiliser "light" comme valeur par défaut (au lieu des préférences système)
			setTheme("light");
			// Sauvegarder dans localStorage
			localStorage.setItem("theme", "light");
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
