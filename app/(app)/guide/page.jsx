"use client";
import React from "react";
import { GuideProvider } from "@/lib/contexts/GuideContext";
import Guide from "@/components/guide";

/**
 * Page Guide
 * Sert de point d'entrée pour la page guide et englobe le composant principal
 * dans le fournisseur de contexte Guide
 *
 * @returns {JSX.Element} Composant de la page Guide
 */
export default function GuidePage() {
	return (
		<GuideProvider>
			<Guide />
		</GuideProvider>
	);
}
