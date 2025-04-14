import React from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NoTrainingsMessage() {
	const router = useRouter();

	return (
		<div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
			<div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 p-6 mb-4">
				<BookOpen className="w-8 h-8 text-wisetwin-blue" />
			</div>
			<h3 className="text-lg font-medium mb-2">
				Aucune formation trouvée
			</h3>
			<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
				Aucune formation n'est disponible pour le moment. Explorez notre
				catalogue pour découvrir nos programmes.
			</p>
			<Button
				onClick={() => router.push("/wisetrainer")}
				className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
			>
				Explorer le catalogue
				<ArrowRight className="ml-2 h-4 w-4" />
			</Button>
		</div>
	);
}
