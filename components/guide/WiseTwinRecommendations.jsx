//components/guide/WiseTwinRecommendations.jsx
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import TrainingCard from "./TrainingCard";

export default function WiseTwinRecommendations({ trainings }) {
	const router = useRouter();

	if (!trainings || trainings.length === 0) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.3 }}
		>
			<Card>
				<CardHeader className="pb-3">
					<div className="flex items-start">
						{/* Logo WiseTwin */}
						<div className="relative w-16 h-16 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-full overflow-hidden mr-4 flex-shrink-0">
							<Image
								src="/logos/logo_parrot_light.svg"
								alt="WiseTwin Logo"
								fill
								className="object-contain p-2"
							/>
						</div>

						{/* Informations */}
						<div className="flex-grow">
							<div className="flex items-center justify-between">
								<CardTitle>
									Formations WiseTwin recommandées
								</CardTitle>
								<Button
									variant="outline"
									size="sm"
									onClick={() => router.push("/wisetrainer")}
								>
									Voir toutes les formations
								</Button>
							</div>
							<CardDescription>
								Explorez notre sélection de formations
								interactives populaires
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{trainings.slice(0, 3).map((training) => (
							<TrainingCard
								key={training.id}
								training={training}
								onClick={() =>
									router.push(`/wisetrainer/${training.id}`)
								}
							/>
						))}
					</div>

					{trainings.length > 3 && (
						<div className="mt-4 text-center">
							<Button
								variant="link"
								onClick={() => router.push("/wisetrainer")}
								className="text-wisetwin-blue hover:text-wisetwin-blue-light group"
							>
								<Sparkles className="mr-2 h-4 w-4" />
								Voir plus de formations
								<ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
