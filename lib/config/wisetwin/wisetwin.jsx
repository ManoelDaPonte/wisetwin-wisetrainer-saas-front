//lib/config/wisetwin/wisetwin.jsx
const WISETWIN_CONFIG = {
	CONTAINER_NAMES: {
		SOURCE: "wisetwin-build", // Container source pour les environnements 3D officiels WiseTwin
	},
	BLOB_PREFIXES: {
		WISETWIN: "wisetwin/", // Préfixe pour les builds dans le container (à ne pas confondre avec wisetrainer/)
	},
	DEFAULT_IMAGE: "/images/png/placeholder.png", // Image par défaut pour les environnements
	API_ROUTES: {
		// Routes pour les API Azure Blob Storage
		LIST_BUILDS: "/api/azure/wisetwin/builds",
		IMPORT_BUILD: "/api/azure/wisetwin/import",
		CHECK_BLOB: "/api/azure/check-blob-exists",

		// Routes pour les API de la base de données
		BUILD_DETAILS: "/api/db/wisetwin/build-details",

		// Routes pour les organisations
		ORGANIZATION_BUILDS: "/api/organization",
	},
};

export default WISETWIN_CONFIG;
