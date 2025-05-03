// components/wisetrainer/formation/content/Build3DContent.jsx
import React from "react";
import { useFormationBuild3D } from "@/lib/hooks/formations/currentFormation/useFormationBuild3D";
import Build3DViewer from "@/components/wisetrainer/formation/content/Build3DViewer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Box, AlertTriangle } from "lucide-react";

const Build3DContent = ({ formation }) => {
	const { build3D, isLoading, error, refreshBuild3D } = useFormationBuild3D(
		formation?.id
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 text-wisetwin-blue animate-spin mr-4" />
				<p>Chargement de l'environnement 3D...</p>
			</div>
		);
	}

	if (error) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">
						Erreur de chargement
					</h3>
					<p className="text-gray-600 dark:text-gray-400 mb-6">
						{error}
					</p>
					<Button onClick={refreshBuild3D}>Réessayer</Button>
				</CardContent>
			</Card>
		);
	}

	if (!build3D) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<Box className="h-12 w-12 text-wisetwin-blue/30 mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">
						Aucun environnement 3D disponible
					</h3>
					<p className="text-gray-600 dark:text-gray-400">
						Cette formation ne contient pas encore d'environnement
						3D.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Build3DViewer
			formationId={formation.id}
			build3D={build3D}
			onModuleComplete={refreshBuild3D}
		/>
	);
};

export default Build3DContent;
