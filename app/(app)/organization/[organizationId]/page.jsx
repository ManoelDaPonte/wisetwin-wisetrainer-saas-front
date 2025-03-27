// app/(app)/organization/[organizationId]/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	ArrowLeft,
	UserPlus,
	Settings,
	Users,
	PlusCircle,
	Mail,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/lib/hooks/useToast";
import MembersTable from "@/components/organization/MembersTable";
import AddMemberModal from "@/components/organization/AddMemberModal";
import OrganizationSettingsForm from "@/components/organization/OrganizationSettingsForm";
import InvitationsTable from "@/components/organization/InvitationsTable";

export default function OrganizationManagementPage() {
	const router = useRouter();
	const params = useParams();
	const { toast } = useToast();
	const [organization, setOrganization] = useState(null);
	const [invitations, setInvitations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("members");
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const organizationId = params?.organizationId;

	useEffect(() => {
		if (organizationId) {
			fetchOrganizationDetails();
		}
	}, [organizationId]);

	const fetchOrganizationDetails = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get(
				`/api/organization/${organizationId}`
			);

			if (response.data.organization) {
				setOrganization(response.data.organization);
				await fetchInvitations(); // Charger les invitations
			} else {
				toast({
					title: "Erreur",
					description:
						"Impossible de charger les détails de l'organisation",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error(
				"Erreur lors du chargement de l'organisation:",
				error
			);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible d'accéder à cette organisation",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const fetchInvitations = async () => {
		try {
			const response = await axios.get(
				`/api/organization/${organizationId}/invitations`
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
		}
	};

	const handleBack = () => {
		router.push("/organization");
	};

	const handleAddMember = async (memberData) => {
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

				setShowAddMemberModal(false);
				await fetchInvitations(); // Rafraîchir les invitations
			} else {
				throw new Error(
					response.data.error || "Échec de l'envoi de l'invitation"
				);
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

	const handleChangeRole = async (memberId, newRole) => {
		try {
			const response = await axios.patch(
				`/api/organization/${organizationId}/members/${memberId}`,
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

				await fetchOrganizationDetails(); // Rafraîchir les données
			} else {
				throw new Error(
					response.data.error || "Échec de la modification du rôle"
				);
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

	const handleRemoveMember = async (memberId) => {
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

				await fetchOrganizationDetails(); // Rafraîchir les données
			} else {
				throw new Error(
					response.data.error || "Échec du retrait du membre"
				);
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

	const handleCancelInvitation = async (invitationId) => {
		try {
			const response = await axios.delete(
				`/api/organization/${organizationId}/invitations/${invitationId}`
			);

			if (response.data.success) {
				toast({
					title: "Invitation annulée",
					description: "L'invitation a été annulée avec succès",
					variant: "success",
				});

				await fetchInvitations(); // Rafraîchir les invitations
			} else {
				throw new Error(
					response.data.error ||
						"Échec de l'annulation de l'invitation"
				);
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

	const handleResendInvitation = async (invitationId) => {
		try {
			const response = await axios.post(
				`/api/organization/${organizationId}/invitations/${invitationId}/resend`
			);

			if (response.data.success) {
				toast({
					title: "Invitation renvoyée",
					description: "L'invitation a été renvoyée avec succès",
					variant: "success",
				});

				await fetchInvitations(); // Rafraîchir les invitations
			} else {
				throw new Error(
					response.data.error || "Échec du renvoi de l'invitation"
				);
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

	const handleSaveSettings = async (settingsData) => {
		try {
			const response = await axios.patch(
				`/api/organization/${organizationId}`,
				settingsData
			);

			if (response.data.success) {
				toast({
					title: "Paramètres enregistrés",
					description:
						"Les paramètres de l'organisation ont été mis à jour",
					variant: "success",
				});

				await fetchOrganizationDetails(); // Rafraîchir les données
			} else {
				throw new Error(
					response.data.error ||
						"Échec de la mise à jour des paramètres"
				);
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
				`/api/organization/${organizationId}`
			);

			if (response.data.success) {
				toast({
					title: "Organisation supprimée",
					description: "L'organisation a été supprimée avec succès",
					variant: "success",
				});

				router.push("/organization");
			} else {
				throw new Error(
					response.data.error ||
						"Échec de la suppression de l'organisation"
				);
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

	// Afficher un état de chargement
	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="flex justify-between items-center mb-6">
					<div className="animate-pulse">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
						<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
					</div>
				</div>
				<div className="animate-pulse">
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
					<div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
				</div>
			</div>
		);
	}

	// Si nous n'avons pas d'organisation (après le chargement), afficher un message d'erreur
	if (!organization) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center py-12">
					<div className="text-red-500 text-xl mb-4">
						Organisation non trouvée
					</div>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						L'organisation demandée n'existe pas ou vous n'avez pas
						les droits pour y accéder.
					</p>
					<Button onClick={handleBack}>
						Retour aux organisations
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			{/* En-tête avec informations sur l'organisation */}
			<div className="mb-6">
				<Button variant="outline" onClick={handleBack} className="mb-4">
					<ArrowLeft className="w-4 h-4 mr-2" />
					Retour aux organisations
				</Button>

				<div className="flex items-center gap-6 mb-6">
					<div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
						{organization.logoUrl ? (
							<Image
								src={organization.logoUrl}
								alt={organization.name}
								fill
								className="object-cover"
								onError={(e) => {
									e.target.src =
										"/images/png/placeholder.png";
								}}
							/>
						) : (
							<div className="flex items-center justify-center h-full">
								<span className="text-2xl font-bold text-wisetwin-blue">
									{organization.name.charAt(0).toUpperCase()}
								</span>
							</div>
						)}
					</div>
					<div>
						<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white">
							{organization.name}
						</h1>
						<p className="text-gray-600 dark:text-gray-300 mt-1">
							{organization.description || "Aucune description"}
						</p>
						<div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
							<Users className="w-4 h-4 mr-1" />
							{organization.membersCount} membres
						</div>
					</div>
				</div>
			</div>

			{/* Onglets pour la gestion */}
			<Tabs
				defaultValue="members"
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
							<TabsTrigger value="settings" className="px-6">
								<Settings className="w-4 h-4 mr-2" />
								Paramètres
							</TabsTrigger>
						</>
					)}
				</TabsList>

				<TabsContent value="members">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Membres de l'organisation</CardTitle>
								<CardDescription>
									Gérez les membres et leurs rôles au sein de
									votre organisation
								</CardDescription>
							</div>
							{(organization.userRole === "OWNER" ||
								organization.userRole === "ADMIN") && (
								<Button
									onClick={() => setShowAddMemberModal(true)}
									className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
								>
									<UserPlus className="w-4 h-4 mr-2" />
									Inviter un membre
								</Button>
							)}
						</CardHeader>
						<CardContent>
							<MembersTable
								members={organization.members}
								currentUserRole={organization.userRole}
								onChangeRole={handleChangeRole}
								onRemoveMember={handleRemoveMember}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="invitations">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<div>
								<CardTitle>Invitations en attente</CardTitle>
								<CardDescription>
									Suivez les invitations envoyées aux nouveaux
									membres potentiels
								</CardDescription>
							</div>
							<Button
								onClick={() => setShowAddMemberModal(true)}
								className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
							>
								<UserPlus className="w-4 h-4 mr-2" />
								Inviter un membre
							</Button>
						</CardHeader>
						<CardContent>
							<InvitationsTable
								invitations={invitations}
								onCancel={handleCancelInvitation}
								onResend={handleResendInvitation}
							/>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="settings">
					<Card>
						<CardHeader>
							<CardTitle>Paramètres de l'organisation</CardTitle>
							<CardDescription>
								Modifiez les informations et les paramètres de
								votre organisation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<OrganizationSettingsForm
								organization={organization}
								onSave={handleSaveSettings}
								onDelete={handleDeleteOrganization}
							/>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			{/* Modal pour ajouter un membre */}
			{showAddMemberModal && (
				<AddMemberModal
					isOpen={showAddMemberModal}
					onClose={() => setShowAddMemberModal(false)}
					onSubmit={handleAddMember}
				/>
			)}
		</div>
	);
}
