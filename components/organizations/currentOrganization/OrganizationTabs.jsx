//components/organizations/organization/OrganizationTabs.jsx
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, Settings, BarChart, Tag } from "lucide-react";

// Importation des composants d'onglets
import MembersTab from "./members/MembersTab";
import InvitationsTab from "./invitations/InvitationsTab";
import SettingsTab from "./settings/SettingsTab";
import DashboardTab from "./dashboard/DashboardTab";
import TagsTab from "./tags/TagsTab";

export default function OrganizationTabs({ organization, onDataChange }) {
	const [activeTab, setActiveTab] = useState("members");

	return (
		<Tabs
			defaultValue="members"
			className="w-full"
			onValueChange={setActiveTab}
			value={activeTab}
		>
			<TabsList className="mb-8">
				<TabsTrigger value="members" className="px-6">
					<Users className="w-4 h-4 mr-2" />
					Membres
				</TabsTrigger>

				{(organization.userRole === "OWNER" ||
					organization.userRole === "ADMIN") && (
					<>
						<TabsTrigger value="invitations" className="px-6">
							<Mail className="w-4 h-4 mr-2" />
							Invitations
						</TabsTrigger>

						<TabsTrigger value="tags" className="px-6">
							<Tag className="w-4 h-4 mr-2" />
							Tags
						</TabsTrigger>

						<TabsTrigger value="dashboard" className="px-6">
							<BarChart className="w-4 h-4 mr-2" />
							Dashboard
						</TabsTrigger>

						<TabsTrigger value="settings" className="px-6">
							<Settings className="w-4 h-4 mr-2" />
							Paramètres
						</TabsTrigger>
					</>
				)}
			</TabsList>

			{/* Contenu de l'onglet Membres */}
			<TabsContent value="members">
				<MembersTab organization={organization} />
			</TabsContent>

			{/* Contenu de l'onglet Tags */}
			<TabsContent value="tags">
				<TagsTab organization={organization} />
			</TabsContent>

			{/* Contenu de l'onglet Dashboard */}
			<TabsContent value="dashboard">
				<DashboardTab organization={organization} />
			</TabsContent>

			{/* Contenu de l'onglet Invitations */}
			<TabsContent value="invitations">
				<InvitationsTab organization={organization} />
			</TabsContent>

			{/* Contenu de l'onglet Paramètres */}
			<TabsContent value="settings">
				<SettingsTab
					organization={organization}
					onDataChange={onDataChange}
				/>
			</TabsContent>
		</Tabs>
	);
}
