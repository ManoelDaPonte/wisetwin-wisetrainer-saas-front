//components/ui/card.jsx

import * as React from "react";

import { cn } from "@/lib/utils";

function Card({
	className,
	noPaddingTop = false, // Option pour désactiver uniquement le padding supérieur
	noPaddingBottom = false, // Option pour désactiver uniquement le padding inférieur
	...props
}) {
	return (
		<div
			data-slot="card"
			className={cn(
				"bg-card text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm",
				noPaddingTop && noPaddingBottom
					? "" // Aucun padding
					: noPaddingTop
					? "pb-6" // Padding uniquement en bas
					: noPaddingBottom
					? "pt-6" // Padding uniquement en haut
					: "py-6", // Padding en haut et en bas (défaut)
				className
			)}
			{...props}
		/>
	);
}

function CardHeader({ className, ...props }) {
	return (
		<div
			data-slot="card-header"
			className={cn("flex flex-col gap-1.5 px-6", className)}
			{...props}
		/>
	);
}

function CardTitle({ className, ...props }) {
	return (
		<div
			data-slot="card-title"
			className={cn("leading-none font-semibold", className)}
			{...props}
		/>
	);
}

function CardDescription({ className, ...props }) {
	return (
		<div
			data-slot="card-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

function CardContent({ className, ...props }) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6", className)}
			{...props}
		/>
	);
}

function CardFooter({ className, ...props }) {
	return (
		<div
			data-slot="card-footer"
			className={cn("flex items-center px-6", className)}
			{...props}
		/>
	);
}

export {
	Card,
	CardHeader,
	CardFooter,
	CardTitle,
	CardDescription,
	CardContent,
};
