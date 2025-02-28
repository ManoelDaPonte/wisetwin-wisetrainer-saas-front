//components/overview/RecentProjectsSection.jsx
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

	return (
		<div className="mb-10">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
					Recent Projects
				</h2>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<Card key={i} className="overflow-hidden">
							<div className="animate-pulse">
								<div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
								<div className="p-4">
									<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
								</div>
							</div>
						</Card>
					))}
				</div>
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
								className="flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light"
								onClick={() => handleProjectClick(project)}
							>
								<div className="relative h-40">
									<Image
										src={
											project.imageUrl ||
											"/images/placeholder.jpg"
										}
										alt={project.name}
										fill
										className="object-cover"
									/>
									<div className="absolute top-2 right-2">
										<Badge
											className={
												project.type === "digitalTwin"
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
													: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
											}
										>
											{project.type === "digitalTwin"
												? "Digital Twin"
												: "Training"}
										</Badge>
									</div>
								</div>
								<CardHeader className="pb-2">
									<CardTitle className="text-lg">
										{project.name}
									</CardTitle>
									<CardDescription>
										{project.lastModified
											? `Modified: ${new Date(
													project.lastModified
											  ).toLocaleDateString()}`
											: `Accessed: ${new Date(
													project.lastAccessed
											  ).toLocaleDateString()}`}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-grow">
									{project.progress < 100 &&
										project.type === "wiseTrainer" && (
											<div className="space-y-2">
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">
														Progress
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
							</Card>
						</motion.div>
					))}
				</motion.div>
			)}
		</div>
	);
}
