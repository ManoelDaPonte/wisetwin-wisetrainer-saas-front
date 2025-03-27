// components/wisetrainer/WiseTrainerCourses.jsx
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import PersonalCoursesTab from "@/components/wisetrainer/courses/PersonalCoursesTab";
import CatalogCoursesTab from "@/components/wisetrainer/courses/CatalogCoursesTab";
import CatalogOrganizationTab from "@/components/wisetrainer/courses/CatalogOrganizationTab";
import { processBuildNames } from "@/components/wisetrainer/courses/helper";
import { useToast } from "@/lib/hooks/useToast";

export default function WiseTrainerCourses() {
	const router = useRouter();
	const { containerName, isLoading: containerLoading } = useAzureContainer();
	const [activeTab, setActiveTab] = useState("personal");
	const [personalCourses, setPersonalCourses] = useState([]);
	const [availableCourses, setAvailableCourses] = useState([]);
	const [organizationCourses, setOrganizationCourses] = useState([]);
	const [userOrganizations, setUserOrganizations] = useState([]);
	const [selectedOrgId, setSelectedOrgId] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingOrg, setIsLoadingOrg] = useState(true);
	const [flippedCardId, setFlippedCardId] = useState(null);
	const [isImporting, setIsImporting] = useState(false);
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

	// Effet pour charger les formations personnelles et du catalogue
	useEffect(() => {
		if (containerName) {
			fetchData();
			fetchUserOrganizations();
		}
	}, [containerName]);

	// Effet pour charger les formations de l'organisation sélectionnée
	useEffect(() => {
		if (selectedOrgId) {
			fetchOrganizationCourses(selectedOrgId);
		}
	}, [selectedOrgId]);

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
				WISETRAINER_CONFIG,
				"wisetwin" // Spécifier explicitement la source comme WiseTwin
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

						// Déterminer la source (WiseTwin ou organisation)
						// Par défaut, les formations sont considérées comme venant de WiseTwin
						let courseSource = {
							type: "wisetwin",
							name: "WiseTwin",
						};

						// Si le cours a un attribut d'organisation, l'utiliser comme source
						if (build.organizationId || courseInfo.organizationId) {
							// Chercher l'organisation correspondante
							const orgId =
								build.organizationId ||
								courseInfo.organizationId;
							const organization = userOrganizations.find(
								(org) => org.id === orgId
							);

							if (organization) {
								courseSource = {
									type: "organization",
									name: organization.name,
								};
							}
						}

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
							source: courseSource,
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

	// Récupérer la liste des organisations dont l'utilisateur est membre
	const fetchUserOrganizations = async () => {
		try {
			const response = await axios.get("/api/organization");
			if (response.data.organizations) {
				setUserOrganizations(response.data.organizations);
				// Si l'utilisateur appartient à au moins une organisation, sélectionner la première par défaut
				if (response.data.organizations.length > 0) {
					setSelectedOrgId(response.data.organizations[0].id);
				}
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des organisations:",
				error
			);
			setUserOrganizations([]);
		}
	};

	// Récupérer les formations spécifiques à une organisation
	const fetchOrganizationCourses = async (organizationId) => {
		setIsLoadingOrg(true);
		try {
			console.log(
				`Récupération des formations pour l'organisation ${organizationId}`
			);
			const response = await axios.get(
				`/api/organization/${organizationId}/builds`
			);

			// Récupérer l'organisation sélectionnée
			const selectedOrganization = userOrganizations.find(
				(org) => org.id === organizationId
			);

			if (response.data.builds) {
				console.log(
					`${response.data.builds.length} formations trouvées dans l'organisation`
				);

				// Ajouter l'ID et le nom de l'organisation, ainsi que la source, à chaque formation
				const organizationCourses = response.data.builds.map(
					(build) => ({
						...build,
						organizationId: organizationId,
						containerName: response.data.containerName, // Stocker également le nom du container
						source: {
							type: "organization",
							organizationId: organizationId,
							name: selectedOrganization
								? selectedOrganization.name
								: "Organisation",
						},
					})
				);

				setOrganizationCourses(organizationCourses);
			} else {
				console.log("Aucune formation trouvée dans l'organisation");
				setOrganizationCourses([]);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des formations de l'organisation:",
				error
			);
			toast({
				title: "Erreur",
				description:
					"Impossible de récupérer les formations de l'organisation",
				variant: "destructive",
			});
			setOrganizationCourses([]);
		} finally {
			setIsLoadingOrg(false);
		}
	};

	const handleSelectOrganization = (orgId) => {
		setSelectedOrgId(orgId);
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

	// Fonction pour s'inscrire à un cours d'organisation
	const handleEnrollOrgCourse = async (course) => {
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
			// Récupérer l'organisation sélectionnée
			const selectedOrg = userOrganizations.find(
				(org) => org.id === selectedOrgId
			);

			if (!selectedOrg) {
				throw new Error("Organisation non trouvée");
			}

			// Utiliser l'API d'inscription standard, en ajoutant les métadonnées d'organisation
			await axios.post(
				`${WISETRAINER_CONFIG.API_ROUTES.IMPORT_BUILD}/${containerName}/${course.id}`,
				{
					// Ajouter les métadonnées d'organisation
					metadata: {
						source: {
							type: "organization",
							organizationId: selectedOrgId,
							name: selectedOrg.name,
						},
					},
					// Indiquer le container source (celui de l'organisation)
					sourceContainer:
						selectedOrg.azureContainer || course.containerName,
				}
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
						Organisation
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
						organizations={userOrganizations}
						selectedOrganizationId={selectedOrgId}
						onSelectOrganization={handleSelectOrganization}
						trainings={organizationCourses}
						isLoading={isLoadingOrg}
						onCourseSelect={handleCourseSelect}
						onEnroll={handleEnrollOrgCourse}
						onToggleInfo={toggleCardFlip}
						flippedCardId={flippedCardId}
						personalCourses={personalCourses}
						isImporting={isImporting}
						containerVariants={containerVariants}
						itemVariants={itemVariants}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
