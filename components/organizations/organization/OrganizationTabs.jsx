// components/organizations/organization/OrganizationTabs.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, Settings, BarChart, Tag } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

// Importation des composants d'onglets
import MembersTab from "./members/MembersTab";
import InvitationsTab from "./invitations/InvitationsTab";
import SettingsTab from "./settings/SettingsTab";
import DashboardTab from "./dashboard/DashboardTab";
import TagsTab from "./tags/TagsTab"; // Nouvel import

export default function OrganizationTabs({ organization, onDataChange }) {
	const [activeTab, setActiveTab] = useState("members");
	const [invitations, setInvitations] = useState([]);
	const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
	const [tags, setTags] = useState([]);
	const [isLoadingTags, setIsLoadingTags] = useState(false);
	const { toast } = useToast();

	// Charger les invitations lorsque l'onglet change
	useEffect(() => {
		if (activeTab === "invitations" && organization) {
			fetchInvitations();
		} else if (activeTab === "tags" && organization) {
			fetchTags();
		}
	}, [activeTab, organization]);

	// Charger les tags dès le montage du composant
	useEffect(() => {
		if (organization) {
			fetchInvitations();
			fetchTags();
		}
	}, [organization]);

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

	// Charger les tags de l'organisation
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

	// Gérer l'ajout d'un tag
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
					error.response?.data?.error ||
					"Impossible d'ajouter le tag",
				variant: "destructive",
			});
		}
	};

	// Gérer la modification d'un tag
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
					error.response?.data?.error ||
					"Impossible de modifier le tag",
				variant: "destructive",
			});
		}
	};

	// Gérer la suppression d'un tag
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
					error.response?.data?.error ||
					"Impossible de supprimer le tag",
				variant: "destructive",
			});
		}
	};

	// Gestionnaire pour le changement de rôle d'un membre
	const handleChangeRole = async (memberId, newRole) => {
		try {
			const response = await axios.patch(
				`/api/organization/${organization.id}/members/${memberId}`,
				{
					role: newRole,
				}
			);

			if (response.data.success) {
				toast({
					title: "Rôle modifié",
					description: "Le rôle du membre a été modifié avec succès",
					variant: "success",
				});
				if (onDataChange) onDataChange();
			}
		} catch (error) {
			console.error("Erreur lors de la modification du rôle:", error);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible de modifier le rôle",
				variant: "destructive",
			});
		}
	};

	// Gestionnaire pour la suppression d'un membre
	const handleRemoveMember = async (memberId) => {
		try {
			const response = await axios.delete(
				`/api/organization/${organization.id}/members/${memberId}`
			);

			if (response.data.success) {
				toast({
					title: "Membre retiré",
					description: "Le membre a été retiré de l'organisation",
					variant: "success",
				});
				if (onDataChange) onDataChange();
			}
		} catch (error) {
			console.error("Erreur lors du retrait du membre:", error);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible de retirer le membre",
				variant: "destructive",
			});
		}
	};

	// Gestionnaire pour l'ajout d'un membre
	const handleAddMember = async (memberData) => {
		try {
			const response = await axios.post(
				`/api/organization/${organization.id}/invite`,
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
			}
		} catch (error) {
			console.error("Erreur lors de l'envoi de l'invitation:", error);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible d'envoyer l'invitation",
				variant: "destructive",
			});
		}
	};

	// Gestionnaire pour l'annulation d'une invitation
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
			console.error(
				"Erreur lors de l'annulation de l'invitation:",
				error
			);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible d'annuler l'invitation",
				variant: "destructive",
			});
		}
	};

	// Gestionnaire pour le renvoi d'une invitation
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

	// Gestionnaire pour la sauvegarde des paramètres
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

	// Gestionnaire pour la suppression de l'organisation
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

	return (
		<Tabs
			defaultValue="dashboard"
			className="w-full"
			onValueChange={setActiveTab}
			value={activeTab}
		>
			<TabsList className="mb-8">
				<TabsTrigger value="members" className="px-6">
					<Users className="w-4 h-4 mr-2" />
					Membres
				</TabsTrigger>

				{(organization.userRole === "OWNER" ||
					organization.userRole === "ADMIN") && (
					<>
						<TabsTrigger value="invitations" className="px-6">
							<Mail className="w-4 h-4 mr-2" />
							Invitations
						</TabsTrigger>

						<TabsTrigger value="tags" className="px-6">
							<Tag className="w-4 h-4 mr-2" />
							Tags
						</TabsTrigger>

						<TabsTrigger value="dashboard" className="px-6">
							<BarChart className="w-4 h-4 mr-2" />
							Dashboard
						</TabsTrigger>

						<TabsTrigger value="settings" className="px-6">
							<Settings className="w-4 h-4 mr-2" />
							Paramètres
						</TabsTrigger>
					</>
				)}
			</TabsList>

			{/* Contenu de l'onglet Tags */}
			<TabsContent value="tags">
				<TagsTab
					organization={organization}
					tags={tags}
					isLoading={isLoadingTags}
					onAddTag={handleAddTag}
					onEditTag={handleEditTag}
					onDeleteTag={handleDeleteTag}
				/>
			</TabsContent>

			{/* Autres onglets existants */}
			<TabsContent value="dashboard">
				<DashboardTab organization={organization} />
			</TabsContent>

			<TabsContent value="members">
				<MembersTab
					organization={organization}
					onAddMember={handleAddMember}
					onChangeRole={handleChangeRole}
					onRemoveMember={handleRemoveMember}
				/>
			</TabsContent>

			<TabsContent value="invitations">
				<InvitationsTab
					organization={organization}
					invitations={invitations}
					isLoading={isLoadingInvitations}
					onAddMember={handleAddMember}
					onCancel={handleCancelInvitation}
					onResend={handleResendInvitation}
				/>
			</TabsContent>

			<TabsContent value="settings">
				<SettingsTab
					organization={organization}
					onSave={handleSaveSettings}
					onDelete={handleDeleteOrganization}
				/>
			</TabsContent>
		</Tabs>
	);
}
