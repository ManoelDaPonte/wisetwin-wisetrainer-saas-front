"use client";

import React, { createContext, useContext } from "react";
import { useTheme as useThemeHook } from "@/lib/hooks/useTheme";

// Créer le contexte
const ThemeContext = createContext(undefined);

// Fournisseur de contexte
export function ThemeProvider({ children }) {
	const themeContext = useThemeHook();

	return (
		<ThemeContext.Provider value={themeContext}>
			{themeContext.mounted ? children : null}
		</ThemeContext.Provider>
	);
}

// Hook pour utiliser le contexte
export function useTheme() {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error(
			"useTheme doit être utilisé à l'intérieur d'un ThemeProvider"
		);
	}
	return context;
}
