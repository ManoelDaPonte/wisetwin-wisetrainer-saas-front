"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Composant CTA réutilisable pour toute l'application
 * @param {Object} props - Props du composant
 * @param {string} props.title - Titre principal du CTA
 * @param {string} props.description - Description/message du CTA
 * @param {string} props.actionText - Texte du bouton d'action
 * @param {Function} props.onAction - Fonction appelée lors du clic sur le bouton
 * @param {React.ReactNode} props.icon - Icône à afficher (composant Lucide)
 * @param {string} props.variant - Variante de style ("default", "outline", "secondary")
 * @param {string} props.size - Taille du CTA ("sm", "md", "lg")
 * @param {boolean} props.loading - État de chargement
 * @param {boolean} props.disabled - État désactivé
 * @param {string} props.className - Classes CSS additionnelles
 */
export function CallToAction({
	title,
	description,
	actionText,
	onAction,
	icon: Icon,
	variant = "default",
	size = "md",
	loading = false,
	disabled = false,
	className = "",
}) {
	const sizeClasses = {
		sm: "p-4",
		md: "p-6",
		lg: "p-8"
	};

	const iconSizeClasses = {
		sm: "w-8 h-8",
		md: "w-12 h-12", 
		lg: "w-16 h-16"
	};

	return (
		<Card className={`text-center border-dashed ${className}`}>
			<CardHeader className={sizeClasses[size]}>
				{Icon && (
					<div className="flex justify-center mb-4">
						<div className="p-3 rounded-full bg-wisetwin-blue/10">
							<Icon className={`${iconSizeClasses[size]} text-wisetwin-darkblue`} />
						</div>
					</div>
				)}
				<CardTitle className="text-xl font-semibold text-foreground">
					{title}
				</CardTitle>
				{description && (
					<CardDescription className="text-muted-foreground mt-2">
						{description}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="pb-6">
				<Button
					onClick={onAction}
					variant={variant}
					disabled={disabled || loading}
					className="bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light text-white"
				>
					{loading ? "Chargement..." : actionText}
				</Button>
			</CardContent>
		</Card>
	);
}

export default CallToAction;