//components/organizations/organization/members/MemberActions.jsx
import React, { useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, User, UserMinus, Tag } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MemberActions({
	member,
	currentUserRole,
	onChangeRole,
	onRemoveMember,
}) {
	const router = useRouter();

	// Vérifier si l'utilisateur peut modifier les rôles
	const canManageRoles = ["OWNER", "ADMIN"].includes(currentUserRole);

	// Seul le propriétaire peut modifier le rôle d'un administrateur ou d'un autre propriétaire
	const canManageRole = (memberRole) => {
		if (currentUserRole === "OWNER") return true;
		if (currentUserRole === "ADMIN" && memberRole === "MEMBER") return true;
		return false;
	};

	const handleManageTags = (memberId) => {
		// Naviguer vers l'onglet d'association des tags utilisateurs
		router.push(
			`/organization?tab=tags&subTab=user-associations&highlight=${memberId}`
		);
	};

	if (!canManageRoles) {
		return <span className="text-gray-400">-</span>;
	}

	if (!canManageRole(member.role)) {
		return <span className="text-gray-400">-</span>;
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="sm">
					<MoreHorizontal className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem
					disabled={
						member.role === "OWNER" ||
						(currentUserRole !== "OWNER" && member.role === "ADMIN")
					}
					onClick={() => onChangeRole(member, "ADMIN")}
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
					disabled={member.role === "MEMBER"}
					onClick={() => onChangeRole(member, "MEMBER")}
					className={
						member.role === "MEMBER"
							? "bg-gray-50 dark:bg-gray-800"
							: ""
					}
				>
					<User className="mr-2 h-4 w-4" />
					Membre
				</DropdownMenuItem>

				<DropdownMenuItem onClick={() => handleManageTags(member.id)}>
					<Tag className="mr-2 h-4 w-4" />
					Gérer les tags
				</DropdownMenuItem>

				{currentUserRole === "OWNER" && member.role !== "OWNER" && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => onRemoveMember(member)}
							className="text-red-600 focus:text-red-600"
						>
							<UserMinus className="mr-2 h-4 w-4" />
							Retirer
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
