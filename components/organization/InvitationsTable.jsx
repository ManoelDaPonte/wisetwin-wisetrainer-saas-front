// components/organization/InvitationsTable.jsx
import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, X, RotateCw, Shield, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function InvitationsTable({
	invitations = [],
	onCancel,
	onResend,
}) {
	const [confirmationModal, setConfirmationModal] = useState({
		isOpen: false,
		type: null,
		invitation: null,
	});

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const getRoleBadge = (role) => {
		switch (role) {
			case "ADMIN":
				return (
					<div className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 px-2 py-1 rounded text-xs font-medium">
						<Shield className="w-3 h-3" />
						Administrateur
					</div>
				);
			case "MEMBER":
				return (
					<div className="flex items-center gap-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium">
						<User className="w-3 h-3" />
						Membre
					</div>
				);
			default:
				return <Badge color="gray">Inconnu</Badge>;
		}
	};

	const getStatusBadge = (status, expiresAt) => {
		// Vérifier si l'invitation a expiré
		const isExpired = new Date() > new Date(expiresAt);

		if (isExpired && status === "PENDING") {
			return (
				<Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
					Expirée
				</Badge>
			);
		}

		switch (status) {
			case "PENDING":
				return (
					<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
						En attente
					</Badge>
				);
			case "ACCEPTED":
				return (
					<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
						Acceptée
					</Badge>
				);
			case "REJECTED":
				return (
					<Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
						Refusée
					</Badge>
				);
			case "EXPIRED":
				return (
					<Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
						Expirée
					</Badge>
				);
			default:
				return <Badge>Inconnu</Badge>;
		}
	};

	const handleCancelInvitation = (invitation) => {
		setConfirmationModal({
			isOpen: true,
			type: "cancel",
			invitation,
		});
	};

	const confirmAction = () => {
		const { type, invitation } = confirmationModal;

		if (type === "cancel" && invitation) {
			onCancel(invitation.id);
		}

		// Fermer la modal
		setConfirmationModal({
			isOpen: false,
			type: null,
			invitation: null,
		});
	};

	// Si aucune invitation, afficher un message
	if (invitations.length === 0) {
		return (
			<div className="text-center py-8">
				<div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20 p-6 mb-4">
					<Mail className="w-8 h-8 text-wisetwin-blue" />
				</div>
				<h3 className="text-lg font-medium mb-2">
					Aucune invitation en attente
				</h3>
				<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
					Il n'y a actuellement aucune invitation en attente pour
					cette organisation.
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
						<TableHead>Date d'invitation</TableHead>
						<TableHead>Expire le</TableHead>
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
								{getRoleBadge(invitation.role)}
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
								<div className="flex items-center">
									<Clock className="w-4 h-4 mr-1 text-gray-400" />
									{formatDate(invitation.expiresAt)}
								</div>
							</TableCell>
							<TableCell className="text-right">
								{invitation.status === "PENDING" && (
									<div className="flex justify-end space-x-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												onResend(invitation.id)
											}
											title="Renvoyer l'invitation"
										>
											<RotateCw className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												handleCancelInvitation(
													invitation
												)
											}
											title="Annuler l'invitation"
											className="text-red-500 hover:text-red-700"
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Modal de confirmation */}
			{confirmationModal.isOpen && (
				<ConfirmationModal
					title="Annuler l'invitation"
					message={`Êtes-vous sûr de vouloir annuler l'invitation envoyée à ${confirmationModal.invitation?.email} ?`}
					isVisible={confirmationModal.isOpen}
					onConfirm={confirmAction}
					onCancel={() =>
						setConfirmationModal({
							isOpen: false,
							type: null,
							invitation: null,
						})
					}
					confirmText="Annuler l'invitation"
					cancelText="Retour"
					isDanger={true}
				/>
			)}
		</div>
	);
}
