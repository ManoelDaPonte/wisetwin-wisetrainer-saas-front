// components/organization/TrainingsTab.jsx
import React, { useState } from "react";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

export default function TrainingsTab({ organization }) {
	const [activeSubTab, setActiveSubTab] = useState("trainings");

	// État pour les groupes et formations (à remplacer plus tard par des données réelles)
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

	// Pour l'interface de démo, nous allons simplement montrer les éléments statiques
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
							<Button>
								<PlusCircle className="w-4 h-4 mr-2" />
								Assigner une formation
							</Button>
						</div>

						{trainings.length === 0 ? (
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
								<Button>
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
							<Button>
								<PlusCircle className="w-4 h-4 mr-2" />
								Créer un groupe
							</Button>
						</div>

						{groups.length === 0 ? (
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
								<Button>
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
												>
													<UserPlus className="w-4 h-4 mr-2" />
													Ajouter des membres
												</Button>
												<Button
													variant="ghost"
													size="sm"
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													size="sm"
													className="text-red-500 hover:text-red-700"
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
		</Card>
	);
}
