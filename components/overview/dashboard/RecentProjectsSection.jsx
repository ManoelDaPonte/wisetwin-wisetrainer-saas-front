//components/overview/dashboard/RecentProjectsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookOpen } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function RecentProjectsSection({ projects, isLoading }) {
	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.4,
			},
		},
	};

	const handleProjectClick = (project) => {
		if (project.type === "digitalTwin") {
			window.location.href = "/digital-twin";
		} else if (project.type === "wiseTrainer") {
			window.location.href = `/wisetrainer/${project.id}`;
		}
	};

	const formatDate = (dateString) => {
		try {
			return new Date(dateString).toLocaleDateString("fr-FR", {
				day: "numeric",
				month: "short",
				year: "numeric",
			});
		} catch (e) {
			return "Date inconnue";
		}
	};

	const getStatusBadge = (progress) => {
		if (progress === 100) {
			return (
				<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
					Terminé
				</Badge>
			);
		} else if (progress > 0) {
			return (
				<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
					En cours
				</Badge>
			);
		} else {
			return (
				<Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
					Non commencé
				</Badge>
			);
		}
	};

	return (
		<div className="mb-10">
			<div className="flex justify-between items-baseline mb-4">
				<h2 className="text-xl font-bold text-wisetwin-darkblue dark:text-white">
					Dernières activités
				</h2>
				<Button
					variant="link"
					className="text-wisetwin-blue"
					onClick={() => (window.location.href = "/wisetrainer")}
				>
					Voir tout
					<ArrowRight className="w-4 h-4 ml-1" />
				</Button>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="overflow-hidden">
							<div className="animate-pulse">
								<div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
								<div className="p-4">
									<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
									<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
								</div>
							</div>
						</Card>
					))}
				</div>
			) : projects.length === 0 ? (
				<Card className="p-8 text-center">
					<div className="mb-4 text-gray-400 dark:text-gray-500">
						<div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
							<BookOpen className="w-6 h-6" />
						</div>
						<h3 className="text-lg font-medium mb-2">
							Aucune activité récente
						</h3>
						<p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
							Commencez une formation pour voir votre activité
							apparaître ici.
						</p>
						<Button
							onClick={() =>
								(window.location.href = "/wisetrainer")
							}
						>
							Explorer les formations
						</Button>
					</div>
				</Card>
			) : (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{projects.map((project) => (
						<motion.div
							key={project.id}
							variants={itemVariants}
							className="h-full"
						>
							<Card
								className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light"
								noPaddingTop
								onClick={() => handleProjectClick(project)}
							>
								<div className="relative h-40 w-full">
									<Image
										src={project.imageUrl}
										alt={project.name}
										fill
										className="object-cover"
										onError={(e) => {
											e.target.src =
												"/images/png/placeholder.png";
										}}
									/>
									<div className="absolute top-2 right-2">
										{getStatusBadge(project.progress)}
									</div>
								</div>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg line-clamp-1">
										{project.name}
									</CardTitle>
									<CardDescription>
										Modifié:{" "}
										{formatDate(project.lastModified)}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-grow">
									{project.progress !== undefined && (
										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-sm text-muted-foreground">
													Progression
												</span>
												<span className="text-sm font-medium">
													{project.progress}%
												</span>
											</div>
											<Progress
												value={project.progress}
												className="h-2"
											/>
										</div>
									)}
								</CardContent>
								<div className="px-6 pb-4">
									<Button
										className="w-full"
										variant={
											project.progress === 0
												? "default"
												: "outline"
										}
									>
										{project.progress === 0
											? "Commencer"
											: project.progress === 100
											? "Revoir"
											: "Continuer"}
									</Button>
								</div>
							</Card>
						</motion.div>
					))}
				</motion.div>
			)}
		</div>
	);
}
