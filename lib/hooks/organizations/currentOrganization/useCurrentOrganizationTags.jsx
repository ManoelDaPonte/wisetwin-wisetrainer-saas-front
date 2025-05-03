// lib/hooks/organizations/currentOrganization/useCurrentOrganizationTags.jsx
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useCurrentOrganizationTags(organizationId) {
	const [tags, setTags] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const { toast } = useToast();

	const fetchTags = useCallback(async () => {
		if (!organizationId) return;

		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`/api/organizations/${organizationId}/tags`
			);

			if (response.data.tags) {
				setTags(response.data.tags);
			}
		} catch (err) {
			console.error("Erreur lors du chargement des tags:", err);
			setError(err);
			toast({
				title: "Erreur",
				description: "Impossible de charger les tags",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [organizationId, toast]);

	const addTag = async (tagData) => {
		try {
			const response = await axios.post(
				`/api/organizations/${organizationId}/tags`,
				tagData
			);

			if (response.data.success) {
				toast({
					title: "Tag ajouté",
					description: "Le tag a été ajouté avec succès",
					variant: "success",
				});
				await fetchTags();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors de l'ajout du tag:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error || "Impossible d'ajouter le tag",
				variant: "destructive",
			});
			return false;
		}
	};

	const editTag = async (tagData) => {
		try {
			const response = await axios.put(
				`/api/organizations/${organizationId}/tags/${tagData.id}`,
				tagData
			);

			if (response.data.success) {
				toast({
					title: "Tag modifié",
					description: "Le tag a été modifié avec succès",
					variant: "success",
				});
				await fetchTags();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors de la modification du tag:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible de modifier le tag",
				variant: "destructive",
			});
			return false;
		}
	};

	const deleteTag = async (tagId) => {
		try {
			const response = await axios.delete(
				`/api/organizations/${organizationId}/tags/${tagId}`
			);

			if (response.data.success) {
				toast({
					title: "Tag supprimé",
					description: "Le tag a été supprimé avec succès",
					variant: "success",
				});
				await fetchTags();
				return true;
			}
			return false;
		} catch (err) {
			console.error("Erreur lors de la suppression du tag:", err);
			toast({
				title: "Erreur",
				description:
					err.response?.data?.error ||
					"Impossible de supprimer le tag",
				variant: "destructive",
			});
			return false;
		}
	};

	// Charger les tags au montage du composant
	useEffect(() => {
		if (organizationId) {
			fetchTags();
		}
	}, [organizationId, fetchTags]);

	return {
		tags,
		isLoading,
		error,
		fetchTags,
		addTag,
		editTag,
		deleteTag,
	};
}
