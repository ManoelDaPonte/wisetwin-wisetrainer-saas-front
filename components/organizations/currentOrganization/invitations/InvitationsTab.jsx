//components/organizations/currentOrganization/invitations/InvitationsTab.jsx
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import InvitationsTable from "./InvitationsTable";
import AddMemberButton from "../members/AddMemberButton";
import InvitationConfirmationModal from "./InvitationsConfirmationModal";
import { useCurrentOrganizationInvitations } from "@/lib/hooks/organizations/currentOrganization/useCurrentOrganizationInvitations";

export default function InvitationsTab({ organization }) {
	const {
		invitations,
		isLoading,
		fetchInvitations,
		addMember,
		cancelInvitation,
		resendInvitation,
	} = useCurrentOrganizationInvitations(organization.id);

	const [confirmationModal, setConfirmationModal] = useState({
		isOpen: false,
		type: null,
		invitationId: null,
		email: null,
	});

	const handleCancelInvitation = (invitationId) => {
		// Trouver l'email associé à l'invitation
		const invitation = invitations.find((inv) => inv.id === invitationId);
		if (!invitation) return;

		// Ouvrir une modal de confirmation
		setConfirmationModal({
			isOpen: true,
			type: "cancel",
			invitationId,
			email: invitation.email,
		});
	};

	const handleResendInvitation = (invitationId) => {
		// Trouver l'email associé à l'invitation
		const invitation = invitations.find((inv) => inv.id === invitationId);
		if (!invitation) return;

		// Ouvrir une modal de confirmation
		setConfirmationModal({
			isOpen: true,
			type: "resend",
			invitationId,
			email: invitation.email,
		});
	};

	const confirmAction = async () => {
		const { type, invitationId } = confirmationModal;

		try {
			if (type === "cancel") {
				await cancelInvitation(invitationId);
			} else if (type === "resend") {
				await resendInvitation(invitationId);
			}
		} finally {
			// Fermer la modal
			setConfirmationModal({
				isOpen: false,
				type: null,
				invitationId: null,
				email: null,
			});
		}
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Invitations</CardTitle>
					<CardDescription>
						Gérez les invitations à rejoindre votre organisation
					</CardDescription>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={fetchInvitations}
						disabled={isLoading}
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${
								isLoading ? "animate-spin" : ""
							}`}
						/>
						Actualiser
					</Button>
					<AddMemberButton onAddMember={addMember} />
				</div>
			</CardHeader>
			<CardContent>
				<InvitationsTable
					invitations={invitations}
					onCancel={handleCancelInvitation}
					onResend={handleResendInvitation}
				/>

				{/* Modal de confirmation */}
				<InvitationConfirmationModal
					isVisible={confirmationModal.isOpen}
					type={confirmationModal.type}
					email={confirmationModal.email}
					onConfirm={confirmAction}
					onCancel={() =>
						setConfirmationModal({
							isOpen: false,
							type: null,
							invitationId: null,
							email: null,
						})
					}
				/>
			</CardContent>
		</Card>
	);
}
