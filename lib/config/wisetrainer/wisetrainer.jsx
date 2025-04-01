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
		FETCH_SCENARIO: "/api/db/wisetrainer/scenario", // Ancienne route
		FETCH_SCENARIO_BY_COURSE: "/api/db/wisetrainer/scenario",
		SAVE_QUESTIONNAIRE: "/api/db/wisetrainer/save-questionnaire",
		UPDATE_PROGRESS: "/api/db/wisetrainer/update-progress",
		USER_TRAININGS: "/api/db/wisetrainer/user-trainings",
		COURSE_DETAILS: "/api/db/wisetrainer/course-details",
		STATS_USER: "/api/db/stats/user",
		ORGANIZATION_BUILDS: "/api/organization",
		IMPORT_ORG_BUILD: "/api/organization",
	},
	DEFAULT_IMAGE: "/images/png/placeholder.png",
};

export default WISETRAINER_CONFIG;
