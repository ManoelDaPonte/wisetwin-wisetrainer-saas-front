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
		CHECK_BLOB: "/api/azure/check-blob-exists",
		FETCH_SCENARIO: "/api/db/wisetrainer/scenario",
		USER_TRAININGS: "/api/db/wisetrainer/user-trainings",
		UNENROLL: "/api/azure/wisetrainer/unenroll",
	},
	DEFAULT_IMAGE: "/images/png/placeholder.png", // Image placeholder par défaut
};

export default WISETRAINER_CONFIG;
