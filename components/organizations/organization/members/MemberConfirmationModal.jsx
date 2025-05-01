//components/organizations/organization/members/MemberConfirmationModal.jsx
import React from "react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function MemberConfirmationModal({
	isVisible,
	type, // 'changeRole' ou 'removeMember'
	member,
	newRole,
	onConfirm,
	onCancel,
}) {
	if (!isVisible || !member) {
		return null;
	}

	const title =
		type === "changeRole"
			? `Modifier le rôle de ${member.name}`
			: `Retirer ${member.name}`;

	const message =
		type === "changeRole"
			? `Êtes-vous sûr de vouloir modifier le rôle de ${member.name} en ${
					newRole === "ADMIN" ? "Administrateur" : "Membre"
			  } ?`
			: `Êtes-vous sûr de vouloir retirer ${member.name} de l'organisation ? Cette action est irréversible.`;

	return (
		<ConfirmationModal
			title={title}
			message={message}
			isVisible={isVisible}
			onConfirm={onConfirm}
			onCancel={onCancel}
			confirmText={type === "changeRole" ? "Modifier" : "Retirer"}
			cancelText="Annuler"
			isDanger={type === "removeMember"}
		/>
	);
}
