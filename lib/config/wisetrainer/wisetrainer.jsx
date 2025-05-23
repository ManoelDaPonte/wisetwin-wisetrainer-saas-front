const WISETRAINER_CONFIG = {
	CONTAINER_NAMES: {
		SOURCE: "wisetwin", // Container source pour les formations officielles WiseTwin
	},
	BLOB_PREFIXES: {
		WISETRAINER: "wisetrainer/", // Préfixe pour les formations dans le container
	},
	DEFAULT_IMAGE: "/images/png/placeholder.png", // Image par défaut pour les formations
	API_ROUTES: {
		// Routes pour les API Azure Blob Storage
		LIST_BUILDS: "/api/azure/wisetrainer/builds",
		IMPORT_BUILD: "/api/azure/wisetrainer/import",
		COPY_TRAINING_FILES: "/api/azure/wisetrainer/copy-training-files", // Nouvelle route pour copier les fichiers de formation
		UNENROLL_COURSE: "/api/db/wisetrainer/unenroll-course", // Route pour désinscrire l'utilisateur
		UNENROLL_AZURE: "/api/azure/wisetrainer/unenroll", // Route pour supprimer les fichiers dans Azure
		ENROLL_COURSE: "/api/db/wisetrainer/enroll-course", // Route pour inscrire l'utilisateur
		CHECK_BLOB: "/api/azure/check-blob-exists",

		// Routes pour les API de la base de données
		USER_TRAININGS: "/api/db/wisetrainer/user-trainings",
		COURSE_DETAILS: "/api/db/wisetrainer/course-details",
		FETCH_SCENARIO: "/api/db/wisetrainer/scenario",
		FETCH_SCENARIO_BY_COURSE: "/api/db/wisetrainer/scenario",
		SAVE_QUESTIONNAIRE: "/api/db/wisetrainer/save-questionnaire",
		UPDATE_PROGRESS: "/api/db/wisetrainer/update-progress",
		INITIALIZE_PROGRESS: "/api/db/wisetrainer/initialize-progress",
		STATS_USER: "/api/db/stats/user",
		WISETWIN_TRAININGS: "/api/db/wisetrainer/wisetwin-trainings",

		// Routes pour les organisations
		ORGANIZATION_BUILDS: "/api/organization",
		IMPORT_ORG_BUILD: "/api/organization",

		ORGANIZATION_COURSE_DETAILS:
			"/api/db/wisetrainer/course-details/organization",
	},
};

export default WISETRAINER_CONFIG;
