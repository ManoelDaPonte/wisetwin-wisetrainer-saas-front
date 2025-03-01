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
