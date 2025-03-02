//components/overview/training/TrainingEmptyState.jsx
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";

export default function TrainingEmptyState() {
	const router = useRouter();

	return (
		<div className="text-center py-16">
			<div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 p-6 mb-4">
				<GraduationCap className="w-8 h-8 text-wisetwin-blue" />
			</div>
			<h3 className="text-lg font-medium mb-2">
				Aucune formation trouvée
			</h3>
			<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
				Vous n'avez pas encore commencé de formation. Découvrez notre
				catalogue pour démarrer votre parcours d'apprentissage.
			</p>
			<Button
				onClick={() => router.push("/wisetrainer")}
				className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
			>
				Explorer les formations
				<ArrowRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	);
}
