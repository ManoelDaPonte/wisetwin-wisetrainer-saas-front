const WISETRAINER_CONFIG = {
	CONTAINER_NAMES: {
		SOURCE: "wisetrainer-training-build",
	},
	BLOB_PREFIXES: {
		WISETRAINER: "wisetrainer/",
	},
	API_ROUTES: {
		LIST_BUILDS: "/api/azure/wisetrainer/builds",
		IMPORT_BUILD: "/api/azure/wisetrainer/import",
		UNENROLL: "/api/azure/wisetrainer/unenroll",
		CHECK_BLOB: "/api/azure/check-blob-exists",
		FETCH_SCENARIO: "/api/db/wisetrainer/scenario",
		SAVE_QUESTIONNAIRE: "/api/db/wisetrainer/save-questionnaire",
		UPDATE_PROGRESS: "/api/db/wisetrainer/update-progress",
		USER_TRAININGS: "/api/db/wisetrainer/user-trainings",
	},
	DEFAULT_IMAGE: "/images/png/placeholder.png",
};

export default WISETRAINER_CONFIG;
