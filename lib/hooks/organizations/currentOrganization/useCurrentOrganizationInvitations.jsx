const fetchInvitations = async () => {
	if (!organization?.id) return;

	try {
		setIsLoadingInvitations(true);
		const response = await axios.get(
			`/api/organization/${organization.id}/invitations`
		);
		if (response.data.invitations) {
			setInvitations(response.data.invitations);
		}
	} catch (error) {
		console.error("Erreur lors du chargement des invitations:", error);
		toast({
			title: "Erreur",
			description: "Impossible de charger les invitations",
			variant: "destructive",
		});
	} finally {
		setIsLoadingInvitations(false);
	}
};

const handleCancelInvitation = async (invitationId) => {
	try {
		const response = await axios.delete(
			`/api/organization/${organization.id}/invitations/${invitationId}`
		);

		if (response.data.success) {
			toast({
				title: "Invitation annulée",
				description: "L'invitation a été annulée avec succès",
				variant: "success",
			});
			await fetchInvitations();
		}
	} catch (error) {
		console.error("Erreur lors de l'annulation de l'invitation:", error);
		toast({
			title: "Erreur",
			description:
				error.response?.data?.error ||
				"Impossible d'annuler l'invitation",
			variant: "destructive",
		});
	}
};

const handleResendInvitation = async (invitationId) => {
	try {
		const response = await axios.post(
			`/api/organization/${organization.id}/invitations/${invitationId}/resend`
		);

		if (response.data.success) {
			toast({
				title: "Invitation renvoyée",
				description: "L'invitation a été renvoyée avec succès",
				variant: "success",
			});
			await fetchInvitations();
		}
	} catch (error) {
		console.error("Erreur lors du renvoi de l'invitation:", error);
		toast({
			title: "Erreur",
			description:
				error.response?.data?.error ||
				"Impossible de renvoyer l'invitation",
			variant: "destructive",
		});
	}
};
