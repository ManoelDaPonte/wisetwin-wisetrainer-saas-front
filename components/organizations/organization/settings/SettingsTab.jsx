//components/organizations/organization/settings/SettingsTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import OrganizationSettingsForm from "./OrganizationSettingsForm";
import { useCurrentOrganizationParameters } from "@/lib/hooks/organizations/currentOrganization/useCurrentOrganizationParameters";

export default function SettingsTab({ organization, onDataChange }) {
	// Utiliser le hook directement dans le composant
	const { handleSaveSettings, handleDeleteOrganization } =
		useCurrentOrganizationParameters(organization.id, onDataChange);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Paramètres de l'organisation</CardTitle>
				<CardDescription>
					Modifiez les informations et les paramètres de votre
					organisation
				</CardDescription>
			</CardHeader>
			<CardContent>
				<OrganizationSettingsForm
					organization={organization}
					onSave={handleSaveSettings}
					onDelete={handleDeleteOrganization}
				/>
			</CardContent>
		</Card>
	);
}
