//components/organizations/currentOrganization/invitations/InvitationsTable.jsx
import React from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import InvitationActions from "./InvitationActions";
import RoleBadge from "@/components/organizations/currentOrganization/common/RoleBadge";

export default function InvitationsTable({
	invitations = [],
	onCancel,
	onResend,
}) {
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const getStatusBadge = (status, expiresAt) => {
		const isExpired = new Date() > new Date(expiresAt);

		if (status === "PENDING" && isExpired) {
			return (
				<Badge
					variant="outline"
					className="text-yellow-600 border-yellow-600"
				>
					Expirée
				</Badge>
			);
		}

		switch (status) {
			case "PENDING":
				return (
					<Badge
						variant="outline"
						className="text-blue-600 border-blue-600"
					>
						En attente
					</Badge>
				);
			case "ACCEPTED":
				return (
					<Badge
						variant="outline"
						className="text-green-600 border-green-600"
					>
						Acceptée
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge
						variant="outline"
						className="text-red-600 border-red-600"
					>
						Refusée
					</Badge>
				);
			case "EXPIRED":
				return (
					<Badge
						variant="outline"
						className="text-yellow-600 border-yellow-600"
					>
						Expirée
					</Badge>
				);
			default:
				return (
					<Badge
						variant="outline"
						className="text-gray-600 border-gray-600"
					>
						Inconnu
					</Badge>
				);
		}
	};

	// Si aucune invitation, afficher un message
	if (invitations.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400">
					Aucune invitation en cours
				</p>
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Email</TableHead>
					<TableHead>Rôle</TableHead>
					<TableHead>Statut</TableHead>
					<TableHead>Invité le</TableHead>
					<TableHead>Expire le</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{invitations.map((invitation) => (
					<TableRow key={invitation.id}>
						<TableCell>{invitation.email}</TableCell>
						<TableCell>
							<RoleBadge role={invitation.role} />
						</TableCell>
						<TableCell>
							{getStatusBadge(
								invitation.status,
								invitation.expiresAt
							)}
						</TableCell>
						<TableCell>
							{formatDate(invitation.invitedAt)}
						</TableCell>
						<TableCell>
							{invitation.status === "PENDING"
								? formatDate(invitation.expiresAt)
								: "-"}
						</TableCell>
						<TableCell className="text-right">
							<InvitationActions
								invitation={invitation}
								onCancel={onCancel}
								onResend={onResend}
							/>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
