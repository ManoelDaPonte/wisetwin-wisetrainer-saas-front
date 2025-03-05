import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen } from "lucide-react";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import Image from "next/image";

function TrainingList({ trainings }) {
	const router = useRouter();

	// Animation variants
	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.4 },
		},
	};

	// Formatage des dates
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{trainings.map((training) => (
				<motion.div key={training.id} variants={itemVariants}>
					<Card
						className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
						noPaddingTop
						onClick={() =>
							router.push(`/wisetrainer/${training.id}`)
						}
					>
						<div className="relative h-40 bg-gray-100 dark:bg-gray-800">
							{/* Remplacer la div par un composant Image de Next.js */}
							<Image
								src={
									training.imageUrl ||
									WISETRAINER_CONFIG.DEFAULT_IMAGE
								}
								alt={training.name}
								fill
								className="object-cover"
								onError={(e) => {
									e.target.src =
										WISETRAINER_CONFIG.DEFAULT_IMAGE;
								}}
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
								<Badge
									className={
										training.progress === 100
											? "bg-green-500"
											: training.progress > 0
											? "bg-blue-500"
											: "bg-gray-500"
									}
								>
									{training.progress === 100
										? "Terminé"
										: training.progress > 0
										? "En cours"
										: "Non commencé"}
								</Badge>
							</div>
						</div>
						<div className="p-6">
							<h3 className="text-lg font-semibold mb-1">
								{training.name}
							</h3>
							<p className="text-sm text-gray-500 mb-4 flex items-center">
								<Calendar className="w-4 h-4 mr-1" />
								Commencé le {formatDate(training.startedAt)}
							</p>

							<div className="space-y-4">
								<p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
									{training.description}
								</p>

								<div className="space-y-2">
									<div className="flex justify-between">
										<span className="text-sm text-gray-500">
											Progression
										</span>
										<span className="text-sm font-medium">
											{training.progress}%
										</span>
									</div>
									<Progress
										value={training.progress}
										className="h-2"
									/>
								</div>

								<div className="pt-3 border-t border-gray-100 dark:border-gray-800">
									<h4 className="text-sm font-medium mb-2 flex items-center gap-1">
										<BookOpen className="h-4 w-4" />
										Modules (
										{training.modules?.filter(
											(m) => m.completed
										).length || 0}
										/
										{training.totalModules ||
											training.modules?.length ||
											3}
										)
									</h4>
									<ul className="space-y-1">
										{/* Afficher tous les modules, pas seulement les complétés */}
										{training.modules
											?.slice(0, 3)
											.map((module) => (
												<li
													key={module.id}
													className="flex items-center justify-between text-sm"
												>
													<div className="flex items-center">
														<div
															className={`w-2 h-2 rounded-full mr-2 ${
																module.completed
																	? "bg-green-500"
																	: "bg-gray-300 dark:bg-gray-600"
															}`}
														></div>
														<span
															className={
																module.completed
																	? ""
																	: "text-gray-500"
															}
														>
															{module.title ||
																`Module ${module.id}`}
														</span>
													</div>
													<span
														className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
															module.completed
																? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
																: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
														}`}
													>
														{module.completed
															? `${
																	module.score ||
																	0
															  }%`
															: "0%"}
													</span>
												</li>
											))}
										{(training.totalModules > 3 ||
											(training.modules?.length || 0) >
												3) && (
											<li className="text-xs text-gray-500 pl-4">
												+{" "}
												{(training.totalModules ||
													training.modules?.length ||
													3) - 3}{" "}
												autres modules
											</li>
										)}
									</ul>
								</div>

								<Button
									className="w-full mt-4"
									onClick={(e) => {
										e.stopPropagation();
										router.push(
											`/wisetrainer/${training.id}`
										);
									}}
								>
									{training.progress === 0
										? "Commencer"
										: training.progress === 100
										? "Revoir"
										: "Continuer"}
								</Button>
							</div>
						</div>
					</Card>
				</motion.div>
			))}
		</div>
	);
}

// Composant pour l'état de chargement
TrainingList.Skeleton = function TrainingListSkeleton() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{[1, 2].map((i) => (
				<Card key={i} className="animate-pulse">
					<div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
					<div className="p-6">
						<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
						<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mt-6"></div>
					</div>
				</Card>
			))}
		</div>
	);
};

export default TrainingList;
