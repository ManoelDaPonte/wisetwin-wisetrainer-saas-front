//components/guide/RecommendedTrainings.jsx
import React from "react";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import TrainingCard from "./TrainingCard";

export default function RecommendedTrainings({ recommendedTrainings = [] }) {
	const router = useRouter();

	if (recommendedTrainings.length === 0) {
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.3 }}
		>
			<Card className="mb-6">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 w-8 h-8 rounded-full flex items-center justify-center">
								<Sparkles className="w-4 h-4 text-wisetwin-blue" />
							</div>
							<CardTitle>Formations recommandées</CardTitle>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => router.push("/wisetrainer")}
						>
							Voir toutes les formations
						</Button>
					</div>
					<CardDescription>
						Découvrez nos formations les plus populaires
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{recommendedTrainings.map((training) => (
							<TrainingCard
								key={training.id}
								training={training}
								onClick={() =>
									router.push(`/wisetrainer/${training.id}`)
								}
							/>
						))}
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
