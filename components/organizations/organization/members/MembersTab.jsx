//components/organizations/organization/members/MembersTab.jsx
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
import MembersTable from "./MembersTable";
import AddMemberButton from "./AddMemberButton";
import { useCurrentOrganizationMembers } from "@/lib/hooks/organizations/currentOrganization/useCurrentOrganizationMembers";

export default function MembersTab({ organization }) {
	const {
		members,
		isLoading,
		fetchMembers,
		changeRole,
		removeMember,
		addMember,
	} = useCurrentOrganizationMembers(organization.id);

	const canManageMembers = ["OWNER", "ADMIN"].includes(organization.userRole);

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
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={fetchMembers}
						disabled={isLoading}
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${
								isLoading ? "animate-spin" : ""
							}`}
						/>
						Actualiser
					</Button>

					{canManageMembers && (
						<AddMemberButton onAddMember={addMember} />
					)}
				</div>
			</CardHeader>
			<CardContent>
				<MembersTable
					members={members}
					currentUserRole={organization.userRole}
					onChangeRole={changeRole}
					onRemoveMember={removeMember}
				/>
			</CardContent>
		</Card>
	);
}
