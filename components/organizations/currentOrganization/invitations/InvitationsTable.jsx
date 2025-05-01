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
import { Button } from "@/components/ui/button";
import { Mail, X, RefreshCw } from "lucide-react";

import MemberRoleBadge from "../members/MemberRoleBadge";
import InvitationStatusBadge from "./InvitationStatusBadge";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useState } from "react";

export default function InvitationsTable({
	invitations = [],
	isLoading = false,
	onCancelInvitation,
	onResendInvitation,
}) {
	const [confirmAction, setConfirmAction] = useState({
		isOpen: false,
		type: null,
		invitation: null,
	});

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleCancelInvitation = (invitation) => {
		setConfirmAction({
			isOpen: true,
			type: "cancel",
			invitation,
		});
	};

	const handleResendInvitation = (invitation) => {
		setConfirmAction({
			isOpen: true,
			type: "resend",
			invitation,
		});
	};

	const executeAction = async () => {
		const { type, invitation } = confirmAction;

		if (type === "cancel") {
			await onCancelInvitation(invitation.id);
		} else if (type === "resend") {
			await onResendInvitation(invitation.id);
		}

		setConfirmAction({
			isOpen: false,
			type: null,
			invitation: null,
		});
	};

	// Si chargement en cours, afficher une indication
	if (isLoading) {
		return (
			<div className="text-center py-10 text-gray-400">
				<div className="animate-spin mb-2 mx-auto">
					<RefreshCw className="h-10 w-10" />
				</div>
				<p>Chargement des invitations...</p>
			</div>
		);
	}

	// Si aucune invitation, afficher un message
	if (invitations.length === 0) {
		return (
			<div className="text-center py-10 text-gray-500">
				<Mail className="h-10 w-10 mb-2 mx-auto opacity-40" />
				<p>Aucune invitation en cours</p>
				<p className="text-sm">
					Utilisez le bouton "Inviter un membre" pour envoyer des
					invitations.
				</p>
			</div>
		);
	}

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Email</TableHead>
						<TableHead>Rôle</TableHead>
						<TableHead>Statut</TableHead>
						<TableHead>Date d'envoi</TableHead>
						<TableHead>Expire le</TableHead>
						<TableHead>Invité par</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{invitations.map((invitation) => (
						<TableRow key={invitation.id}>
							<TableCell className="font-medium">
								{invitation.email}
							</TableCell>
							<TableCell>
								<MemberRoleBadge role={invitation.role} />
							</TableCell>
							<TableCell>
								<InvitationStatusBadge
									status={invitation.status}
								/>
							</TableCell>
							<TableCell>
								{formatDate(invitation.invitedAt)}
							</TableCell>
							<TableCell>
								{formatDate(invitation.expiresAt)}
							</TableCell>
							<TableCell>{invitation.inviterName}</TableCell>
							<TableCell className="text-right">
								<div className="flex justify-end gap-2">
									{invitation.status === "PENDING" && (
										<>
											<Button
												size="sm"
												variant="outline"
												onClick={() =>
													handleResendInvitation(
														invitation
													)
												}
											>
												<Mail className="h-4 w-4 mr-1" />{" "}
												Renvoyer
											</Button>
											<Button
												size="sm"
												variant="outline"
												className="text-red-600 hover:text-red-700 hover:bg-red-50"
												onClick={() =>
													handleCancelInvitation(
														invitation
													)
												}
											>
												<X className="h-4 w-4 mr-1" />{" "}
												Annuler
											</Button>
										</>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Modal de confirmation */}
			<ConfirmationModal
				isVisible={confirmAction.isOpen}
				title={
					confirmAction.type === "cancel"
						? "Annuler l'invitation"
						: "Renvoyer l'invitation"
				}
				message={
					confirmAction.type === "cancel"
						? `Êtes-vous sûr de vouloir annuler l'invitation envoyée à ${
								confirmAction.invitation?.email || ""
						  } ?`
						: `Souhaitez-vous renvoyer l'invitation à ${
								confirmAction.invitation?.email || ""
						  } ? La date d'expiration sera prolongée de 7 jours.`
				}
				confirmText={
					confirmAction.type === "cancel"
						? "Annuler l'invitation"
						: "Renvoyer"
				}
				cancelText="Fermer"
				isDanger={confirmAction.type === "cancel"}
				onConfirm={executeAction}
				onCancel={() =>
					setConfirmAction({
						isOpen: false,
						type: null,
						invitation: null,
					})
				}
			/>
		</div>
	);
}
