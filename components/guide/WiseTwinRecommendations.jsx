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
import { ArrowRight } from "lucide-react";
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
			<Card className="mb-6">
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
									Formations officielles WiseTwin
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
								Accédez à notre catalogue de formations
								interactives
							</CardDescription>
						</div>
					</div>
				</CardHeader>

				<CardContent className="pt-6">
					<div className="pl-20 mb-4">
						<h3 className="font-medium text-lg text-wisetwin-darkblue dark:text-wisetwin-blue">
							Formations recommandées
						</h3>
					</div>
					<div className="flex">
						<div className="w-20 flex-shrink-0"></div>
						<div className="flex-grow overflow-x-auto">
							<div className="flex gap-4 pb-2">
								{trainings.map((training) => (
									<div
										key={training.id}
										className="w-72 flex-shrink-0"
									>
										<TrainingCard
											training={training}
											onClick={() =>
												router.push(
													`/wisetrainer/${training.id}`
												)
											}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
