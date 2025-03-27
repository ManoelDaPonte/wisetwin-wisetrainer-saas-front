// components/organization/TrainingsTab.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	PlusCircle,
	BookOpen,
	UserPlus,
	Users,
	Trash2,
	Edit,
	GraduationCap,
	AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useToast } from "@/lib/hooks/useToast";
import CreateGroupModal from "@/components/organization/TrainingsTab/CreateGroupModal";
import AssignMembersToGroupModal from "@/components/organization/TrainingsTab/AssignMembersToGroupModal";
import AssignTrainingModal from "@/components/organization/TrainingsTab/AssignTrainingModal";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function TrainingsTab({ organization }) {
	const { toast } = useToast();
	const [activeSubTab, setActiveSubTab] = useState("trainings");
	const [isLoading, setIsLoading] = useState(true);

	// États pour les groupes et formations
	const [groups, setGroups] = useState([
		{
			id: "1",
			name: "Groupe A",
			description: "Personnel de production",
			memberCount: 12,
		},
		{
			id: "2",
			name: "Groupe B",
			description: "Équipe de sécurité",
			memberCount: 8,
		},
	]);

	const [trainings, setTrainings] = useState([
		{
			id: "training1",
			name: "Sécurité industrielle",
			description: "Formation sur les protocoles de sécurité",
			imageUrl: "/images/png/wisetrainer-01.png",
			assignedGroups: ["1"],
			status: "active",
		},
		{
			id: "training2",
			name: "Prévention sur ligne de production",
			description:
				"Formation sur les risques en environnement de production",
			imageUrl: "/images/png/wisetrainer-02.png",
			assignedGroups: ["1", "2"],
			status: "active",
		},
	]);

	// État pour les formations disponibles
	const [availableTrainings, setAvailableTrainings] = useState([
		{
			id: "training1",
			name: "Sécurité industrielle",
			description: "Formation sur les protocoles de sécurité",
			imageUrl: "/images/png/wisetrainer-01.png",
		},
		{
			id: "training2",
			name: "Prévention sur ligne de production",
			description:
				"Formation sur les risques en environnement de production",
			imageUrl: "/images/png/wisetrainer-02.png",
		},
		{
			id: "training3",
			name: "Sécurité et prévention des machines industrielles",
			description:
				"Formation sur les risques en environnement industriel extérieur",
			imageUrl: "/images/png/Image_ChemicalPlantDemo.png",
		},
	]);

	// États pour les modaux
	const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
	const [showAssignMembersModal, setShowAssignMembersModal] = useState(false);
	const [showAssignTrainingModal, setShowAssignTrainingModal] =
		useState(false);
	const [confirmationModal, setConfirmationModal] = useState({
		isOpen: false,
		type: null,
		itemId: null,
		title: "",
		message: "",
	});

	// État pour l'élément sélectionné
	const [selectedGroup, setSelectedGroup] = useState(null);

	// Effet pour charger les données initiales
	useEffect(() => {
		if (organization) {
			fetchGroupsAndTrainings();
		}
	}, [organization]);

	// Fonction pour récupérer les groupes et formations
	const fetchGroupsAndTrainings = async () => {
		setIsLoading(true);
		try {
			// Cette partie serait remplacée par des appels API réels
			// Pour cette démo, nous utilisons les données statiques déjà définies

			// Simuler un délai de chargement
			await new Promise((resolve) => setTimeout(resolve, 500));

			setIsLoading(false);
		} catch (error) {
			console.error("Erreur lors du chargement des données:", error);
			toast({
				title: "Erreur",
				description: "Impossible de charger les groupes et formations",
				variant: "destructive",
			});
			setIsLoading(false);
		}
	};

	// Gestionnaires d'événements pour les actions

	// Créer un nouveau groupe
	const handleCreateGroup = async (groupData) => {
		try {
			// Simulation d'un appel API
			console.log("Création d'un groupe:", groupData);

			// Ajouter le nouveau groupe à la liste
			const newGroup = {
				id: `group_${Date.now()}`,
				name: groupData.name,
				description: groupData.description || "",
				memberCount: 0,
			};

			setGroups((prev) => [...prev, newGroup]);

			setShowCreateGroupModal(false);

			toast({
				title: "Groupe créé",
				description: `Le groupe "${groupData.name}" a été créé avec succès`,
				variant: "success",
			});
		} catch (error) {
			console.error("Erreur lors de la création du groupe:", error);
			toast({
				title: "Erreur",
				description: "Impossible de créer le groupe",
				variant: "destructive",
			});
		}
	};

	// Assigner des membres à un groupe
	const handleAssignMembers = async (assignData) => {
		try {
			// Simulation d'un appel API
			console.log("Assignation de membres:", assignData);

			// Mettre à jour le nombre de membres du groupe
			setGroups((prev) =>
				prev.map((group) => {
					if (group.id === assignData.groupId) {
						return {
							...group,
							memberCount: assignData.memberIds.length,
						};
					}
					return group;
				})
			);

			setShowAssignMembersModal(false);

			toast({
				title: "Membres assignés",
				description: `${assignData.memberIds.length} membres ont été assignés au groupe`,
				variant: "success",
			});
		} catch (error) {
			console.error("Erreur lors de l'assignation des membres:", error);
			toast({
				title: "Erreur",
				description: "Impossible d'assigner les membres au groupe",
				variant: "destructive",
			});
		}
	};

	// Assigner une formation
	const handleAssignTraining = async (assignData) => {
		try {
			// Simulation d'un appel API
			console.log("Assignation d'une formation:", assignData);

			// Vérifier si la formation est déjà dans la liste
			const trainingExists = trainings.some(
				(t) => t.id === assignData.trainingId
			);

			if (trainingExists) {
				// Mettre à jour les groupes assignés
				setTrainings((prev) =>
					prev.map((training) => {
						if (training.id === assignData.trainingId) {
							return {
								...training,
								assignedGroups: Array.from(
									new Set([
										...training.assignedGroups,
										...assignData.groupIds,
									])
								),
							};
						}
						return training;
					})
				);
			} else {
				// Ajouter une nouvelle formation
				const newTraining = availableTrainings.find(
					(t) => t.id === assignData.trainingId
				);
				if (newTraining) {
					setTrainings((prev) => [
						...prev,
						{
							...newTraining,
							assignedGroups: assignData.groupIds,
							status: "active",
						},
					]);
				}
			}

			setShowAssignTrainingModal(false);

			toast({
				title: "Formation assignée",
				description: `La formation a été assignée à ${assignData.groupIds.length} groupe(s)`,
				variant: "success",
			});
		} catch (error) {
			console.error(
				"Erreur lors de l'assignation de la formation:",
				error
			);
			toast({
				title: "Erreur",
				description: "Impossible d'assigner la formation",
				variant: "destructive",
			});
		}
	};

	// Supprimer un groupe
	const handleDeleteGroup = (groupId) => {
		setConfirmationModal({
			isOpen: true,
			type: "deleteGroup",
			itemId: groupId,
			title: "Supprimer le groupe",
			message:
				"Êtes-vous sûr de vouloir supprimer ce groupe? Cette action est irréversible et supprimera également les assignations de formations associées.",
		});
	};

	// Supprimer une formation
	const handleDeleteTraining = (trainingId) => {
		setConfirmationModal({
			isOpen: true,
			type: "deleteTraining",
			itemId: trainingId,
			title: "Supprimer la formation",
			message:
				"Êtes-vous sûr de vouloir supprimer cette formation de l'organisation? Les membres n'y auront plus accès.",
		});
	};

	// Confirmer la suppression
	const handleConfirmDelete = async () => {
		try {
			const { type, itemId } = confirmationModal;

			if (type === "deleteGroup") {
				// Supprimer le groupe
				setGroups((prev) =>
					prev.filter((group) => group.id !== itemId)
				);

				// Mettre à jour les formations pour retirer ce groupe
				setTrainings((prev) =>
					prev.map((training) => ({
						...training,
						assignedGroups: training.assignedGroups.filter(
							(id) => id !== itemId
						),
					}))
				);

				toast({
					title: "Groupe supprimé",
					description: "Le groupe a été supprimé avec succès",
					variant: "success",
				});
			} else if (type === "deleteTraining") {
				// Supprimer la formation
				setTrainings((prev) =>
					prev.filter((training) => training.id !== itemId)
				);

				toast({
					title: "Formation supprimée",
					description: "La formation a été supprimée avec succès",
					variant: "success",
				});
			}

			setConfirmationModal({
				isOpen: false,
				type: null,
				itemId: null,
				title: "",
				message: "",
			});
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			toast({
				title: "Erreur",
				description: "Une erreur est survenue lors de la suppression",
				variant: "destructive",
			});
		}
	};

	// Afficher le mode édition d'un groupe
	const handleEditGroup = (group) => {
		setSelectedGroup(group);
		// Implémenter plus tard
		toast({
			title: "Information",
			description:
				"La fonction d'édition des groupes sera disponible prochainement",
			variant: "info",
		});
	};

	// Ouvrir le modal d'ajout de membres
	const handleOpenAddMembers = (group) => {
		setSelectedGroup(group);
		setShowAssignMembersModal(true);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>Gestion des formations</CardTitle>
					<CardDescription>
						Gérez les formations et les groupes de votre
						organisation
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent>
				<Tabs
					defaultValue="trainings"
					value={activeSubTab}
					onValueChange={setActiveSubTab}
					className="w-full"
				>
					<TabsList className="mb-6">
						<TabsTrigger value="trainings" className="px-6">
							<GraduationCap className="w-4 h-4 mr-2" />
							Formations
						</TabsTrigger>
						<TabsTrigger value="groups" className="px-6">
							<Users className="w-4 h-4 mr-2" />
							Groupes
						</TabsTrigger>
					</TabsList>

					<TabsContent value="trainings">
						<div className="flex justify-end mb-4">
							<Button
								onClick={() => setShowAssignTrainingModal(true)}
							>
								<PlusCircle className="w-4 h-4 mr-2" />
								Assigner une formation
							</Button>
						</div>

						{isLoading ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{[1, 2].map((i) => (
									<div
										key={i}
										className="border rounded-lg overflow-hidden animate-pulse"
									>
										<div className="flex">
											<div className="w-24 h-24 bg-gray-200 dark:bg-gray-700"></div>
											<div className="p-4 flex-1">
												<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
												<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
												<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
											</div>
										</div>
									</div>
								))}
							</div>
						) : trainings.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-md">
								<BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium mb-2">
									Aucune formation assignée
								</h3>
								<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
									Vous n'avez pas encore assigné de formations
									à votre organisation. Commencez par en
									ajouter une.
								</p>
								<Button
									onClick={() =>
										setShowAssignTrainingModal(true)
									}
								>
									<PlusCircle className="w-4 h-4 mr-2" />
									Ajouter une formation
								</Button>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{trainings.map((training) => (
									<div
										key={training.id}
										className="border rounded-lg overflow-hidden hover:border-wisetwin-blue transition-all"
									>
										<div className="flex">
											<div className="relative w-24 h-24">
												<Image
													src={
														training.imageUrl ||
														"/images/png/placeholder.png"
													}
													alt={training.name}
													fill
													className="object-cover"
													onError={(e) => {
														e.target.src =
															"/images/png/placeholder.png";
													}}
												/>
											</div>
											<div className="p-4 flex-1">
												<div className="flex justify-between items-start">
													<h3 className="font-medium truncate">
														{training.name}
													</h3>
													<Badge
														className={
															training.status ===
															"active"
																? "bg-green-100 text-green-800"
																: "bg-gray-100 text-gray-800"
														}
													>
														{training.status ===
														"active"
															? "Active"
															: "Inactive"}
													</Badge>
												</div>
												<p className="text-sm text-gray-500 dark:text-gray-400 my-1 line-clamp-2">
													{training.description}
												</p>
												<div className="flex items-center justify-between mt-2">
													<div className="text-xs text-gray-500 dark:text-gray-400">
														Assignée à{" "}
														{
															training
																.assignedGroups
																.length
														}{" "}
														groupe(s)
													</div>
													<div className="flex gap-2">
														<Button
															variant="ghost"
															size="sm"
															className="h-7 px-2"
														>
															<Edit className="w-3.5 h-3.5" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="h-7 px-2 text-red-500 hover:text-red-700"
															onClick={() =>
																handleDeleteTraining(
																	training.id
																)
															}
														>
															<Trash2 className="w-3.5 h-3.5" />
														</Button>
													</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>

					<TabsContent value="groups">
						<div className="flex justify-end mb-4">
							<Button
								onClick={() => setShowCreateGroupModal(true)}
							>
								<PlusCircle className="w-4 h-4 mr-2" />
								Créer un groupe
							</Button>
						</div>

						{isLoading ? (
							<div className="grid grid-cols-1 gap-4">
								{[1, 2].map((i) => (
									<div
										key={i}
										className="border rounded-lg p-4 animate-pulse"
									>
										<div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
										<div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
										<div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
									</div>
								))}
							</div>
						) : groups.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-md">
								<Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-medium mb-2">
									Aucun groupe créé
								</h3>
								<p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
									Vous n'avez pas encore créé de groupes pour
									organiser vos membres. Commencez par en
									créer un.
								</p>
								<Button
									onClick={() =>
										setShowCreateGroupModal(true)
									}
								>
									<PlusCircle className="w-4 h-4 mr-2" />
									Créer un groupe
								</Button>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4">
								{groups.map((group) => (
									<div
										key={group.id}
										className="border rounded-lg p-4 hover:border-wisetwin-blue transition-all"
									>
										<div className="flex justify-between items-start">
											<div>
												<h3 className="font-medium">
													{group.name}
												</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
													{group.description}
												</p>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleOpenAddMembers(
															group
														)
													}
												>
													<UserPlus className="w-4 h-4 mr-2" />
													Ajouter des membres
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() =>
														handleEditGroup(group)
													}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="text-red-500 hover:text-red-700"
													onClick={() =>
														handleDeleteGroup(
															group.id
														)
													}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
										<div className="mt-3 text-sm text-gray-500 dark:text-gray-400 flex items-center">
											<Users className="w-4 h-4 mr-1" />
											{group.memberCount} membres
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>

			{/* Modaux */}
			{showCreateGroupModal && (
				<CreateGroupModal
					isOpen={showCreateGroupModal}
					onClose={() => setShowCreateGroupModal(false)}
					onSubmit={handleCreateGroup}
				/>
			)}

			{showAssignMembersModal && selectedGroup && (
				<AssignMembersToGroupModal
					isOpen={showAssignMembersModal}
					onClose={() => {
						setShowAssignMembersModal(false);
						setSelectedGroup(null);
					}}
					onSubmit={handleAssignMembers}
					group={selectedGroup}
					organizationMembers={organization?.members || []}
					currentGroupMembers={[]} // À implémenter: récupérer les membres actuels du groupe
				/>
			)}

			{showAssignTrainingModal && (
				<AssignTrainingModal
					isOpen={showAssignTrainingModal}
					onClose={() => setShowAssignTrainingModal(false)}
					onSubmit={handleAssignTraining}
					availableTrainings={availableTrainings}
					organizationGroups={groups}
				/>
			)}

			{/* Modal de confirmation pour les suppressions */}
			{confirmationModal.isOpen && (
				<ConfirmationModal
					title={confirmationModal.title}
					message={confirmationModal.message}
					isVisible={confirmationModal.isOpen}
					onConfirm={handleConfirmDelete}
					onCancel={() =>
						setConfirmationModal({
							isOpen: false,
							type: null,
							itemId: null,
							title: "",
							message: "",
						})
					}
					confirmText="Supprimer"
					cancelText="Annuler"
					isDanger={true}
				/>
			)}
		</Card>
	);
}
