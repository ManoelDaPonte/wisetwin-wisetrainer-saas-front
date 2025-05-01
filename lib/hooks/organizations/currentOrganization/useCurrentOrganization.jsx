const handleSaveSettings = async (settingsData) => {
	try {
		const response = await axios.patch(
			`/api/organization/${organization.id}`,
			settingsData
		);

		if (response.data.success) {
			toast({
				title: "Paramètres enregistrés",
				description:
					"Les paramètres de l'organisation ont été mis à jour",
				variant: "success",
			});
			if (onDataChange) onDataChange();
		}
	} catch (error) {
		console.error("Erreur lors de la mise à jour des paramètres:", error);
		toast({
			title: "Erreur",
			description:
				error.response?.data?.error ||
				"Impossible de mettre à jour les paramètres",
			variant: "destructive",
		});
	}
};

const handleDeleteOrganization = async () => {
	try {
		const response = await axios.delete(
			`/api/organization/${organization.id}`
		);

		if (response.data.success) {
			toast({
				title: "Organisation supprimée",
				description: "L'organisation a été supprimée avec succès",
				variant: "success",
			});
			window.location.href = "/organization";
		}
	} catch (error) {
		console.error(
			"Erreur lors de la suppression de l'organisation:",
			error
		);
		toast({
			title: "Erreur",
			description:
				error.response?.data?.error ||
				"Impossible de supprimer l'organisation",
			variant: "destructive",
		});
	}
};
