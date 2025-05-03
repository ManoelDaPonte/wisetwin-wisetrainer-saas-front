// lib/hooks/organizations/currentOrganization/useCurrentOrganizationParameters.jsx
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";
import { useRouter } from "next/navigation";

export function useCurrentOrganizationParameters(organizationId, onDataChange) {
	const { toast } = useToast();
	const router = useRouter();

	const handleSaveSettings = async (settingsData) => {
		try {
			const response = await axios.patch(
				`/api/organizations/${organizationId}`,
				settingsData
			);

			if (response.data.success) {
				toast({
					title: "Paramètres enregistrés",
					description:
						"Les paramètres de l'organisation ont été mis à jour",
					variant: "success",
				});

				// Notifier le composant parent pour rafraîchir les données
				if (onDataChange) onDataChange();
			}
		} catch (error) {
			console.error(
				"Erreur lors de la mise à jour des paramètres:",
				error
			);
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
				`/api/organizations/${organizationId}`
			);

			if (response.data.success) {
				toast({
					title: "Organisation supprimée",
					description: "L'organisation a été supprimée avec succès",
					variant: "success",
				});
				router.push("/organization");
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

	return {
		handleSaveSettings,
		handleDeleteOrganization,
	};
}
