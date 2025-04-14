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
import { ArrowRight, Flame } from "lucide-react";
import TrainingCard from "./TrainingCard";

export default function PopularTrainings({
	trainings = [],
	isLoading = false,
}) {
	const router = useRouter();

	if (isLoading) {
		return (
			<Card className="mb-0">
				<CardHeader>
					<CardTitle className="flex items-center">
						<Flame className="mr-2 h-5 w-5 text-orange-500" />
						Formations populaires
					</CardTitle>
					<CardDescription>
						Chargement des formations les plus populaires...
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
								<div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-b-lg p-4">
									<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!trainings || trainings.length === 0) {
		return null;
	}

	return (
		<Card className="mb-0">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center">
						<div className="bg-orange-100 dark:bg-orange-900/20 w-8 h-8 rounded-full flex items-center justify-center mr-2">
							<Flame className="h-5 w-5 text-orange-500" />
						</div>
						<CardTitle>Formations populaires</CardTitle>
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
					Découvrez les formations les plus suivies par notre
					communauté
				</CardDescription>
			</CardHeader>
			<CardContent>
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
			</CardContent>
		</Card>
	);
}
