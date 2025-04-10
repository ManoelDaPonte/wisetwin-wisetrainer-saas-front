//components/organizations/organization/tags/TagsTab.jsx
import React, { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Tag, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TagsTable from "./TagsTable";
import AddTagModal from "./AddTagModal";
import TagsTrainingAssociations from "./TagsTrainingAssociations";
import TagsUserAssociations from "./TagsUserAssociations";

export default function TagsTab({
	organization,
	tags = [],
	isLoading,
	onAddTag,
	onEditTag,
	onDeleteTag,
}) {
	const [showAddTagModal, setShowAddTagModal] = useState(false);
	const [editingTag, setEditingTag] = useState(null);
	const [activeTab, setActiveTab] = useState("tags");

	const handleAddTagSubmit = async (tagData) => {
		await onAddTag(tagData);
		setShowAddTagModal(false);
	};

	const handleEditTag = (tag) => {
		setEditingTag(tag);
		setShowAddTagModal(true);
	};

	const handleModalClose = () => {
		setEditingTag(null);
		setShowAddTagModal(false);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<div>
					<CardTitle>Tags de l'organisation</CardTitle>
					<CardDescription>
						Gérez les tags pour catégoriser les utilisateurs et les
						formations
					</CardDescription>
				</div>
				{activeTab === "tags" &&
					(organization.userRole === "OWNER" ||
						organization.userRole === "ADMIN") && (
						<Button
							onClick={() => setShowAddTagModal(true)}
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
						>
							<Plus className="w-4 h-4 mr-2" />
							Ajouter un tag
						</Button>
					)}
			</CardHeader>
			<CardContent>
				<Tabs
					defaultValue="tags"
					onValueChange={setActiveTab}
					value={activeTab}
					className="w-full"
				>
					<TabsList className="mb-4">
						<TabsTrigger value="tags">
							<Tag className="h-4 w-4 mr-2" />
							Gestion des tags
						</TabsTrigger>
						<TabsTrigger value="associations">
							<Tag className="h-4 w-4 mr-2" />
							Associations formations
						</TabsTrigger>
						<TabsTrigger value="user-associations">
							<Users className="h-4 w-4 mr-2" />
							Associations utilisateurs
						</TabsTrigger>
					</TabsList>

					<TabsContent value="tags">
						<TagsTable
							tags={tags}
							isLoading={isLoading}
							onEditTag={handleEditTag}
							onDeleteTag={onDeleteTag}
							userRole={organization.userRole}
						/>
					</TabsContent>

					<TabsContent value="associations">
						<TagsTrainingAssociations organization={organization} />
					</TabsContent>

					<TabsContent value="user-associations">
						<TagsUserAssociations organization={organization} />
					</TabsContent>
				</Tabs>
			</CardContent>

			{/* Modal d'ajout/édition de tag */}
			{showAddTagModal && (
				<AddTagModal
					isOpen={showAddTagModal}
					onClose={handleModalClose}
					onSubmit={editingTag ? onEditTag : handleAddTagSubmit}
					tag={editingTag}
				/>
			)}
		</Card>
	);
}
