//components/organizations/organization/members/MemberRoleBadge.jsx
import React from "react";
import { Crown, Shield, User } from "lucide-react";

export default function MemberRoleBadge({ role }) {
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
			return (
				<div className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
					Inconnu
				</div>
			);
	}
}
