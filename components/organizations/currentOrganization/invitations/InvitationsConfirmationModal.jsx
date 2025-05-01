//components/organizations/currentOrganization/invitations/InvitationConfirmationModal.jsx
import React from "react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function InvitationConfirmationModal({
	isVisible,
	type, // 'cancel' ou 'resend'
	email,
	onConfirm,
	onCancel,
}) {
	if (!isVisible || !email) {
		return null;
	}

	const title =
		type === "cancel" ? `Annuler l'invitation` : `Renvoyer l'invitation`;

	const message =
		type === "cancel"
			? `Êtes-vous sûr de vouloir annuler l'invitation envoyée à ${email} ? Cette action est irréversible.`
			: `Êtes-vous sûr de vouloir renvoyer l'invitation à ${email} ? Un nouvel email sera envoyé.`;

	return (
		<ConfirmationModal
			title={title}
			message={message}
			isVisible={isVisible}
			onConfirm={onConfirm}
			onCancel={onCancel}
			confirmText={
				type === "cancel" ? "Annuler l'invitation" : "Renvoyer"
			}
			cancelText="Retour"
			isDanger={type === "cancel"}
		/>
	);
}
