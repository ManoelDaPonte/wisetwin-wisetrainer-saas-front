//components/wisetrainer/courses/helper.js
export const formatCourseName = (id) => {
	return id
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};
export const processBuildNames = (blobs, WISETRAINER_CONFIG) => {
	// Extraire les noms uniques des builds (sans extension)
	const buildNames = new Set();
	blobs.forEach((blob) => {
		// Par exemple: wisetrainer/safety-101.data.gz -> safety-101
		const match = blob.match(`
    /(?:wisetrainer/)?([^/]+?)(?:.data.gz|.framework.js.gz|.loader.js|.wasm.gz)$/
    `);
		if (match && match[1]) {
			buildNames.add(match[1]);
		}
	});
	// Créer des objets cours à partir des noms
	return Array.from(buildNames).map((name) => {
		try {
			// Essayer de charger les détails du cours depuis les fichiers de configuration
			let courseDetails;
			try {
				courseDetails = require(`@/lib/config/wisetrainer/courses/${name}.json`);
			} catch (e) {
				// Si le fichier de configuration n'existe pas, utiliser des valeurs par défaut
				courseDetails = {
					id: name,
					name: formatCourseName(name),
					description:
						"Formation interactive sur ${formatCourseName(name).toLowerCase()}",
					imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
					difficulty: "Intermédiaire",
					duration: "30 min",
					category: "Sécurité industrielle",
					modules: [
						{ id: "module1", title: "Module 1" },
						{ id: "module2", title: "Module 2" },
						{ id: "module3", title: "Module 3" },
					],
				};
			}
			return courseDetails;
		} catch (error) {
			// En cas d'erreur, retourner un objet avec des valeurs par défaut
			return {
				id: name,
				name: formatCourseName(name),
				description: `Formation interactive sur ${formatCourseName(
					name
				).toLowerCase()}`,
				imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
				difficulty: "Intermédiaire",
				duration: "30 min",
				category: "Sécurité industrielle",
				modules: [
					{ id: "module1", title: "Module 1" },
					{ id: "module2", title: "Module 2" },
					{ id: "module3", title: "Module 3" },
				],
			};
		}
	});
};
