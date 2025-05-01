//components/organizations/organization/OrganizationTabs.jsx
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Mail, Settings, BarChart, Tag } from "lucide-react";
import { useToast } from "@/lib/hooks/useToast";

// Importation des composants d'onglets refactorisés
import MembersTab from "./members/MembersTab";
import InvitationsTab from "./invitations/InvitationsTab";
import SettingsTab from "./settings/SettingsTab";
import DashboardTab from "./dashboard/DashboardTab";
import TagsTab from "./tags/TagsTab";

export default function OrganizationTabs({ organization, onDataChange }) {
	const [activeTab, setActiveTab] = useState("members");
	const [invitations, setInvitations] = useState([]);
	const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
	const [tags, setTags] = useState([]);
	const [isLoadingTags, setIsLoadingTags] = useState(false);

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

			{/* Contenu de l'onglet Membres (refactorisé) */}
			<TabsContent value="members">
				<MembersTab organization={organization} />
			</TabsContent>

			{/* Contenu de l'onglet Tags */}
			<TabsContent value="tags">
				<TagsTab
					organization={organization}
					tags={tags}
					isLoading={isLoadingTags}
					onAddTag={handleAddTag}
					onEditTag={handleEditTag}
					onDeleteTag={handleDeleteTag}
				/>
			</TabsContent>

			{/* Contenu de l'onglet Dashboard */}
			<TabsContent value="dashboard">
				<DashboardTab organization={organization} />
			</TabsContent>

			{/* Contenu de l'onglet Invitations */}
			<TabsContent value="invitations">
				<InvitationsTab
					organization={organization}
					invitations={invitations}
					isLoading={isLoadingInvitations}
					onAddMember={handleAddMember}
					onCancel={handleCancelInvitation}
					onResend={handleResendInvitation}
				/>
			</TabsContent>

			{/* Contenu de l'onglet Paramètres */}
			<TabsContent value="settings">
				<SettingsTab
					organization={organization}
					onSave={handleSaveSettings}
					onDelete={handleDeleteOrganization}
				/>
			</TabsContent>
		</Tabs>
	);
}
