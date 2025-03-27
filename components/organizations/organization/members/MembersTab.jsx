// components/organizations/organization/members/MembersTab.jsx
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import MembersTable from "./MembersTable";
import AddMemberModal from "./AddMemberModal";

export default function MembersTab({
	organization,
	onAddMember,
	onChangeRole,
	onRemoveMember,
}) {
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);

	const handleAddMemberSubmit = async (memberData) => {
		await onAddMember(memberData);
		setShowAddMemberModal(false);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Membres de l'organisation</CardTitle>
					<CardDescription>
						Gérez les membres et leurs rôles au sein de votre
						organisation
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
					onChangeRole={onChangeRole}
					onRemoveMember={onRemoveMember}
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
