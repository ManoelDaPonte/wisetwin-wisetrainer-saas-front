//components/organizations/currentOrganization/invitations/InvitationsActions.jsx
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, RefreshCw, X } from "lucide-react";

export default function InvitationActions({ invitation, onCancel, onResend }) {
	// Vérifier si l'invitation est expirée ou pas en attente
	const isExpired = new Date() > new Date(invitation.expiresAt);
	const isPending = invitation.status === "PENDING";

	// Si l'invitation n'est pas en attente, n'afficher aucune action
	if (!isPending) {
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
					onClick={() => onResend(invitation.id)}
					disabled={!isPending}
				>
					<RefreshCw className="mr-2 h-4 w-4" />
					Renvoyer
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => onCancel(invitation.id)}
					disabled={!isPending}
					className="text-red-600 focus:text-red-600"
				>
					<X className="mr-2 h-4 w-4" />
					Annuler
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
