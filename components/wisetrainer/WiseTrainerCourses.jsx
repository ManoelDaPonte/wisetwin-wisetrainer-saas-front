// app/wisetrainer/WiseTrainerCourses.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Info, Clock, BookOpen } from "lucide-react";
import axios from "axios";

export default function WiseTrainerCourses() {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("personal");
	const [personalCourses, setPersonalCourses] = useState([]);
	const [availableCourses, setAvailableCourses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [isImporting, setIsImporting] = useState(false);

	const fetchData = async () => {
		setIsLoading(true);

		try {
			// Récupérer les formations disponibles
			const buildsResponse = await axios.get(
				"/api/azure/wisetrainer/builds"
			);
			setAvailableCourses(buildsResponse.data.builds || []);

			// Récupérer les formations inscrites par l'utilisateur
			if (metadata?.azure_container_name) {
				const userTrainingsResponse = await axios.get(
					`/api/db/wisetrainer/user-trainings/${metadata.azure_container_name}`
				);

				// Vérifier si les formations existent toujours dans Azure
				const userTrainings =
					userTrainingsResponse.data.trainings || [];
				const validTrainings = [];

				for (const training of userTrainings) {
					// Vérifier si le fichier existe toujours dans Azure
					try {
						const blobExists = await axios.get(
							"/api/azure/check-blob-exists",
							{
								params: {
									container: metadata.azure_container_name,
									blob: `wisetrainer/${training.id}.data.gz`,
								},
							}
						);

						if (blobExists.data.exists) {
							validTrainings.push(training);
						} else {
							console.log(
								`Formation ${training.id} supprimée d'Azure, nettoyage en cours...`
							);
							// Supprimer de la BD
							await axios.delete(
								`/api/db/wisetrainer/unenroll/${metadata.azure_container_name}/${training.id}`
							);
						}
					} catch (error) {
						console.error(
							`Erreur lors de la vérification de ${training.id}:`,
							error
						);
						// En cas d'erreur, on conserve quand même la formation
						validTrainings.push(training);
					}
				}

				// Enrichir les données avec les informations des formations disponibles
				const enrichedTrainings = validTrainings.map((training) => {
					// Recherche plus stricte pour éviter les doublons
					const availableCourse = buildsResponse.data.builds.find(
						(build) => build.id === training.id
					);

					// Si aucune correspondance exacte, utiliser une correspondance par nom
					const matchedCourse =
						availableCourse ||
						buildsResponse.data.builds.find(
							(build) => build.name === training.name
						);

					return {
						...training,
						name: matchedCourse?.name || training.name,
						description:
							matchedCourse?.description ||
							"No description available",
						difficulty: matchedCourse?.difficulty || "Intermediate",
						duration: matchedCourse?.duration || "30m",
						category: matchedCourse?.category || "Safety",
						imageUrl: matchedCourse?.imageUrl || training.imageUrl,
					};
				});

				setPersonalCourses(enrichedTrainings);
			}
		} catch (error) {
			console.error("Error fetching training data:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleUnenroll = async (course) => {
		if (
			!confirm(
				`Êtes-vous sûr de vouloir vous désabonner de "${course.name}"? Votre progression sera perdue.`
			)
		) {
			return;
		}

		try {
			await axios.delete(
				`/api/db/wisetrainer/unenroll/${metadata.azure_container_name}/${course.id}`
			);

			// Mettre à jour la liste des formations
			setPersonalCourses(
				personalCourses.filter((c) => c.id !== course.id)
			);
			alert("Vous avez été désabonné avec succès.");
		} catch (error) {
			console.error("Erreur lors du désabonnement:", error);
			alert("Une erreur est survenue lors du désabonnement.");
		}
	};

	const handleCourseSelect = (course) => {
		// Naviguer vers la page de cours spécifique
		router.push(`/wisetrainer/${course.id}`);
	};

	const handleEnrollCourse = async (course) => {
		if (!metadata?.azure_container_name) {
			alert("User metadata not available. Please try again later.");
			return;
		}

		setIsImporting(course.id);

		try {
			// Importer le cours dans le container de l'utilisateur
			await axios.post(
				`/api/azure/wisetrainer/import/${metadata.azure_container_name}/${course.name}`
			);

			// Rafraîchir les données après l'import
			await fetchData();

			// Changer d'onglet pour montrer les cours inscrits
			setActiveTab("personal");

			// Notification de succès
			alert(`Successfully enrolled in ${course.name} training!`);
		} catch (error) {
			console.error("Error enrolling in course:", error);
			alert("Failed to enroll in course. Please try again.");
		} finally {
			setIsImporting(null);
		}
	};

	const toggleCardFlip = (courseId) => {
		if (flippedCardId === courseId) {
			setFlippedCardId(null);
		} else {
			setFlippedCardId(courseId);
		}
	};

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
				duration: 0.5,
			},
		},
	};

	// Animation pour le flip de la carte
	const cardVariants = {
		front: {
			rotateY: 0,
			transition: { duration: 0.5 },
		},
		back: {
			rotateY: 180,
			transition: { duration: 0.5 },
		},
	};

	return (
		<div className="container mx-auto p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
					WiseTrainer™ Programs
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					Interactive industrial safety and operational training
					courses
				</p>
			</div>

			<Tabs
				defaultValue="personal"
				className="w-full"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-8">
					<TabsTrigger value="personal" className="px-6">
						My Training
					</TabsTrigger>
					<TabsTrigger value="catalog" className="px-6">
						Course Catalog
					</TabsTrigger>
				</TabsList>

				<TabsContent value="personal">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
							Your Training Programs
						</h2>
					</div>

					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<Card key={i} className="h-full">
									<div className="animate-pulse">
										<div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
										<CardHeader>
											<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
										</CardHeader>
										<CardContent>
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
										</CardContent>
									</div>
								</Card>
							))}
						</div>
					) : personalCourses.length === 0 ? (
						<div className="text-center py-16">
							<div className="text-4xl mb-4">🎓</div>
							<h3 className="text-lg font-medium mb-2">
								No courses yet
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-6">
								Enroll in a course from our catalog to get
								started
							</p>
							<Button
								className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
								onClick={() => setActiveTab("catalog")}
							>
								Browse Courses
							</Button>
						</div>
					) : (
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
						>
							{personalCourses.map((course) => (
								<motion.div
									key={course.id}
									variants={itemVariants}
								>
									<Card
										className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer border-2 hover:border-wisetwin-blue dark:hover:border-wisetwin-blue-light"
										onClick={() =>
											handleCourseSelect(course)
										}
									>
										<div className="relative h-48 w-full">
											<div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
												<Image
													src={
														course.imageUrl ||
														"/images/wisetrainer/training-default.jpg"
													}
													alt={course.name}
													fill
													className="object-cover"
													onError={(e) => {
														e.target.src =
															"/images/wisetrainer/training-default.jpg";
													}}
												/>
											</div>
										</div>
										<CardHeader>
											<div className="flex justify-between items-start">
												<CardTitle>
													{course.name}
												</CardTitle>
												<Badge
													variant="outline"
													className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
												>
													{course.difficulty ||
														"Intermediate"}
												</Badge>
											</div>
											<CardDescription>
												Last accessed:{" "}
												{new Date(
													course.lastAccessed
												).toLocaleDateString()}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
												{course.description}
											</p>
											<div className="space-y-2">
												<div className="flex justify-between">
													<span className="text-sm text-muted-foreground">
														Progress
													</span>
													<span className="text-sm font-medium">
														{course.progress}%
													</span>
												</div>
												<Progress
													value={course.progress}
													className="h-2"
												/>
											</div>
										</CardContent>
										<CardFooter>
											<Button
												className="w-full"
												onClick={(e) => {
													e.stopPropagation();
													handleCourseSelect(course);
												}}
											>
												{course.progress > 0
													? "Continue Training"
													: "Start Training"}
											</Button>
											<Button
												variant="outline"
												className="flex-1"
												onClick={(e) => {
													e.stopPropagation();
													handleUnenroll(course);
												}}
											>
												Supprimer
											</Button>
										</CardFooter>
									</Card>
								</motion.div>
							))}
						</motion.div>
					)}
				</TabsContent>

				<TabsContent value="catalog">
					<div className="mb-6">
						<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
							Available Training Programs
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							Discover and enroll in professional training
							programs for your industry
						</p>
					</div>

					{isLoading ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{[1, 2, 3].map((i) => (
								<Card key={i} className="h-full">
									<div className="animate-pulse">
										<div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
										<CardHeader>
											<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
										</CardHeader>
										<CardContent>
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
											<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
										</CardContent>
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
							{availableCourses.map((course) => (
								<motion.div
									key={course.id}
									variants={itemVariants}
								>
									<Card className="h-full hover:shadow-lg transition-shadow duration-300">
										<div className="relative h-48 w-full">
											<Image
												src={course.imageUrl}
												alt={course.name}
												fill
												className="object-cover rounded-t-lg"
											/>
										</div>
										<CardHeader>
											<div className="flex justify-between items-start">
												<CardTitle>
													{course.name}
												</CardTitle>
												<Badge
													variant="outline"
													className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
												>
													{course.difficulty}
												</Badge>
											</div>
											<CardDescription className="flex items-center">
												<Clock className="h-4 w-4 mr-1" />
												Duration: {course.duration}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
												{course.description}
											</p>

											{flippedCardId === course.id && (
												<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
													<h4 className="font-semibold mb-2">
														What you'll learn:
													</h4>
													<ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
														<li>
															Safety protocols and
															best practices
														</li>
														<li>
															Risk assessment and
															hazard
															identification
														</li>
														<li>
															Emergency response
															procedures
														</li>
														<li>
															Compliance with
															industry standards
														</li>
													</ul>
												</div>
											)}
										</CardContent>
										<CardFooter className="flex gap-4">
											<Button
												className="flex-1 bg-wisetwin-blue hover:bg-wisetwin-blue-light"
												onClick={() =>
													handleEnrollCourse(course)
												}
												disabled={
													isImporting === course.id
												}
											>
												{isImporting === course.id
													? "Enrolling..."
													: "Enroll"}
											</Button>
											<Button
												className="flex-1"
												variant="outline"
												onClick={(e) => {
													e.preventDefault();
													toggleCardFlip(course.id);
												}}
											>
												{flippedCardId === course.id
													? "Less Info"
													: "More Info"}
											</Button>
										</CardFooter>
									</Card>
								</motion.div>
							))}
						</motion.div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
