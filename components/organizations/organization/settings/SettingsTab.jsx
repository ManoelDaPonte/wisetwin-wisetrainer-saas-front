// components/organizations/organization/settings/SettingsTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import OrganizationSettingsForm from "./OrganizationSettingsForm";

export default function SettingsTab({ organization, onSave, onDelete }) {
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
					onSave={onSave}
					onDelete={onDelete}
				/>
			</CardContent>
		</Card>
	);
}
