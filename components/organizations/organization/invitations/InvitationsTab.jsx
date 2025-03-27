// components/organizations/organization/invitations/InvitationsTab.jsx
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
import InvitationsTable from "./InvitationsTable";
import AddMemberModal from "../members/AddMemberModal";

export default function InvitationsTab({
	organization,
	invitations,
	isLoading,
	onAddMember,
	onCancel,
	onResend,
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
					<CardTitle>Invitations en attente</CardTitle>
					<CardDescription>
						Suivez les invitations envoyées aux nouveaux membres
						potentiels
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
					isLoading={isLoading}
					onCancel={onCancel}
					onResend={onResend}
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
