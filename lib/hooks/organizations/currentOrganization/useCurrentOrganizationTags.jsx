const fetchTags = async () => {
	if (!organization?.id) return;

	try {
		setIsLoadingTags(true);
		const response = await axios.get(
			`/api/organization/${organization.id}/tags`
		);
		if (response.data.tags) {
			setTags(response.data.tags);
		}
	} catch (error) {
		console.error("Erreur lors du chargement des tags:", error);
		toast({
			title: "Erreur",
			description: "Impossible de charger les tags",
			variant: "destructive",
		});
	} finally {
		setIsLoadingTags(false);
	}
};

const handleAddTag = async (tagData) => {
	try {
		const response = await axios.post(
			`/api/organization/${organization.id}/tags`,
			tagData
		);

		if (response.data.success) {
			toast({
				title: "Tag ajouté",
				description: "Le tag a été ajouté avec succès",
				variant: "success",
			});
			fetchTags();
		}
	} catch (error) {
		console.error("Erreur lors de l'ajout du tag:", error);
		toast({
			title: "Erreur",
			description:
				error.response?.data?.error || "Impossible d'ajouter le tag",
			variant: "destructive",
		});
	}
};

const handleEditTag = async (tagData) => {
	try {
		const response = await axios.put(
			`/api/organization/${organization.id}/tags/${tagData.id}`,
			tagData
		);

		if (response.data.success) {
			toast({
				title: "Tag modifié",
				description: "Le tag a été modifié avec succès",
				variant: "success",
			});
			fetchTags();
		}
	} catch (error) {
		console.error("Erreur lors de la modification du tag:", error);
		toast({
			title: "Erreur",
			description:
				error.response?.data?.error || "Impossible de modifier le tag",
			variant: "destructive",
		});
	}
};

const handleDeleteTag = async (tagId) => {
	try {
		const response = await axios.delete(
			`/api/organization/${organization.id}/tags/${tagId}`
		);

		if (response.data.success) {
			toast({
				title: "Tag supprimé",
				description: "Le tag a été supprimé avec succès",
				variant: "success",
			});
			fetchTags();
		}
	} catch (error) {
		console.error("Erreur lors de la suppression du tag:", error);
		toast({
			title: "Erreur",
			description:
				error.response?.data?.error || "Impossible de supprimer le tag",
			variant: "destructive",
		});
	}
};