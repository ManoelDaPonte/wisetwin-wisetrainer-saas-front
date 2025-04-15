//components/organizations/organization/tags/TagsTable.jsx

import React, { useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users, BookOpen, Tag } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function TagsTable({
	tags = [],
	isLoading,
	onEditTag,
	onDeleteTag,
	userRole,
}) {
	const [tagToDelete, setTagToDelete] = useState(null);

	// Vérifier si l'utilisateur peut modifier les tags
	const canManageTags = ["OWNER", "ADMIN"].includes(userRole);

	const handleDeleteClick = (tag) => {
		setTagToDelete(tag);
	};

	const confirmDelete = () => {
		if (tagToDelete) {
			onDeleteTag(tagToDelete.id);
			setTagToDelete(null);
		}
	};

	return (
		<div>
			{isLoading ? (
				<div className="animate-pulse space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="h-10 bg-gray-200 dark:bg-gray-700 rounded"
						></div>
					))}
				</div>
			) : tags.length === 0 ? (
				<div className="text-center py-10">
					<div className="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-4">
						<Tag className="h-8 w-8 text-gray-400" />
					</div>
					<h3 className="text-lg font-medium mb-2">
						Aucun tag défini
					</h3>
					<p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
						Créez des tags pour catégoriser vos utilisateurs et
						associer des formations spécifiques.
					</p>
				</div>
			) : (
				<>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Tag</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Utilisateurs</TableHead>
								<TableHead>Formations</TableHead>
								{canManageTags && (
									<TableHead>Actions</TableHead>
								)}
							</TableRow>
						</TableHeader>
						<TableBody>
							{tags.map((tag) => (
								<TableRow key={tag.id}>
									<TableCell>
										<div className="flex items-center gap-2">
											<div
												className="w-4 h-4 rounded-full"
												style={{
													backgroundColor: tag.color,
												}}
											></div>
											<span className="font-medium">
												{tag.name}
											</span>
										</div>
									</TableCell>
									<TableCell>
										{tag.description || "—"}
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<Users className="h-4 w-4 text-gray-400" />
											<span>
												{tag.userCount || 0} utilisateur
												{tag.userCount !== 1 ? "s" : ""}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-1">
											<BookOpen className="h-4 w-4 text-gray-400" />
											<span>
												{tag.trainingCount || 0}{" "}
												formation
												{tag.trainingCount !== 1
													? "s"
													: ""}
											</span>
										</div>
									</TableCell>
									{canManageTags && (
										<TableCell>
											<div className="flex space-x-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														onEditTag(tag)
													}
												>
													<Edit className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													onClick={() =>
														handleDeleteClick(tag)
													}
													className="text-red-500 hover:text-red-700"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									)}
								</TableRow>
							))}
						</TableBody>
					</Table>

					{/* Modal de confirmation de suppression */}
					{tagToDelete && (
						<ConfirmationModal
							title="Supprimer le tag"
							message={`Êtes-vous sûr de vouloir supprimer le tag "${tagToDelete.name}" ? Cette action est irréversible.`}
							isVisible={!!tagToDelete}
							onConfirm={confirmDelete}
							onCancel={() => setTagToDelete(null)}
							confirmText="Supprimer"
							cancelText="Annuler"
							isDanger={true}
						/>
					)}
				</>
			)}
		</div>
	);
}
