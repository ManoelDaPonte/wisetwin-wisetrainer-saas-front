// components/wisetrainer/formation/content/Build3DViewer.jsx
// Modifier la fonction handleUnityMessage
const handleUnityMessage = async (message) => {
	try {
		const data = JSON.parse(message);

		if (data.type === "moduleCompleted" && data.moduleId) {
			// Appeler l'API pour marquer le module comme terminé
			const moduleToComplete = build3D.modules.find(
				(m) => m.moduleId === data.moduleId
			);

			if (moduleToComplete) {
				const response = await axios.post(
					`/api/formations/${formationId}/build3d/module/complete`,
					{
						moduleId: moduleToComplete.id,
						score: data.score || null,
					}
				);

				if (response.data.success) {
					toast({
						title: "Module terminé",
						description: "Votre progression a été enregistrée",
						variant: "success",
					});

					// Mettre à jour localement l'état du module au lieu de recharger toutes les données
					if (build3D && build3D.modules) {
						// Mettre à jour le statut du module complété
						const updatedModules = build3D.modules.map((module) => {
							if (module.id === moduleToComplete.id) {
								return { ...module, isCompleted: true };
							}
							return module;
						});

						// Éviter d'appeler directement onModuleComplete qui déclencherait un rechargement complet
						// Mettre à jour uniquement les changements locaux

						// Si nécessaire, vous pouvez appeler onModuleComplete avec un délai pour éviter
						// trop d'appels rapprochés
						if (onModuleComplete) {
							// Utiliser un setTimeout pour différer l'appel et éviter les cascades
							setTimeout(() => {
								onModuleComplete(moduleToComplete.id);
							}, 2000); // Délai de 2 secondes
						}
					}
				}
			}
		}
	} catch (error) {
		console.error("Erreur lors du traitement du message Unity:", error);
	}
};
