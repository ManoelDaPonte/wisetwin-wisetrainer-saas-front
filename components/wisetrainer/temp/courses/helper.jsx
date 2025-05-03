//components/wisetrainer/courses/helper.js
export const formatCourseName = (id) => {
	return id
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};
export const processBuildNames = (
	blobs,
	WISETRAINER_CONFIG,
	sourceType = null,
	organizationInfo = null
) => {
	// Extraire les noms uniques des builds (sans extension)
	const buildNames = new Set();
	blobs.forEach((blob) => {
		// Par exemple: wisetrainer/safety-101.data.gz -> safety-101
		const match = blob.match(
			/(?:wisetrainer\/)?([^\/]+?)(?:\.data\.gz|\.framework\.js\.gz|\.loader\.js|\.wasm\.gz)$/
		);
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

				// Si les détails du cours contiennent des infos d'organisation et que nous avons fourni
				// des détails d'organisation, les mettre à jour
				if (
					sourceType === "organization" &&
					organizationInfo &&
					courseDetails.organization
				) {
					courseDetails.organization = {
						...courseDetails.organization,
						id:
							organizationInfo.id ||
							courseDetails.organization.id,
						name:
							organizationInfo.name ||
							courseDetails.organization.name,
					};
				}

				// Si un type de source est spécifié (mais pas dans le fichier de config),
				// ajouter les informations de source
				if (sourceType && !courseDetails.source) {
					if (sourceType === "organization" && organizationInfo) {
						courseDetails.source = {
							type: "organization",
							organizationId: organizationInfo.id,
							name: organizationInfo.name,
						};
					} else if (sourceType === "wisetwin") {
						courseDetails.source = {
							type: "wisetwin",
							name: "WiseTwin",
						};
					}
				}
			} catch (e) {
				// Si le fichier de configuration n'existe pas, utiliser des valeurs par défaut
				courseDetails = {
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

				// Ajouter les informations de source si spécifiées
				if (sourceType === "organization" && organizationInfo) {
					courseDetails.source = {
						type: "organization",
						organizationId: organizationInfo.id,
						name: organizationInfo.name,
					};
				} else if (sourceType === "wisetwin") {
					courseDetails.source = {
						type: "wisetwin",
						name: "WiseTwin",
					};
				}
			}
			return courseDetails;
		} catch (error) {
			// En cas d'erreur, retourner un objet avec des valeurs par défaut
			const defaultCourse = {
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

			// Ajouter les informations de source si spécifiées
			if (sourceType === "organization" && organizationInfo) {
				defaultCourse.source = {
					type: "organization",
					organizationId: organizationInfo.id,
					name: organizationInfo.name,
				};
			} else if (sourceType === "wisetwin") {
				defaultCourse.source = {
					type: "wisetwin",
					name: "WiseTwin",
				};
			}

			return defaultCourse;
		}
	});
};
