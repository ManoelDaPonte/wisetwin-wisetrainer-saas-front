//components/organizations/common/RoleBadge.jsx
import React from "react";
import { Crown, Shield, User } from "lucide-react";

export default function RoleBadge({ role, size = "default" }) {
	// Tailles disponibles
	const sizes = {
		small: {
			container: "px-1.5 py-0.5 text-xs rounded text-xs",
			icon: "w-2.5 h-2.5",
		},
		default: {
			container: "px-2 py-1 rounded text-xs font-medium",
			icon: "w-3 h-3",
		},
		large: {
			container: "px-2.5 py-1.5 rounded text-sm font-medium",
			icon: "w-4 h-4",
		},
	};

	const { container, icon } = sizes[size] || sizes.default;

	switch (role) {
		case "OWNER":
			return (
				<div
					className={`flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 ${container}`}
				>
					<Crown className={icon} />
					Propriétaire
				</div>
			);
		case "ADMIN":
			return (
				<div
					className={`flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 ${container}`}
				>
					<Shield className={icon} />
					Administrateur
				</div>
			);
		case "MEMBER":
			return (
				<div
					className={`flex items-center gap-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 ${container}`}
				>
					<User className={icon} />
					Membre
				</div>
			);
		default:
			return (
				<div className={`bg-gray-100 text-gray-800 ${container}`}>
					Inconnu
				</div>
			);
	}
}
