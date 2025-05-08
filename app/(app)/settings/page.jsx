// app/(app)/settings/page.jsx
"use client";
import React from "react";
import { SettingsProvider } from "@/lib/contexts/SettingsContext";
import SettingsPanel from "@/components/settings";

/**
 * Page des paramètres
 * Sert de point d'entrée pour la page des paramètres et englobe le composant principal
 * dans le fournisseur de contexte SettingsProvider
 *
 * @returns {JSX.Element} Composant de la page des paramètres
 */
export default function SettingsPage() {
	return (
		<SettingsProvider>
			<SettingsPanel />
		</SettingsProvider>
	);
}
