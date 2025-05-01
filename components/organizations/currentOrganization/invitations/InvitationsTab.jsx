//components/organizations/currentOrganization/invitations/InvitationsTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import InvitationsTable from "./InvitationsTable";
import AddMemberButton from "../members/AddMemberButton";
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

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Invitations</CardTitle>
					<CardDescription>
						Gérez les invitations envoyées aux nouveaux membres
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
					isLoading={isLoading}
					onCancelInvitation={cancelInvitation}
					onResendInvitation={resendInvitation}
				/>
			</CardContent>
		</Card>
	);
}
