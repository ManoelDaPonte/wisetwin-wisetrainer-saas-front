//components/organizations/organization/members/MembersTable.jsx
import React, { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
	ChevronDown,
	MoreHorizontal,
	Shield,
	User,
	Crown,
	UserMinus,
	UserCog,
	Tag,
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function MembersTable({
	members = [],
	currentUserRole = "MEMBER",
	onChangeRole = () => {},
	onRemoveMember = () => {},
}) {
	const [confirmationModal, setConfirmationModal] = useState({
		isOpen: false,
		type: null,
		member: null,
		newRole: null,
	});
	const router = useRouter();

	// Vérifier si l'utilisateur peut modifier les rôles (doit être OWNER ou ADMIN)
	const canManageRoles = ["OWNER", "ADMIN"].includes(currentUserRole);

	// Seul le propriétaire peut modifier le rôle d'un administrateur ou d'un autre propriétaire
	const canManageRole = (memberRole) => {
		if (currentUserRole === "OWNER") return true;
		if (currentUserRole === "ADMIN" && memberRole === "MEMBER") return true;
		return false;
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	const getRoleBadge = (role) => {
		switch (role) {
			case "OWNER":
				return (
					<div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 px-2 py-1 rounded text-xs font-medium">
						<Crown className="w-3 h-3" />
						Propriétaire
					</div>
				);
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

	const handleManageTags = (memberId) => {
		// Naviguer vers l'onglet d'association des tags utilisateurs
		router.push(
			`/organization?tab=tags&subTab=user-associations&highlight=${memberId}`
		);
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
						{canManageRoles && (
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
							<TableCell>{getRoleBadge(member.role)}</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1 max-w-xs">
									{member.tags && member.tags.length > 0 ? (
										<div className="flex flex-wrap gap-1.5">
											{member.tags.map((tag) => (
												<div
													key={tag.id}
													className="w-4 h-4 rounded-full"
													style={{
														backgroundColor:
															tag.color,
													}}
													title={tag.name} // Ajouter un titre pour montrer le nom en survol
												></div>
											))}
										</div>
									) : (
										<span className="text-gray-400 text-sm">
											Aucun tag
										</span>
									)}
								</div>
							</TableCell>
							<TableCell>{formatDate(member.joinedAt)}</TableCell>
							{canManageRoles && (
								<TableCell className="text-right">
									{canManageRole(member.role) ? (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
												>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem
													disabled={
														member.role ===
															"OWNER" ||
														(currentUserRole !==
															"OWNER" &&
															member.role ===
																"ADMIN")
													}
													onClick={() =>
														handleChangeRole(
															member,
															"ADMIN"
														)
													}
													className={
														member.role === "ADMIN"
															? "bg-blue-50 dark:bg-blue-900/20"
															: ""
													}
												>
													<Shield className="mr-2 h-4 w-4" />
													Administrateur
												</DropdownMenuItem>
												<DropdownMenuItem
													disabled={
														member.role === "MEMBER"
													}
													onClick={() =>
														handleChangeRole(
															member,
															"MEMBER"
														)
													}
													className={
														member.role === "MEMBER"
															? "bg-gray-50 dark:bg-gray-800"
															: ""
													}
												>
													<User className="mr-2 h-4 w-4" />
													Membre
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														handleManageTags(
															member.id
														)
													}
												>
													<Tag className="mr-2 h-4 w-4" />
													Gérer les tags
												</DropdownMenuItem>

												{currentUserRole === "OWNER" &&
													member.role !== "OWNER" && (
														<>
															<DropdownMenuSeparator />
															<DropdownMenuItem
																onClick={() =>
																	handleRemoveMember(
																		member
																	)
																}
																className="text-red-600 focus:text-red-600"
															>
																<UserMinus className="mr-2 h-4 w-4" />
																Retirer
															</DropdownMenuItem>
														</>
													)}
											</DropdownMenuContent>
										</DropdownMenu>
									) : (
										<span className="text-gray-400">-</span>
									)}
								</TableCell>
							)}
						</TableRow>
					))}
				</TableBody>
			</Table>

			{/* Modal de confirmation */}
			{confirmationModal.isOpen && (
				<ConfirmationModal
					title={
						confirmationModal.type === "changeRole"
							? `Modifier le rôle de ${confirmationModal.member?.name}`
							: `Retirer ${confirmationModal.member?.name}`
					}
					message={
						confirmationModal.type === "changeRole"
							? `Êtes-vous sûr de vouloir modifier le rôle de ${
									confirmationModal.member?.name
							  } en ${
									confirmationModal.newRole === "ADMIN"
										? "Administrateur"
										: "Membre"
							  } ?`
							: `Êtes-vous sûr de vouloir retirer ${confirmationModal.member?.name} de l'organisation ? Cette action est irréversible.`
					}
					isVisible={confirmationModal.isOpen}
					onConfirm={confirmAction}
					onCancel={() =>
						setConfirmationModal({
							isOpen: false,
							type: null,
							member: null,
							newRole: null,
						})
					}
					confirmText={
						confirmationModal.type === "changeRole"
							? "Modifier"
							: "Retirer"
					}
					cancelText="Annuler"
					isDanger={confirmationModal.type === "removeMember"}
				/>
			)}
		</div>
	);
}
