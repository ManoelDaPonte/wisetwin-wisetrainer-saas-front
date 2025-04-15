//components/organizations/organization/tags/TagsUserAssociations.jsx
import React, { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tag, RefreshCw, User, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export default function TagsUserAssociations({ organization }) {
	const [members, setMembers] = useState([]);
	const [tags, setTags] = useState([]);
	const [associations, setAssociations] = useState({});
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const { toast } = useToast();

	// Charger les utilisateurs et les tags
	useEffect(() => {
		fetchData();
	}, [organization.id]);

	const fetchData = async () => {
		try {
			setIsLoading(true);

			// Charger les tags
			const tagsResponse = await axios.get(
				`/api/organization/${organization.id}/tags`
			);

			// Charger les membres
			const membersResponse = await axios.get(
				`/api/organization/${organization.id}/members-with-tags`
			);

			const tagsList = tagsResponse.data.tags || [];
			const membersList = membersResponse.data.members || [];

			setTags(tagsList);
			setMembers(membersList);

			// Initialiser les associations à partir des données des membres
			const associationsMap = {};
			membersList.forEach((member) => {
				associationsMap[member.id] = (member.tags || []).map(
					(tag) => tag.id
				);
			});
			setAssociations(associationsMap);
		} catch (error) {
			console.error("Erreur lors du chargement des données:", error);
			toast({
				title: "Erreur",
				description: "Impossible de charger les données",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Gérer le changement d'association entre tag et utilisateur
	const handleTagAssociationChange = async (memberId, tagId, isChecked) => {
		try {
			setIsUpdating(true);

			// Mettre à jour l'état local d'abord pour une UX plus réactive
			const currentTags = associations[memberId] || [];
			let newTags;

			if (isChecked) {
				newTags = [...currentTags, tagId];
			} else {
				newTags = currentTags.filter((id) => id !== tagId);
			}

			setAssociations((prev) => ({
				...prev,
				[memberId]: newTags,
			}));

			// Envoyer les changements au serveur
			await axios.put(
				`/api/organization/${organization.id}/members/${memberId}/tags`,
				{ tagIds: newTags }
			);

			toast({
				title: "Tags mis à jour",
				description:
					"Les tags de l'utilisateur ont été mis à jour avec succès",
				variant: "success",
			});
		} catch (error) {
			console.error(
				"Erreur lors de la modification de l'association:",
				error
			);
			toast({
				title: "Erreur",
				description: "Impossible de modifier l'association",
				variant: "destructive",
			});

			// Restaurer l'état précédent en cas d'erreur
			fetchData();
		} finally {
			setIsUpdating(false);
		}
	};

	// Vérifier si un tag est associé à un utilisateur
	const isTagAssociated = (memberId, tagId) => {
		const memberTags = associations[memberId] || [];
		return memberTags.includes(tagId);
	};

	// Filtrer les membres par la recherche
	const filteredMembers = members.filter((member) => {
		if (!searchQuery.trim()) return true;

		const searchLower = searchQuery.toLowerCase();
		return (
			member.name?.toLowerCase().includes(searchLower) ||
			member.email?.toLowerCase().includes(searchLower)
		);
	});

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Association utilisateurs-tags</CardTitle>
					<CardDescription>Chargement...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="animate-pulse space-y-4">
						<div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4"></div>
						<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Association utilisateurs-tags</CardTitle>
					<CardDescription>
						Associez des tags spécifiques aux utilisateurs
					</CardDescription>
				</div>
				<Button
					variant="outline"
					onClick={fetchData}
					disabled={isUpdating}
				>
					<RefreshCw
						className={`w-4 h-4 mr-2 ${
							isUpdating ? "animate-spin" : ""
						}`}
					/>
					Actualiser
				</Button>
			</CardHeader>
			<CardContent>
				<div className="mb-4">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Rechercher un utilisateur..."
							className="pl-8"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				{members.length === 0 ? (
					<div className="text-center py-10">
						<p className="text-muted-foreground">
							Aucun utilisateur dans cette organisation
						</p>
					</div>
				) : tags.length === 0 ? (
					<div className="text-center py-10">
						<p className="text-muted-foreground">
							Aucun tag défini. Veuillez d'abord créer des tags.
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-1/3">
										Utilisateur
									</TableHead>
									{tags.map((tag) => (
										<TableHead
											key={tag.id}
											className="text-center"
										>
											<div className="flex flex-col items-center">
												<div
													className="w-4 h-4 rounded-full mb-1"
													style={{
														backgroundColor:
															tag.color,
													}}
												></div>
												<span>{tag.name}</span>
											</div>
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredMembers.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={tags.length + 1}
											className="text-center py-4"
										>
											Aucun utilisateur ne correspond à
											votre recherche
										</TableCell>
									</TableRow>
								) : (
									filteredMembers.map((member) => (
										<TableRow key={member.id}>
											<TableCell className="font-medium">
												<div className="flex flex-col">
													<span className="font-medium">
														{member.name}
													</span>
													<span className="text-sm text-muted-foreground">
														{member.email}
													</span>
												</div>
											</TableCell>
											{tags.map((tag) => (
												<TableCell
													key={tag.id}
													className="text-center"
												>
													<div>
														<Checkbox
															checked={isTagAssociated(
																member.id,
																tag.id
															)}
															onCheckedChange={(
																checked
															) =>
																handleTagAssociationChange(
																	member.id,
																	tag.id,
																	checked
																)
															}
															disabled={
																isUpdating
															}
														/>
													</div>
												</TableCell>
											))}
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
