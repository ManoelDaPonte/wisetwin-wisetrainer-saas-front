//components/organizations/currentOrganization/invitations/InvitationStatusBadge.jsx
import React from "react";
import { Check, Clock, X, AlertTriangle } from "lucide-react";

export default function InvitationStatusBadge({ status }) {
	switch (status) {
		case "PENDING":
			return (
				<div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 px-2 py-1 rounded text-xs font-medium">
					<Clock className="w-3 h-3" />
					En attente
				</div>
			);
		case "ACCEPTED":
			return (
				<div className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 px-2 py-1 rounded text-xs font-medium">
					<Check className="w-3 h-3" />
					Acceptée
				</div>
			);
		case "REJECTED":
			return (
				<div className="flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 px-2 py-1 rounded text-xs font-medium">
					<X className="w-3 h-3" />
					Refusée
				</div>
			);
		case "EXPIRED":
			return (
				<div className="flex items-center gap-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium">
					<AlertTriangle className="w-3 h-3" />
					Expirée
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
