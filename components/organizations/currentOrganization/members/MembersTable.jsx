//components/organizations/organization/members/MembersTable.jsx
import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import MemberRoleBadge from "./MemberRoleBadge";
import MemberTagsDisplay from "./MemberTagsDisplay";
import MemberActions from "./MemberActions";
import MemberConfirmationModal from "./MemberConfirmationModal";

export default function MembersTable({
	members = [],
	currentUserRole = "MEMBER",
	onChangeRole,
	onRemoveMember,
}) {
	const [confirmationModal, setConfirmationModal] = useState({
		isOpen: false,
		type: null,
		member: null,
		newRole: null,
	});

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const handleChangeRole = (member, newRole) => {
		// Ouvrir une modal de confirmation
		setConfirmationModal({
			isOpen: true,
			type: "changeRole",
			member,
			newRole,
		});
	};

	const handleRemoveMember = (member) => {
		// Ouvrir une modal de confirmation
		setConfirmationModal({
			isOpen: true,
			type: "removeMember",
			member,
			newRole: null,
		});
	};

	const confirmAction = () => {
		const { type, member, newRole } = confirmationModal;

		if (type === "changeRole" && member && newRole) {
			onChangeRole(member.id, newRole);
		} else if (type === "removeMember" && member) {
			onRemoveMember(member.id);
		}

		// Fermer la modal
		setConfirmationModal({
			isOpen: false,
			type: null,
			member: null,
			newRole: null,
		});
	};

	// Si aucun membre, afficher un message
	if (members.length === 0) {
		return (
			<div className="text-center py-8">
				<p className="text-gray-500 dark:text-gray-400">
					Aucun membre dans cette organisation
				</p>
			</div>
		);
	}

	return (
		<div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Membre</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Rôle</TableHead>
						<TableHead>Tags</TableHead>
						<TableHead>A rejoint le</TableHead>
						{currentUserRole !== "MEMBER" && (
							<TableHead className="text-right">
								Actions
							</TableHead>
						)}
					</TableRow>
				</TableHeader>
				<TableBody>
					{members.map((member) => (
						<TableRow key={member.id}>
							<TableCell className="font-medium">
								{member.name}
							</TableCell>
							<TableCell>{member.email}</TableCell>
							<TableCell>
								<MemberRoleBadge role={member.role} />
							</TableCell>
							<TableCell>
								<MemberTagsDisplay tags={member.tags} />
							</TableCell>
							<TableCell>{formatDate(member.joinedAt)}</TableCell>
							{currentUserRole !== "MEMBER" && (
								<TableCell className="text-right">
									<MemberActions
										member={member}
										currentUserRole={currentUserRole}
										onChangeRole={handleChangeRole}
										onRemoveMember={handleRemoveMember}
									/>
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Modal de confirmation */}
			<MemberConfirmationModal
				isVisible={confirmationModal.isOpen}
				type={confirmationModal.type}
				member={confirmationModal.member}
				newRole={confirmationModal.newRole}
				onConfirm={confirmAction}
				onCancel={() =>
					setConfirmationModal({
						isOpen: false,
						type: null,
						member: null,
						newRole: null,
					})
				}
			/>
		</div>
	);
}
