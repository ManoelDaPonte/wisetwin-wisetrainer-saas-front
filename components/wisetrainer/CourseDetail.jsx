//components/wisetrainer/CourseDetail.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useUser } from "@/newlib/hooks/useUser";
import CourseDetailHeader from "@/components/wisetrainer/course/CourseDetailHeader";
import CourseDetailsTab from "@/components/wisetrainer/course/CourseDetailsTab";
import CourseTrainingTab from "@/components/wisetrainer/course/CourseTrainingTab";
import QuestionnaireModal from "@/components/wisetrainer/QuestionnaireModal";
import InteractiveGuideModal from "@/components/wisetrainer/InteractiveGuideModal";
import InformationModal from "@/components/wisetrainer/InformationModal";
import { useUnityEvents } from "@/lib/hooks/useUnityEvents";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import { useToast } from "@/lib/hooks/useToast";
import Spinner from "@/components/common/Spinner";

export default function CourseDetail({ params, activeContext, organization }) {
	const router = useRouter();
	const { user } = useUser();
	const [courseId, setCourseId] = useState(params?.courseId || null);
	const [course, setCourse] = useState(null);
	const [userProgress, setUserProgress] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isInitializingProgress, setIsInitializingProgress] = useState(false);
	const [hasInitializedProgress, setHasInitializedProgress] = useState(false);
	const unityBuildRef = useRef(null);
	const [activeTab, setActiveTab] = useState("details");
	const [selectedModule, setSelectedModule] = useState(null);
	const { toast } = useToast();
	
	// Déterminer le container à utiliser selon le contexte
	const containerName = activeContext?.type !== 'organization' 
		? user?.azureContainer 
		: organization?.azureContainer;

	// Fonction pour fermer la modale d'information
	const closeInformation = () => {
		setShowInformation(false);
		setCurrentInformation(null);
	};

	const handleSwitchTab = (tabId) => {
		setActiveTab(tabId);
	};

	// Utiliser le hook d'événements Unity
	const {
		currentScenario,
		currentGuide,
		currentInformation,
		showQuestionnaire,
		showGuide,
		showInformation,
		setShowQuestionnaire,
		setShowGuide,
		setShowInformation,
		setCurrentScenario,
		setCurrentGuide,
		setCurrentInformation,
	} = useUnityEvents(courseId);

	// Extraire courseId des paramètres
	useEffect(() => {
		if (params?.courseId) {
			setCourseId(params.courseId);
		}
	}, [params]);

	// État pour suivre si les fichiers ont été téléchargés
	const [filesDownloaded, setFilesDownloaded] = useState(false);

	// Fonction dédiée pour vérifier l'existence des fichiers
	const checkFilesExistence = async () => {
		try {
			if (!courseId || !containerName) return false;

			console.log("Vérification de l'existence des fichiers de formation");
			
			// Dans le nouveau système, on vérifie toujours dans le container source
			// En mode organisation, les fichiers sont dans le container de l'organisation
			// En mode personnel, pour l'instant on vérifie dans le container personnel
			// (mais à terme, on pourrait aussi charger depuis l'organisation source)
			const checkResponse = await axios.get(
				`${WISETRAINER_CONFIG.API_ROUTES.CHECK_BLOB}`,
				{
					params: {
						container: containerName,
						blob: `${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${courseId}.loader.js`,
					},
				}
			);

			const filesExist = checkResponse.data.exists;
			console.log(`Fichiers ${filesExist ? "trouvés" : "non trouvés"} dans le container`);
			setFilesDownloaded(filesExist);
			return filesExist;
		} catch (error) {
			console.error("Erreur lors de la vérification des fichiers:", error);
			return false;
		}
	};

	// Fonction dédiée pour télécharger les fichiers
	const downloadTrainingFiles = async () => {
		// Dans le nouveau système, on ne copie plus les fichiers
		// Les fichiers sont chargés directement depuis le container source
		// Cette fonction est conservée pour la compatibilité mais ne fait rien
		setFilesDownloaded(true);
	};

	// Récupérer les détails du cours et la progression
	useEffect(() => {
		if (!courseId || !user?.azureContainer) return;

		const fetchCourseDetails = async () => {
			try {
				setIsLoading(true);

				// Déterminer l'URL selon le contexte
				let detailsUrl;
				if (activeContext?.type !== 'organization') {
					detailsUrl = `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${courseId}`;
				} else {
					detailsUrl = `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/organization/${organization.id}/${courseId}`;
				}

				const [courseResponse, progressResponse] = await Promise.all([
					axios.get(detailsUrl),
					axios.get(`${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${user?.id}?sourceContainer=${containerName}`),
				]);

				setCourse(courseResponse.data);

				// Trouver la progression pour ce cours
				if (progressResponse.data.courses) {
					const courseProgress = progressResponse.data.courses.find(
						(c) => c.courseId === courseId
					);
					setUserProgress(courseProgress || null);
					console.log("Progression utilisateur trouvée:", courseProgress);
				}

				// Vérifier l'existence des fichiers
				await checkFilesExistence();
			} catch (error) {
				console.error("Erreur lors du chargement du cours:", error);
				toast({
					title: "Erreur de chargement",
					description: "Impossible de charger les détails du cours.",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		};

		fetchCourseDetails();
	}, [courseId, user, activeContext, organization]);

	// Initialiser la progression si nécessaire
	useEffect(() => {
		const initializeProgress = async () => {
			if (
				!courseId ||
				!user?.azureContainer ||
				!course ||
				userProgress ||
				isInitializingProgress ||
				hasInitializedProgress
			) {
				return;
			}

			try {
				setIsInitializingProgress(true);
				console.log("Initialisation de la progression pour le cours:", courseId);

				const response = await axios.post(
					`${WISETRAINER_CONFIG.API_ROUTES.INITIALIZE_PROGRESS}`,
					{
						userId: user.id,
						courseId: courseId,
						organizationId: activeContext?.type === 'organization' ? organization?.id : null,
						sourceContainer: containerName
					}
				);

				if (response.data.success) {
					setUserProgress(response.data.progress);
					setHasInitializedProgress(true);
				}
			} catch (error) {
				console.error("Erreur lors de l'initialisation de la progression:", error);
			} finally {
				setIsInitializingProgress(false);
			}
		};

		initializeProgress();
	}, [courseId, user, course, userProgress, isInitializingProgress, hasInitializedProgress, activeContext, organization]);

	const handleModuleSelect = async (module) => {
		setSelectedModule(module);

		// Télécharger les fichiers si nécessaire
		if (!filesDownloaded) {
			await downloadTrainingFiles();
		}

		// Afficher l'onglet d'entraînement
		setActiveTab("training");
	};

	const closeQuestionnaire = () => {
		setShowQuestionnaire(false);
		setCurrentScenario(null);
	};

	const closeGuide = () => {
		setShowGuide(false);
		setCurrentGuide(null);
	};

	const handleQuestionnaireSubmit = async (responses) => {
		try {
			const response = await axios.post(
				`${WISETRAINER_CONFIG.API_ROUTES.SAVE_QUESTIONNAIRE}`,
				{
					userId: user?.id,
					courseId: courseId,
					scenarioId: currentScenario?.id,
					responses: responses,
					timestamp: new Date().toISOString(),
					sourceContainer: containerName
				}
			);

			if (response.data.success) {
				console.log("Réponses du questionnaire sauvegardées");
				toast({
					title: "Questionnaire complété",
					description: "Vos réponses ont été enregistrées avec succès.",
					variant: "success",
				});
			}
		} catch (error) {
			console.error("Erreur lors de la sauvegarde du questionnaire:", error);
			toast({
				title: "Erreur",
				description: "Impossible d'enregistrer vos réponses.",
				variant: "destructive",
			});
		}

		closeQuestionnaire();
	};

	const updateProgress = async (newProgress) => {
		try {
			const response = await axios.post(
				`${WISETRAINER_CONFIG.API_ROUTES.UPDATE_PROGRESS}`,
				{
					userId: user?.id,
					courseId: courseId,
					progress: newProgress,
					completedAt: newProgress === 100 ? new Date().toISOString() : null,
					sourceContainer: containerName
				}
			);

			if (response.data.success) {
				setUserProgress((prev) => ({
					...prev,
					progress: newProgress,
					completedAt: newProgress === 100 ? new Date().toISOString() : prev?.completedAt,
				}));
			}
		} catch (error) {
			console.error("Erreur lors de la mise à jour de la progression:", error);
		}
	};

	if (isLoading || !user) {
		return (
			<div className="container mx-auto py-8 h-[70vh]">
				<Spinner 
					text="Chargement du cours..." 
					size="md" 
					centered={true}
				/>
			</div>
		);
	}

	if (!course) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">
					<p className="text-gray-600 dark:text-gray-300">Cours introuvable</p>
					<Button onClick={() => router.push("/wisetrainer")} className="mt-4">
						Retour aux formations
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<Button
				variant="ghost"
				onClick={() => router.push("/wisetrainer")}
				className="mb-4"
			>
				<ArrowLeft className="mr-2 h-4 w-4" /> Retour aux formations
			</Button>

			<CourseDetailHeader
				course={course}
				userProgress={userProgress}
				organizationName={activeContext?.type === 'organization' ? organization?.name : null}
			/>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="details">Détails</TabsTrigger>
					<TabsTrigger value="training">Entraînement</TabsTrigger>
				</TabsList>

				<TabsContent value="details">
					<CourseDetailsTab
						course={course}
						userProgress={userProgress}
						onModuleSelect={handleModuleSelect}
						onSwitchTab={handleSwitchTab}
					/>
				</TabsContent>

				<TabsContent value="training">
					<CourseTrainingTab
						ref={unityBuildRef}
						course={course}
						selectedModule={selectedModule}
						containerName={containerName}
						filesDownloaded={filesDownloaded}
						isDownloading={false}
						downloadTrainingFiles={downloadTrainingFiles}
						updateProgress={updateProgress}
						activeContext={activeContext}
						organization={organization}
					/>
				</TabsContent>
			</Tabs>

			{/* Modales */}
			<QuestionnaireModal
				isOpen={showQuestionnaire}
				onClose={closeQuestionnaire}
				scenario={currentScenario}
				onSubmit={handleQuestionnaireSubmit}
			/>

			<InteractiveGuideModal
				isOpen={showGuide}
				onClose={closeGuide}
				guide={currentGuide}
			/>

			<InformationModal
				isOpen={showInformation}
				onClose={closeInformation}
				information={currentInformation}
			/>
		</div>
	);
}