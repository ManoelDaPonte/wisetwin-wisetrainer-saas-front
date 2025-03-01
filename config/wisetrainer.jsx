{
    "courses": [
      {
        "id": "safety-fundamentals",
        "name": "Fondamentaux de la sécurité industrielle",
        "description": "Formation complète sur les principes fondamentaux de la sécurité en milieu industriel",
        "imageUrl": "/images/wisetrainer/safety-course.png",
        "category": "Sécurité",
        "difficulty": "Intermédiaire",
        "duration": "30 min",
        "modules": [
          {
            "id": "pressure-risk",
            "order": 1,
            "title": "Risque de projection sous pression",
            "description": "Apprenez à gérer les interventions de maintenance dans un environnement à risques spécifiques liés à la pression"
          },
          {
            "id": "smoking-worker",
            "order": 2,
            "title": "Risque d'incendie",
            "description": "Comprenez les dangers liés au tabagisme en milieu industriel et les mesures de prévention essentielles"
          },
          {
            "id": "chemical-hazard",
            "order": 3,
            "title": "Risques chimiques",
            "description": "Apprenez à identifier les dangers liés aux produits chimiques et à appliquer les protocoles de sécurité adaptés"
          }
        ]
      },
      {
        "id": "ergonomics-training",
        "name": "Ergonomie et postures de travail",
        "description": "Formation sur les bonnes pratiques ergonomiques pour prévenir les troubles musculosquelettiques",
        "imageUrl": "/images/wisetrainer/ergonomics-course.png",
        "category": "Ergonomie",
        "difficulty": "Débutant",
        "duration": "20 min",
        "modules": [
          {
            "id": "kneeling-worker",
            "order": 1,
            "title": "Risque de troubles musculosquelettiques",
            "description": "Identifiez les postures à risque et apprenez à préserver votre santé lors des travaux nécessitant des positions contraignantes"
          },
          {
            "id": "fall-height",
            "order": 2,
            "title": "Risque de chute de hauteur",
            "description": "Maîtrisez les techniques de sécurité lors des interventions en hauteur pour prévenir les accidents graves"
          }
        ]
      }
    ]
  }

  // lib/config/wisetrainer.js
export const WISETRAINER_CONFIG = {
	// Configuration Azure
	AZURE_STORAGE_URL: process.env.NEXT_PUBLIC_AZURE_STORAGE_URL,
	MAIN_CONTAINER: "wisetrainer-courses",

	// Types de questionnaires
	QUESTIONNAIRE_TYPES: {
		SINGLE_CHOICE: "SINGLE",
		MULTIPLE_CHOICE: "MULTIPLE",
	},

	// Seuils de réussite
	SUCCESS_THRESHOLD: 70, // Pourcentage minimum pour considérer un questionnaire comme réussi

	// Paramètres d'affichage Unity
	UNITY_CONTAINER_HEIGHT: "600px",
	UNITY_LOADING_TIMEOUT: 60000, // 60 secondes avant d'afficher une erreur de chargement

	// Routes API
	API_ROUTES: {
		FETCH_BUILDS: "/api/azure/wisetrainer/builds",
		FETCH_USER_TRAININGS: "/api/db/wisetrainer/user-trainings",
		SAVE_QUESTIONNAIRE: "/api/db/wisetrainer/save-questionnaire",
		UPDATE_PROGRESS: "/api/db/wisetrainer/update-progress",
		FETCH_SCENARIO: "/api/db/wisetrainer/scenario",
		IMPORT_TRAINING: "/api/azure/wisetrainer/import",
		UNENROLL: "/api/db/wisetrainer/unenroll",
	},
};

// Fonction pour générer les URLs des fichiers Unity WebGL
export function getUnityFilesUrls(userId, courseId) {
	return {
		loaderUrl: `/api/azure/fetch-blob-data/${userId}/${courseId}.loader.js?subfolder=wisetrainer`,
		dataUrl: `/api/azure/fetch-blob-data/${userId}/${courseId}.data.gz?subfolder=wisetrainer`,
		frameworkUrl: `/api/azure/fetch-blob-data/${userId}/${courseId}.framework.js.gz?subfolder=wisetrainer`,
		codeUrl: `/api/azure/fetch-blob-data/${userId}/${courseId}.wasm.gz?subfolder=wisetrainer`,
	};
}

export default WISETRAINER_CONFIG;
