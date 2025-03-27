//components/wisetrainer/WiseTrainerCourses.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import { useOrganization } from "@/lib/hooks/useOrganization";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import PersonalCoursesTab from "@/components/wisetrainer/courses/PersonalCoursesTab";
import CatalogCoursesTab from "@/components/wisetrainer/courses/CatalogCoursesTab";
import CatalogOrganizationTab from "@/components/wisetrainer/courses/CatalogOrganizationTab";
import { processBuildNames } from "@/components/wisetrainer/courses/helper";
import { useToast } from "@/lib/hooks/useToast";
import { Building } from "lucide-react";

export default function WiseTrainerCourses() {
	const router = useRouter();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const {
		userOrganizations,
		loadUserOrganizations,
		trainings: orgTrainings,
		groups,
		loadUserTrainings,
		isLoading: orgLoading,
		hasOrganizations,
	} = useOrganization();
	const [activeTab, setActiveTab] = useState("personal");
	const [personalCourses, setPersonalCourses] = useState([]);
	const [availableCourses, setAvailableCourses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [isImporting, setIsImporting] = useState(false);
	const [selectedOrgId, setSelectedOrgId] = useState(null);
	const { toast } = useToast();

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

	// Effet pour charger les organisations
	useEffect(() => {
		if (
			userOrganizations &&
			userOrganizations.length > 0 &&
			!selectedOrgId
		) {
			setSelectedOrgId(userOrganizations[0].id);
		}
	}, [userOrganizations, selectedOrgId]);

	// Effet pour charger les formations de l'organisation sélectionnée
	useEffect(() => {
		if (selectedOrgId) {
			loadUserTrainings(selectedOrgId);
		}
	}, [selectedOrgId, loadUserTrainings]);

	// Effet pour charger les formations personnelles et du catalogue
	useEffect(() => {
		if (containerName) {
			fetchData();
		}

		// Charger les organisations de l'utilisateur
		loadUserOrganizations();
	}, [containerName, loadUserOrganizations]);

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
			const builds = processBuildNames(
				buildsResponse.data.blobs || [],
				WISETRAINER_CONFIG
			);
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
						userBuildsResponse.data.blobs || [],
						WISETRAINER_CONFIG
					);

					// Récupérer la progression de l'utilisateur depuis la base de données
					const userProgressResponse = await axios.get(
						`${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${containerName}`
					);

					// Enrichir les formations utilisateur avec les métadonnées de progression
					const userCourses = userBuilds.map((build) => {
						const progressData =
							userProgressResponse.data.trainings?.find(
								(t) => t.id === build.id
							);

						// Récupérer les infos du cours depuis les cours disponibles
						const courseInfo =
							builds.find((c) => c.id === build.id) || build;

						// S'assurer que le nombre total de modules est correct
						const totalModules = courseInfo.modules
							? courseInfo.modules.length
							: 3; // Valeur par défaut: 3 modules si non spécifié

						// Ce log va nous aider à voir si les données sont bien passées
						console.log(
							"Données de progression pour le cours",
							build.id,
							":",
							progressData
						);

						// Assurons-nous que modules contient les informations correctes
						const moduleData = progressData?.modules || [];

						// Créons une structure de modules combinant les informations du cours et de progression
						const combinedModules = courseInfo.modules
							? courseInfo.modules.map((moduleTemplate) => {
									// Trouver la progression du module correspondant
									const moduleProgress = moduleData.find(
										(m) => m.id === moduleTemplate.id
									);

									return {
										...moduleTemplate,
										completed: moduleProgress
											? moduleProgress.completed
											: false,
										score: moduleProgress
											? moduleProgress.score
											: 0,
									};
							  })
							: [];

						console.log(
							"Modules combinés pour le cours",
							build.id,
							":",
							combinedModules
						);

						return {
							...build,
							progress: progressData?.progress || 0,
							lastAccessed:
								progressData?.lastAccessed ||
								new Date().toISOString(),
							completedModules:
								progressData?.modules?.filter(
									(m) => m.completed
								).length || 0,
							totalModules: totalModules,
							modules:
								combinedModules.length > 0
									? combinedModules
									: moduleData,
						};
					});

					setPersonalCourses(userCourses);
				} catch (error) {
					console.error(
						"Erreur lors de la récupération des formations utilisateur:",
						error
					);
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

	const handleEnrollCourse = async (course) => {
		if (!containerName) {
			toast({
				title: "Erreur d'inscription",
				description:
					"Container non disponible. Veuillez vous reconnecter.",
				variant: "destructive",
			});
			return;
		}

		setIsImporting(course.id);

		try {
			// Importer le cours depuis le container source vers le container de l'utilisateur
			await axios.post(
				`${WISETRAINER_CONFIG.API_ROUTES.IMPORT_BUILD}/${containerName}/${course.id}`
			);

			// Rafraîchir les données
			await fetchData();
			setActiveTab("personal");

			toast({
				title: "Inscription réussie",
				description: `Vous êtes maintenant inscrit à la formation "${course.name}"`,
				variant: "success",
			});
		} catch (error) {
			console.error("Erreur lors de l'inscription au cours:", error);
			toast({
				title: "Échec de l'inscription",
				description: "Une erreur est survenue. Veuillez réessayer.",
				variant: "destructive",
			});
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

				toast({
					title: "Désabonnement réussi",
					description: `Vous n'êtes plus inscrit à la formation "${course.name}"`,
					variant: "success",
				});
			} else {
				throw new Error(
					response.data.error || "Échec du désabonnement"
				);
			}
		} catch (error) {
			console.error("Erreur lors du désabonnement:", error);
			toast({
				title: "Échec du désabonnement",
				description: "Une erreur est survenue. Veuillez réessayer.",
				variant: "destructive",
			});
		}
	};

	const handleCourseSelect = (course) => {
		router.push(`/wisetrainer/${course.id}`);
	};

	const toggleCardFlip = (courseId) => {
		setFlippedCardId(flippedCardId === courseId ? null : courseId);
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
					<TabsTrigger value="organization" className="px-6">
						Organisations
					</TabsTrigger>
				</TabsList>

				<TabsContent value="personal">
					<PersonalCoursesTab
						isLoading={isLoading}
						courses={personalCourses}
						onCourseSelect={handleCourseSelect}
						onUnenroll={handleUnenroll}
						onBrowseCatalog={() => setActiveTab("catalog")}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="catalog">
					<CatalogCoursesTab
						isLoading={isLoading}
						courses={availableCourses}
						personalCourses={personalCourses}
						onEnroll={handleEnrollCourse}
						onToggleInfo={toggleCardFlip}
						flippedCardId={flippedCardId}
						isImporting={isImporting}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>

				<TabsContent value="organization">
					<CatalogOrganizationTab
						isLoading={orgLoading}
						organizations={userOrganizations}
						selectedOrgId={selectedOrgId}
						onOrgSelect={setSelectedOrgId}
						trainings={orgTrainings}
						groups={groups}
						hasOrganizations={hasOrganizations}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
