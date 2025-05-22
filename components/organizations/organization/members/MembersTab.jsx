//components/organizations/organization/members/MembersTab.jsx
import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, LogOut } from "lucide-react";
import MembersTable from "./MembersTable";
import AddMemberModal from "./AddMemberModal";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export default function MembersTab({
	organization,
	onAddMember,
	onChangeRole,
	onRemoveMember,
	onLeaveOrganization,
}) {
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [membersWithTags, setMembersWithTags] = useState(
		organization.members || []
	);
	const [isLoadingMembers, setIsLoadingMembers] = useState(false);
	const { toast } = useToast();

	// Charger les membres avec leurs tags au montage du composant
	useEffect(() => {
		fetchMembersWithTags();
	}, [organization.id]);

	// Récupérer les membres avec leurs tags
	const fetchMembersWithTags = async () => {
		try {
			setIsLoadingMembers(true);
			const response = await axios.get(
				`/api/organization/${organization.id}/members-with-tags`
			);

			if (response.data.members) {
				setMembersWithTags(response.data.members);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des membres:", error);
			toast({
				title: "Erreur",
				description:
					"Impossible de charger les membres avec leurs tags",
				variant: "destructive",
			});
		} finally {
			setIsLoadingMembers(false);
		}
	};

	const handleAddMemberSubmit = async (memberData) => {
		await onAddMember(memberData);
		setShowAddMemberModal(false);
		// Rafraîchir la liste des membres
		fetchMembersWithTags();
	};

	const handleRoleChange = async (memberId, newRole) => {
		await onChangeRole(memberId, newRole);
		// Rafraîchir la liste des membres
		fetchMembersWithTags();
	};

	const handleRemoveMember = async (memberId) => {
		await onRemoveMember(memberId);
		// Rafraîchir la liste des membres
		fetchMembersWithTags();
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Membres de l'organisation</CardTitle>
					<CardDescription>
						{organization.userRole === "MEMBER" 
							? "Consultez la liste des membres de l'organisation"
							: "Gérez les membres et leurs rôles au sein de votre organisation"
						}
					</CardDescription>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={fetchMembersWithTags}
						disabled={isLoadingMembers}
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${
								isLoadingMembers ? "animate-spin" : ""
							}`}
						/>
						Actualiser
					</Button>
					
					{/* Bouton d'invitation pour admins et owners */}
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
					
					{/* Bouton de désinscription pour les membres */}
					{organization.userRole === "MEMBER" && (
						<Button
							variant="destructive"
							onClick={onLeaveOrganization}
						>
							<LogOut className="w-4 h-4 mr-2" />
							Quitter l'organisation
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				<MembersTable
					members={membersWithTags}
					currentUserRole={organization.userRole}
					onChangeRole={handleRoleChange}
					onRemoveMember={handleRemoveMember}
				/>
			</CardContent>

			{/* Modal d'invitation */}
			{showAddMemberModal && (
				<AddMemberModal
					isOpen={showAddMemberModal}
					onClose={() => setShowAddMemberModal(false)}
					onSubmit={handleAddMemberSubmit}
				/>
			)}
		</Card>
	);
}
