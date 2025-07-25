//components/wisetrainer/CourseDetail.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";
import CourseDetailHeader from "@/components/wisetrainer/course/CourseDetailHeader";
import CourseDetailsTab from "@/components/wisetrainer/course/CourseDetailsTab";
import CourseTrainingTab from "@/components/wisetrainer/course/CourseTrainingTab";
import QuestionnaireModal from "@/components/wisetrainer/QuestionnaireModal";
import InteractiveGuideModal from "@/components/wisetrainer/InteractiveGuideModal";
import AIInsideNotice from "@/components/wisetrainer/AIInsideNotice";
import InformationModal from "@/components/wisetrainer/InformationModal";
import { useUnityEvents } from "@/lib/hooks/useUnityEvents";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import { useToast } from "@/lib/hooks/useToast";
import { useInformationModal } from "@/lib/hooks/useInformationModal";
import Spinner from "@/components/common/Spinner";

export default function CourseDetail({ params }) {
  const router = useRouter();
  const { containerName, isLoading: containerLoading } = useAzureContainer();
  const [courseId, setCourseId] = useState(params?.courseId || null);
  const [organizationId, setOrganizationId] = useState(
    params?.organizationId || null
  ); // Ajout de cet état
  const [course, setCourse] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializingProgress, setIsInitializingProgress] = useState(false);
  const [hasInitializedProgress, setHasInitializedProgress] = useState(false);
  const unityBuildRef = useRef(null);
  const [activeTab, setActiveTab] = useState("details");
  const [selectedModule, setSelectedModule] = useState(null);
  const { toast } = useToast();

  // Nous n'avons plus besoin d'utiliser useInformationModal car useUnityEvents gère déjà cela
  // Créons juste une fonction pour fermer la modale d'information
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

    if (params?.organizationId) {
      setOrganizationId(params.organizationId);
    }
  }, [params]);

  // État pour suivre si les fichiers ont été téléchargés
  const [filesDownloaded, setFilesDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // État pour la notice AI Inside
  const [showAIInsideNotice, setShowAIInsideNotice] = useState(false);

  // Fonction dédiée pour vérifier l'existence des fichiers
  const checkFilesExistence = async () => {
    try {
      if (!courseId || !containerName || containerLoading) return false;

      console.log("Vérification de l'existence des fichiers de formation");
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
      console.log(
        `Fichiers ${filesExist ? "trouvés" : "non trouvés"} dans le container`
      );
      setFilesDownloaded(filesExist);
      return filesExist;
    } catch (error) {
      console.error("Erreur lors de la vérification des fichiers:", error);
      setFilesDownloaded(false);
      return false;
    }
  };

  // Charger les détails du cours quand courseId et containerName sont disponibles
  useEffect(() => {
    if (courseId && containerName && !containerLoading) {
      fetchCourseDetails();
      // Vérifier l'existence des fichiers à chaque chargement
      checkFilesExistence();
    }
  }, [courseId, containerName, containerLoading]);

  // Vérifier à nouveau les fichiers après le chargement des détails du cours
  useEffect(() => {
    // Si nous avons les détails du cours et de la progression, vérifier les fichiers
    if (
      course &&
      userProgress &&
      containerName &&
      !containerLoading &&
      !isLoading
    ) {
      console.log(
        "Vérification de l'existence des fichiers après chargement des données du cours"
      );
      checkFilesExistence();
    }
  }, [course, userProgress, isLoading]);

  // Initialiser automatiquement la progression lorsque l'utilisateur accède au cours
  useEffect(() => {
    // Si nous avons les détails du cours et qu'aucune progression n'existe ou est à 0%
    if (
      course &&
      containerName &&
      !containerLoading &&
      !hasInitializedProgress &&
      (!userProgress || userProgress.progress === 0)
    ) {
      initializeProgress();
    }
  }, [
    course,
    userProgress,
    containerName,
    containerLoading,
    hasInitializedProgress,
  ]);

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    try {
      // URL différente pour les cours d'organisation
      const apiUrl = organizationId
        ? `${WISETRAINER_CONFIG.API_ROUTES.ORGANIZATION_COURSE_DETAILS}/${organizationId}/${courseId}`
        : `${WISETRAINER_CONFIG.API_ROUTES.COURSE_DETAILS}/${courseId}`;

      // Charger les détails du cours depuis le fichier de configuration
      let courseConfig;
      try {
        console.log("Tentative de chargement du fichier de configuration...");
        courseConfig = require(`@/lib/config/wisetrainer/courses/${courseId}.json`);
        console.log("Configuration chargée:", courseConfig);
      } catch (e) {
        console.warn(
          `Fichier de configuration pour ${courseId} non trouvé:`,
          e
        );
        courseConfig = {
          id: courseId,
          name: formatCourseName(courseId),
          description: `Formation complète sur ${formatCourseName(
            courseId
          ).toLowerCase()}. Cette formation vous apprendra les bases essentielles pour maîtriser ${formatCourseName(
            courseId
          ).toLowerCase()} en environnement industriel.`,
          difficulty: "Intermédiaire",
          duration: "45 min",
          category: "Sécurité industrielle",
          modules: [],
        };
      }

      // Récupérer la progression de l'utilisateur depuis l'API
      try {
        console.log("Récupération de la progression de l'utilisateur...");
        const progressResponse = await axios.get(
          `${WISETRAINER_CONFIG.API_ROUTES.USER_TRAININGS}/${containerName}`
        );
        console.log("Réponse de l'API de progression:", progressResponse.data);

        const courseProgress = progressResponse.data.trainings?.find(
          (t) => t.id === courseId
        );
        console.log("Progression pour ce cours:", courseProgress);

        if (courseProgress) {
          // Toujours utiliser le nombre total de modules du cours, pas seulement ceux dans courseProgress
          const totalModulesCount = courseConfig.modules.length;

          setUserProgress({
            progress: courseProgress.progress,
            startDate: courseProgress.startedAt,
            lastAccessed: courseProgress.lastAccessed,
            completedAt: courseProgress.completedAt,
            completedModules:
              courseProgress.modules?.filter((m) => m.completed).length || 0,
            totalModules: totalModulesCount, // Utiliser toujours la taille du tableau modules dans courseConfig
          });

          // Mettre à jour le statut des modules dans courseConfig
          const updatedModules = courseConfig.modules.map((module) => {
            const moduleProgress = courseProgress.modules?.find(
              (m) => m.id === module.id
            );

            return {
              ...module,
              completed: moduleProgress?.completed || false,
              score: moduleProgress?.score || 0,
            };
          });

          // Définir le cours avec les modules mis à jour
          setCourse({
            ...courseConfig,
            modules: updatedModules,
          });
        } else {
          const totalModulesCount = courseConfig.modules.length;

          setUserProgress({
            progress: 0,
            startDate: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            completedModules: 0,
            totalModules: totalModulesCount,
          });

          setCourse(courseConfig);
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de la progression:",
          error
        );

        // En cas d'erreur, utiliser les données du fichier de configuration sans progression
        setUserProgress({
          progress: 0,
          startDate: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          completedModules: 0,
          totalModules: courseConfig.modules.length,
        });

        setCourse(courseConfig);
      }

      console.log("Course state après chargement:", course);
      console.log("UserProgress state après chargement:", userProgress);
    } catch (error) {
      console.error("Erreur détaillée lors du chargement du cours:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement du cours. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialiser la progression de l'utilisateur
  const initializeProgress = async () => {
    if (isInitializingProgress || hasInitializedProgress) return;

    try {
      setIsInitializingProgress(true);
      setIsDownloading(true);

      console.log("Initialisation de la progression pour le cours", courseId);

      // Utiliser notre fonction dédiée pour vérifier l'existence des fichiers
      const filesExist = await checkFilesExistence();

      // Si les fichiers n'existent pas, essayer de les copier d'abord
      if (!filesExist) {
        console.log(
          "Fichiers de formation non trouvés, tentative de copie des fichiers"
        );

        // Utiliser la nouvelle API pour copier les fichiers depuis le container source approprié
        try {
          console.log(
            `Copie des fichiers de formation pour le cours ${courseId}`
          );

          // Appeler la nouvelle API pour copier les fichiers
          const copyResponse = await axios.post(
            WISETRAINER_CONFIG.API_ROUTES.COPY_TRAINING_FILES,
            {
              userId: containerName,
              courseId: courseId,
              organizationId: organizationId,
            }
          );

          if (copyResponse.data.success) {
            console.log("Copie des fichiers réussie:", copyResponse.data);
            setFilesDownloaded(true);
          } else {
            console.warn("Copie partielle des fichiers:", copyResponse.data);
            // Même avec une copie partielle, on considère que c'est téléchargé
            setFilesDownloaded(true);
          }
        } catch (copyError) {
          console.error("Erreur lors de la copie des fichiers:", copyError);

          // En cas d'échec, essayer l'ancienne méthode d'importation comme fallback
          console.log(
            "Tentative d'utilisation de l'ancienne méthode d'importation..."
          );

          // Si nous n'avons pas encore d'informations sur le cours, les récupérer
          let sourceContainer = WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE; // Valeur par défaut

          if (organizationId) {
            try {
              console.log(
                `Formation d'organisation détectée, ID: ${organizationId}, récupération du container...`
              );
              // Récupérer les informations de l'organisation directement
              const orgResponse = await axios.get(
                `/api/organization/${organizationId}`
              );
              if (
                orgResponse.data &&
                orgResponse.data.organization &&
                orgResponse.data.organization.azureContainer
              ) {
                sourceContainer = orgResponse.data.organization.azureContainer;
                console.log(
                  `Container de l'organisation trouvé: ${sourceContainer}`
                );
              } else {
                console.warn(
                  "Container de l'organisation non trouvé, utilisation du container par défaut"
                );
              }
            } catch (orgError) {
              console.error(
                "Erreur lors de la récupération du container de l'organisation:",
                orgError
              );
            }
          }

          console.log(
            `Importation depuis le conteneur source: ${sourceContainer}`
          );

          // Importer depuis le container source
          try {
            await axios.post(
              `${WISETRAINER_CONFIG.API_ROUTES.IMPORT_BUILD}/${containerName}/${courseId}`,
              {
                sourceContainer: sourceContainer,
              }
            );
            setFilesDownloaded(true);
          } catch (importError) {
            console.error(
              "Erreur lors de l'importation des fichiers:",
              importError
            );
            setFilesDownloaded(false);
            toast({
              title: "Erreur de téléchargement",
              description:
                "Impossible de télécharger les fichiers de formation. Veuillez réessayer.",
              variant: "destructive",
            });
          }
        }

        console.log("Opération de copie/importation terminée");

        // Vérifier à nouveau l'existence des fichiers après tentative de copie
        await checkFilesExistence();
      }

      // Déterminer la source correcte en fonction des paramètres
      const sourceType = organizationId ? "organization" : "wisetwin";
      const sourceOrganizationId = organizationId || null;

      console.log("Source pour initialisation:", {
        sourceType,
        sourceOrganizationId,
        courseId,
      });

      // Initialiser la progression à 0% avec les bonnes informations de source
      const response = await axios.post(
        WISETRAINER_CONFIG.API_ROUTES.INITIALIZE_PROGRESS,
        {
          userId: containerName,
          courseId: courseId,
          sourceType: sourceType,
          sourceOrganizationId: sourceOrganizationId,
        }
      );

      if (response.data.success) {
        toast({
          title: "Formation initialisée",
          description:
            "Vous avez commencé cette formation. Votre progression sera enregistrée automatiquement.",
          variant: "info",
        });

        // Rafraîchir les détails pour obtenir la dernière progression
        await fetchCourseDetails();
      }

      setHasInitializedProgress(true);
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation de la progression:",
        error
      );
      toast({
        title: "Erreur d'initialisation",
        description:
          "Erreur lors de l'initialisation. Les données par défaut seront utilisées.",
        variant: "destructive",
      });
    } finally {
      setIsInitializingProgress(false);
      setIsDownloading(false);
    }
  };

  // Helper pour formater le nom du cours
  const formatCourseName = (id) => {
    return id
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleBack = () => {
    router.push("/wisetrainer");
  };

  // const handleScenarioComplete = async (results) => {
  // 	try {
  // 		if (!currentScenario) return;
  //
  // 		// Gérer les différents formats de résultats possibles
  // 		let score;
  // 		if (Array.isArray(results)) {
  // 			// Si c'est un tableau de résultats individuels
  // 			const correctAnswers = results.filter(
  // 				(r) => r.isCorrect
  // 			).length;
  // 			score = Math.round((correctAnswers / results.length) * 100);
  // 			console.log(
  // 				`Scénario ${currentScenario.id} complété avec score: ${score}`
  // 			);
  // 		} else if (typeof results === "object" && results !== null) {
  // 			// Si c'est un seul objet avec un score
  // 			score = results.score || 0;
  // 			console.log(
  // 				`Scénario ${currentScenario.id} complété avec score fourni: ${score}`
  // 			);
  // 		} else if (typeof results === "number") {
  // 			// Si c'est directement un score numérique
  // 			score = Math.round(results);
  // 			console.log(
  // 				`Scénario ${currentScenario.id} complété avec score numérique: ${score}`
  // 			);
  // 		} else {
  // 			// Fallback
  // 			score = 0;
  // 			console.warn(
  // 				`Format de résultats non reconnu pour ${currentScenario.id}`
  // 			);
  // 		}

  const handleScenarioComplete = async (results) => {
    try {
      if (!currentScenario) return;

      // Traitement existant des résultats...
      let score;
      if (Array.isArray(results)) {
        const correctAnswers = results.filter((r) => r.isCorrect).length;
        score = Math.round((correctAnswers / results.length) * 100);
        console.log(
          `Scénario ${currentScenario.id} complété avec score: ${score}`
        );
      } else if (typeof results === "object" && results !== null) {
        score = results.score || 0;
      } else if (typeof results === "number") {
        score = Math.round(results);
      } else {
        score = 0;
      }

      // Fermer le questionnaire
      setShowQuestionnaire(false);

      // Notifier le build Unity que le questionnaire est complété
      if (unityBuildRef.current && unityBuildRef.current.isReady) {
        // Envoyer d'abord le message de complétion du questionnaire
        unityBuildRef.current.completeQuestionnaire(
          currentScenario.id,
          score >= 70
        );

        // Déterminer quelle touche simuler
        let keyToSimulate;

        // Vérifier si le scénario actuel est "general-safety-rules" et si le score est insuffisant
        if (currentScenario.id === "general-safety-rules" && score < 70) {
          // Pour ce module spécifique, si l'utilisateur se trompe, on simule la touche 4
          keyToSimulate = "4";
          console.log(
            `Module ${currentScenario.id} échoué, simulation de la touche '4'`
          );
        } else {
          // Pour les autres modules, conserver la logique existante
          const moduleIndex = course.modules.findIndex(
            (module) => module.id === currentScenario.id
          );
          keyToSimulate = moduleIndex >= 0 ? String(moduleIndex + 1) : "1";
          console.log(
            `Module index: ${moduleIndex}, simulation de la touche '${keyToSimulate}'`
          );
        }

        // Simuler un événement clavier
        console.log(`Simulation de l'appui sur la touche '${keyToSimulate}'`);

        // 1. Créer un événement keydown
        const keydownEvent = new KeyboardEvent("keydown", {
          key: keyToSimulate,
          code: `Digit${keyToSimulate}`,
          keyCode: 48 + parseInt(keyToSimulate), // Codes ASCII: 1 = 49, 2 = 50, etc.
          which: 48 + parseInt(keyToSimulate),
          bubbles: true,
          cancelable: true,
        });

        // 2. Créer un événement keyup (nécessaire pour compléter l'action de touche)
        const keyupEvent = new KeyboardEvent("keyup", {
          key: keyToSimulate,
          code: `Digit${keyToSimulate}`,
          keyCode: 48 + parseInt(keyToSimulate),
          which: 48 + parseInt(keyToSimulate),
          bubbles: true,
          cancelable: true,
        });

        // 3. Dispatcher les événements sur l'élément Unity ou sur le document
        const unityCanvas = document.querySelector("canvas");
        if (unityCanvas) {
          unityCanvas.dispatchEvent(keydownEvent);
          // Petit délai pour que ça semble naturel
          setTimeout(() => {
            unityCanvas.dispatchEvent(keyupEvent);
          }, 100);
        } else {
          document.dispatchEvent(keydownEvent);
          setTimeout(() => {
            document.dispatchEvent(keyupEvent);
          }, 100);
        }
      }

      const sourceType = organizationId ? "organization" : "wisetwin";
      const sourceOrganizationId = organizationId || null;

      console.log("Mise à jour de la progression avec source:", {
        sourceType,
        sourceOrganizationId,
        courseId,
      });

      // [Le reste de votre code pour mettre à jour la progression reste inchangé]
      try {
        const response = await axios.post(
          WISETRAINER_CONFIG.API_ROUTES.UPDATE_PROGRESS,
          {
            userId: containerName,
            trainingId: courseId,
            progress: Math.round(
              ((userProgress.completedModules + 1) / course.modules.length) *
                100
            ),
            completedModule: currentScenario.id,
            moduleScore: score,
            sourceType, // Ajouter ces informations
            sourceOrganizationId, // pour la source
          }
        );

        if (response.data.success) {
          await fetchCourseDetails();
          toast({
            title: "Module terminé",
            description: `Vous avez complété ce module avec un score de ${score}%`,
            variant: "success",
          });
        } else {
          throw new Error(
            response.data.error || "Échec de la mise à jour de la progression"
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de la progression:",
          error
        );
        alert(
          "Erreur lors de la mise à jour de la progression. Veuillez réessayer."
        );
      }
    } catch (error) {
      console.error("Erreur lors du traitement du questionnaire:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  // Nouvelle fonction pour gérer la complétion d'un guide
  const handleGuideComplete = async (results) => {
    try {
      if (!currentGuide) return;

      // Fermer le guide
      setShowGuide(false);

      // Notifier le build Unity que le guide est complété
      if (unityBuildRef.current && unityBuildRef.current.isReady) {
        unityBuildRef.current.completeQuestionnaire(
          currentGuide.id,
          results.success
        );
      }

      // Mettre à jour la progression en base de données
      try {
        // Appeler l'API pour mettre à jour la progression
        const response = await axios.post(
          WISETRAINER_CONFIG.API_ROUTES.UPDATE_PROGRESS,
          {
            userId: containerName,
            trainingId: courseId,
            progress: Math.round(
              ((userProgress.completedModules + 1) / course.modules.length) *
                100
            ),
            completedModule: currentGuide.id,
            moduleScore: 100, // Pour un guide complété, on considère un score parfait
          }
        );

        if (response.data.success) {
          // Rafraîchir les données du cours
          await fetchCourseDetails();

          // toast({
          // 	title: "Guide terminé",
          // 	description: "Vous avez complété ce guide avec succès",
          // 	variant: "success",
          // });
        } else {
          throw new Error(
            response.data.error || "Échec de la mise à jour de la progression"
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la mise à jour de la progression:",
          error
        );
        alert(
          "Erreur lors de la mise à jour de la progression. Veuillez réessayer."
        );
      }
    } catch (error) {
      console.error("Erreur lors du traitement du guide:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handleQuestionnaireRequest = (scenario) => {
    setCurrentScenario(scenario);
    setShowQuestionnaire(true);
  };

  const handleModuleSelect = async (moduleId) => {
    setSelectedModule(moduleId);
    setActiveTab("questionnaire");

    try {
      // Récupérer les détails du scénario/module
      const response = await axios.get(
        `${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${moduleId}`
      );

      // Vérifier le type de module
      if (response.data.type === "guide") {
        setCurrentGuide(response.data);
        setShowGuide(true);
      } else if (response.data.type === "information") {
        requestInformation(moduleId);
      } else {
        setCurrentScenario(response.data);
        setShowQuestionnaire(true);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du scénario:", error);
    }
  };

  const handleStartTutorial = () => {
    console.log("Tentative de démarrage du tutoriel...");
    if (unityBuildRef.current && unityBuildRef.current.isReady) {
      console.log("Démarrage du tutoriel");
      unityBuildRef.current.startTutorial();
      return true;
    } else {
      console.warn(
        "Unity build n'est pas prêt ou la référence n'est pas disponible"
      );
      return false;
    }
  };

  // Fonction pour gérer la fermeture de la modale d'information est maintenant gérée par le hook useInformationModal

  // Gérer les cas de chargement et d'erreur
  if (
    containerLoading ||
    (isLoading && !course) ||
    !courseId ||
    !containerName ||
    isDownloading
  ) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center h-64">
          {!courseId || !containerName ? (
            // Erreur: informations essentielles manquantes
            <div className="text-center">
              <div className="text-red-500 text-xl mb-4">
                Informations manquantes
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Impossible de charger le cours. Informations nécessaires
                manquantes.
              </p>
              <Button onClick={handleBack}>Retour aux formations</Button>
            </div>
          ) : (
            // Chargement en cours avec indication du téléchargement si applicable
            <Spinner
              text={
                isDownloading
                  ? "Téléchargement des fichiers de formation..."
                  : "Chargement du cours..."
              }
              size="lg"
              centered={true}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux formations
        </Button>

        {course && (
          <CourseDetailHeader course={course} userProgress={userProgress} />
        )}
      </div>

      <Tabs
        defaultValue="details"
        className="w-full"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="mb-8">
          <TabsTrigger value="details" className="px-6">
            Détails du cours
          </TabsTrigger>
          <TabsTrigger value="training" className="px-6">
            Formation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <CourseDetailsTab
            course={course}
            userProgress={userProgress}
            onModuleSelect={handleModuleSelect}
            onSwitchTab={handleSwitchTab}
          />
        </TabsContent>

        <TabsContent value="training" disableFocusStyles={true}>
          <CourseTrainingTab
            unityBuildRef={unityBuildRef}
            courseId={courseId}
            containerName={containerName}
            onQuestionnaireRequest={handleQuestionnaireRequest}
            currentGuide={currentGuide}
            showGuide={showGuide}
            setShowGuide={setShowGuide}
            onGuideComplete={handleGuideComplete}
            filesDownloaded={filesDownloaded}
            isDownloading={isDownloading}
            showAIInsideNotice={showAIInsideNotice}
            setShowAIInsideNotice={setShowAIInsideNotice}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de questionnaire */}
      {showQuestionnaire && currentScenario && (
        <QuestionnaireModal
          scenario={currentScenario}
          onComplete={handleScenarioComplete}
          onClose={() => setShowQuestionnaire(false)}
          trainingId={courseId}
        />
      )}

      {/* Modal de guide interactif */}
      {showGuide && currentGuide && (
        <InteractiveGuideModal
          guide={currentGuide}
          onComplete={handleGuideComplete}
          onClose={() => setShowGuide(false)}
          onStartTutorial={handleStartTutorial} // Passer la fonction au lieu de la référence
        />
      )}

      {/* Notice AI Inside */}
      <AIInsideNotice
        isOpen={showAIInsideNotice}
        onClose={() => setShowAIInsideNotice(false)}
      />

      {/* Modal d'information */}
      {showInformation && currentInformation && (
        <InformationModal
          isOpen={showInformation}
          onClose={closeInformation}
          title={currentInformation.title}
          description={currentInformation.description}
          imageUrl={currentInformation.modalData?.imageUrl}
          keyToPress={currentInformation.modalData?.keyToPress || "1"}
          unityRef={unityBuildRef}
        />
      )}
    </div>
  );
}
