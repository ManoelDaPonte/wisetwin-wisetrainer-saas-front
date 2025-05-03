// lib/hooks/organizations/currentOrganization/useCurrentOrganizationInvitations.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useCurrentOrganizationInvitations(organizationId) {
	const [invitations, setInvitations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	const fetchInvitations = useCallback(async () => {
		if (!organizationId) return;

		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`/api/organizations/${organizationId}/invitations`
			);

			if (response.data.invitations) {
				setInvitations(response.data.invitations);
			}
		} catch (err) {
			console.error("Erreur lors du chargement des invitations:", err);
			setError(err);
			toast({
				title: "Erreur",
				description: "Impossible de charger les invitations",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [organizationId, toast]);

	const addMember = async (memberData) => {
		try {
			const response = await axios.post(
				`/api/organizations/${organizationId}/invite`,
				{
					email: memberData.email,
					role: memberData.role,
				}
			);

			if (response.data.success) {
				toast({
					title: "Invitation envoyée",
					description: `Invitation envoyée à ${memberData.email}`,
					variant: "success",
				});
				await fetchInvitations();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors de l'envoi de l'invitation:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible d'envoyer l'invitation",
				variant: "destructive",
			});
			return false;
		}
	};

	const cancelInvitation = async (invitationId) => {
		try {
			const response = await axios.delete(
				`/api/organizations/${organizationId}/invitations/${invitationId}`
			);

			if (response.data.success) {
				toast({
					title: "Invitation annulée",
					description: "L'invitation a été annulée avec succès",
					variant: "success",
				});
				await fetchInvitations();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors de l'annulation de l'invitation:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible d'annuler l'invitation",
				variant: "destructive",
			});
			return false;
		}
	};

	const resendInvitation = async (invitationId) => {
		try {
			const response = await axios.post(
				`/api/organizations/${organizationId}/invitations/${invitationId}/resend`
			);

			if (response.data.success) {
				toast({
					title: "Invitation renvoyée",
					description: "L'invitation a été renvoyée avec succès",
					variant: "success",
				});
				await fetchInvitations();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors du renvoi de l'invitation:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible de renvoyer l'invitation",
				variant: "destructive",
			});
			return false;
		}
	};

	// Charger les invitations au montage du composant
	useEffect(() => {
		if (organizationId) {
			fetchInvitations();
		}
	}, [organizationId, fetchInvitations]);

	return {
		invitations,
		isLoading,
		error,
		fetchInvitations,
		addMember,
		cancelInvitation,
		resendInvitation,
	};
}
