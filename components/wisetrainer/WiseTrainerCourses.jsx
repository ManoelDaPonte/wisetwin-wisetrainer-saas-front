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
import { Clock } from "lucide-react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

export default function WiseTrainerCourses() {
	const router = useRouter();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [activeTab, setActiveTab] = useState("personal");
	const [personalCourses, setPersonalCourses] = useState([]);
	const [availableCourses, setAvailableCourses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [isImporting, setIsImporting] = useState(false);

	useEffect(() => {
		if (containerName) {
			fetchData();
		}
	}, [containerName]);

	const fetchData = async () => {
		setIsLoading(true);

		try {
			console.log(
				"Récupération des formations avec containerName:",
				containerName
			);

			// Récupérer les formations disponibles dans le container source
			const buildsResponse = await axios.get(
				WISETRAINER_CONFIG.API_ROUTES.LIST_BUILDS,
				{
					params: {
						container: WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE,
					},
				}
			);

			// Transformation des noms de fichiers en objets de formation
			const builds = processBuildNames(buildsResponse.data.blobs || []);
			setAvailableCourses(builds);

			// Récupérer les formations de l'utilisateur
			if (containerName) {
				try {
					// Vérifier les fichiers dans le container de l'utilisateur
					const userBuildsResponse = await axios.get(
						WISETRAINER_CONFIG.API_ROUTES.LIST_BUILDS,
						{
							params: {
								container: containerName,
								prefix: WISETRAINER_CONFIG.BLOB_PREFIXES
									.WISETRAINER,
							},
						}
					);

					// Trouver les cours que l'utilisateur a déjà dans son container
					const userBuilds = processBuildNames(
						userBuildsResponse.data.blobs || []
					);

					// Enrichir les formations utilisateur avec des métadonnées de progression
					// Pour l'instant, simulation d'une progression aléatoire
					const userCourses = userBuilds.map((build) => ({
						...build,
						progress: 0, // Commencer à 0% de progression pour un nouveau cours
						lastAccessed: new Date().toISOString(),
					}));

					setPersonalCourses(userCourses);
				} catch (error) {
					console.error(
						"Erreur lors de la récupération des formations utilisateur:",
						error
					);
					// Si le container n'existe pas encore ou autre erreur, initialiser avec un tableau vide
					setPersonalCourses([]);
				}
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des données de formation:",
				error
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Helper pour transformer les noms de fichiers en objets cours
	const processBuildNames = (blobs) => {
		// Extraire les noms uniques des builds (sans extension)
		const buildNames = new Set();
		blobs.forEach((blob) => {
			// Par exemple: wisetrainer/safety-101.data.gz -> safety-101
			const match = blob.match(
				/(?:wisetrainer\/)?([^\/]+?)(?:\.data\.gz|\.framework\.js\.gz|\.loader\.js|\.wasm\.gz)$/
			);
			if (match && match[1]) {
				buildNames.add(match[1]);
			}
		});

		// Créer des objets cours à partir des noms
		return Array.from(buildNames).map((name) => ({
			id: name,
			name: formatCourseName(name),
			description: `Formation interactive sur ${formatCourseName(
				name
			).toLowerCase()}`,
			imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE, // Utiliser l'image placeholder par défaut
			difficulty: "Intermédiaire",
			duration: "30 min",
			category: "Sécurité industrielle",
		}));
	};

	// Helper pour formater le nom du cours à partir de son ID
	const formatCourseName = (id) => {
		return id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	};

	const handleEnrollCourse = async (course) => {
		if (!containerName) {
			alert("Container non disponible. Veuillez vous reconnecter.");
			return;
		}

		setIsImporting(course.id);

		try {
			// Importer le cours depuis le container source vers le container de l'utilisateur
			await axios.post(
				`${WISETRAINER_CONFIG.API_ROUTES.IMPORT_BUILD}/${containerName}/${course.id}`,
				{
					sourceContainer: WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE,
					destContainer: containerName,
					buildName: course.id,
					destPrefix: WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER,
				}
			);

			// Rafraîchir les données
			await fetchData();
			setActiveTab("personal");
			alert(`Inscription réussie à la formation "${course.name}"!`);
		} catch (error) {
			console.error("Erreur lors de l'inscription au cours:", error);
			alert("Échec de l'inscription au cours. Veuillez réessayer.");
		} finally {
			setIsImporting(null);
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
			// Appeler l'API pour supprimer les fichiers du container
			const response = await axios.delete(
				`${WISETRAINER_CONFIG.API_ROUTES.UNENROLL}/${containerName}/${course.id}`
			);

			if (response.data.success) {
				// Mettre à jour la liste locale
				setPersonalCourses(
					personalCourses.filter((c) => c.id !== course.id)
				);
				alert("Désabonnement réussi.");
			} else {
				throw new Error(
					response.data.error || "Échec du désabonnement"
				);
			}
		} catch (error) {
			console.error("Erreur lors du désabonnement:", error);
			alert(
				"Une erreur est survenue lors du désabonnement. Veuillez réessayer."
			);
		}
	};

	const handleCourseSelect = (course) => {
		router.push(`/wisetrainer/${course.id}`);
	};

	const toggleCardFlip = (courseId) => {
		setFlippedCardId(flippedCardId === courseId ? null : courseId);
	};

	// Animation variants
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.1 },
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { duration: 0.5 },
		},
	};

	// Afficher un message de chargement si le containerName n'est pas encore disponible
	if (containerLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin h-10 w-10 border-4 border-wisetwin-blue border-t-transparent rounded-full mb-4 mx-auto"></div>
					<p>Chargement de vos informations...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			<Tabs
				defaultValue="personal"
				className="w-full"
				onValueChange={setActiveTab}
				value={activeTab}
			>
				<TabsList className="mb-8">
					<TabsTrigger value="personal" className="px-6">
						Mes Formations
					</TabsTrigger>
					<TabsTrigger value="catalog" className="px-6">
						Catalogue
					</TabsTrigger>
				</TabsList>

				<TabsContent value="personal">
					<div className="flex justify-between items-center mb-6">
						<h2 className="text-xl font-semibold text-wisetwin-darkblue dark:text-white">
							Vos programmes de formation
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
								Aucune formation
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-6">
								Inscrivez-vous à une formation depuis notre
								catalogue
							</p>
							<Button
								className="bg-wisetwin-blue hover:bg-wisetwin-blue-light"
								onClick={() => setActiveTab("catalog")}
							>
								Parcourir le catalogue
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
											<Image
												src={course.imageUrl}
												alt={course.name}
												fill
												className="object-cover rounded-t-lg"
												onError={(e) => {
													e.target.src =
														WISETRAINER_CONFIG.DEFAULT_IMAGE;
												}}
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
													{course.difficulty ||
														"Intermédiaire"}
												</Badge>
											</div>
											<CardDescription>
												Dernier accès:{" "}
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
														Progression
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
										<CardFooter className="flex gap-2">
											<Button
												className="flex-1"
												onClick={(e) => {
													e.stopPropagation();
													handleCourseSelect(course);
												}}
											>
												{course.progress > 0
													? "Continuer"
													: "Commencer"}
											</Button>
											<Button
												variant="outline"
												className="flex-shrink-0"
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
							Formations disponibles
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							Découvrez et inscrivez-vous à nos formations
							professionnelles en réalité virtuelle
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
												onError={(e) => {
													e.target.src =
														WISETRAINER_CONFIG.DEFAULT_IMAGE;
												}}
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
												Durée: {course.duration}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
												{course.description}
											</p>

											{flippedCardId === course.id && (
												<div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
													<h4 className="font-semibold mb-2">
														Ce que vous apprendrez:
													</h4>
													<ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
														<li>
															Protocoles de
															sécurité et bonnes
															pratiques
														</li>
														<li>
															Évaluation des
															risques
														</li>
														<li>
															Procédures
															d'intervention
															d'urgence
														</li>
														<li>
															Conformité aux
															normes industrielles
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
													isImporting === course.id ||
													personalCourses.some(
														(c) =>
															c.id === course.id
													)
												}
											>
												{isImporting === course.id
													? "Inscription..."
													: personalCourses.some(
															(c) =>
																c.id ===
																course.id
													  )
													? "Déjà inscrit"
													: "S'inscrire"}
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
													? "Moins d'infos"
													: "Plus d'infos"}
											</Button>
										</CardFooter>
									</Card>
								</motion.div>
							))}
						</motion.div>
					)}
				</TabsContent>
			</Tabs>

			{/* Debugging - peut être supprimé en production */}
			<div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
				<p>Container utilisateur: {containerName || "Non défini"}</p>
			</div>
		</div>
	);
}
