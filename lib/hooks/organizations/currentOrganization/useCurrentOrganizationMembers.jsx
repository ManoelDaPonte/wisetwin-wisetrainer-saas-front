// lib/hooks/useOrganizationMembers.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useCurrentOrganizationMembers(organizationId) {
	const [members, setMembers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	const fetchMembers = useCallback(async () => {
		if (!organizationId) return;

		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`/api/organization/${organizationId}/members`
			);

			if (response.data.members) {
				setMembers(response.data.members);
			}
		} catch (err) {
			console.error("Erreur lors du chargement des membres:", err);
			setError(err);
			toast({
				title: "Erreur",
				description:
					"Impossible de charger les membres avec leurs tags",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [organizationId, toast]);

	const changeRole = async (memberId, newRole) => {
		try {
			const response = await axios.patch(
				`/api/organization/${organizationId}/members/${memberId}`,
				{ role: newRole }
			);

			if (response.data.success) {
				toast({
					title: "Rôle modifié",
					description: "Le rôle du membre a été modifié avec succès",
					variant: "success",
				});
				await fetchMembers();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors de la modification du rôle:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible de modifier le rôle",
				variant: "destructive",
			});
			return false;
		}
	};

	const removeMember = async (memberId) => {
		try {
			const response = await axios.delete(
				`/api/organization/${organizationId}/members/${memberId}`
			);

			if (response.data.success) {
				toast({
					title: "Membre retiré",
					description: "Le membre a été retiré de l'organisation",
					variant: "success",
				});
				await fetchMembers();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors du retrait du membre:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible de retirer le membre",
				variant: "destructive",
			});
			return false;
		}
	};

	const addMember = async (memberData) => {
		try {
			const response = await axios.post(
				`/api/organization/${organizationId}/invite`,
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

	// Charger les membres au montage du composant
	useEffect(() => {
		if (organizationId) {
			fetchMembers();
		}
	}, [organizationId, fetchMembers]);

	return {
		members,
		isLoading,
		error,
		fetchMembers,
		changeRole,
		removeMember,
		addMember,
	};
}
