//components/organizations/organization/tags/TagsTrainingAssociations.jsx
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
import { Tag, RefreshCw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export default function TagsTrainingAssociations({ organization }) {
	const [trainings, setTrainings] = useState([]);
	const [tags, setTags] = useState([]);
	const [associations, setAssociations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUpdating, setIsUpdating] = useState(false);
	const { toast } = useToast();

	// Charger les formations et les tags
	useEffect(() => {
		fetchData();
	}, [organization.id]);

	const fetchData = async () => {
		try {
			setIsLoading(true);

			// Charger les formations
			const trainingsResponse = await axios.get(
				`/api/organization/${organization.id}/builds`
			);

			// Charger les tags
			const tagsResponse = await axios.get(
				`/api/organization/${organization.id}/tags`
			);

			// Charger les associations
			const associationsResponse = await axios.get(
				`/api/organization/${organization.id}/tags/training-associations`
			);

			const trainingsList = trainingsResponse.data.builds || [];
			const tagsList = tagsResponse.data.tags || [];
			const associationsList =
				associationsResponse.data.associations || [];

			console.log("Associations chargées:", associationsList);

			// Notification si un nettoyage automatique a été effectué
			if (associationsResponse.data.cleanupPerformed) {
				toast({
					title: "Nettoyage automatique",
					description: `${associationsResponse.data.cleanupCount} associations obsolètes ont été supprimées automatiquement`,
					variant: "info",
				});
			}

			setTrainings(trainingsList);
			setTags(tagsList);
			setAssociations(associationsList);
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

	// Gérer le changement d'association entre tag et formation
	const handleTagAssociationChange = async (
		trainingDbId,
		tagId,
		isChecked
	) => {
		try {
			setIsUpdating(true);

			if (isChecked) {
				// Ajouter l'association
				await axios.post(
					`/api/organization/${organization.id}/tags/${tagId}/training/${trainingDbId}`
				);

				// Mettre à jour l'état local des associations
				setAssociations([
					...associations,
					{
						tagId: tagId,
						courseId: trainingDbId,
					},
				]);

				toast({
					title: "Association ajoutée",
					description: "L'association a été créée avec succès",
					variant: "success",
				});
			} else {
				// Supprimer l'association
				await axios.delete(
					`/api/organization/${organization.id}/tags/${tagId}/training/${trainingDbId}`
				);

				// Mettre à jour l'état local des associations
				setAssociations(
					associations.filter(
						(a) =>
							!(a.tagId === tagId && a.courseId === trainingDbId)
					)
				);

				toast({
					title: "Association supprimée",
					description: "L'association a été supprimée avec succès",
					variant: "success",
				});
			}
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
		} finally {
			setIsUpdating(false);
		}
	};

	// Vérifier si un tag est associé à une formation
	const isTagAssociated = (trainingDbId, tagId) => {
		return associations.some(
			(a) => a.tagId === tagId && a.courseId === trainingDbId
		);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Association formations-tags</CardTitle>
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
					<CardTitle>Association formations-tags</CardTitle>
					<CardDescription>
						Associez des formations spécifiques à des tags
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
				{trainings.length === 0 ? (
					<div className="text-center py-10">
						<p className="text-muted-foreground">
							Aucune formation disponible pour cette organisation
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
										Formation
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
								{trainings.map((training) => (
									<TableRow
										key={training.dbId || training.id}
									>
										<TableCell className="font-medium">
											{training.name}
										</TableCell>
										{tags.map((tag) => (
											<TableCell
												key={tag.id}
												className="text-center"
											>
												<div>
													{" "}
													<Checkbox
														checked={isTagAssociated(
															training.dbId ||
																training.id,
															tag.id
														)}
														onCheckedChange={(
															checked
														) =>
															handleTagAssociationChange(
																training.dbId ||
																	training.id,
																tag.id,
																checked
															)
														}
														disabled={isUpdating}
													/>
												</div>
											</TableCell>
										))}
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}