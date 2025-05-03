// components/wisetrainer/tabs/CatalogueOrganizations.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Clock,
	BookOpen,
	BadgeCheck,
	InfoIcon,
	RotateCcw,
	Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export default function CatalogueOrganizations({
	organizations,
	selectedOrganizationId,
	onSelectOrganization,
	formations,
	isLoading,
	isUserEnrolled,
	onEnroll,
	onToggleInfo,
	flippedCardId,
	containerVariants,
	itemVariants,
}) {
	// Fonction pour formater la durée (minutes -> heures et minutes)
	const formatDuration = (minutes) => {
		if (!minutes) return "Durée non spécifiée";

		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;

		if (hours === 0) return `${mins} min`;
		if (mins === 0) return `${hours} h`;
		return `${hours} h ${mins} min`;
	};

	// Afficher un message si aucune organisation n'est disponible
	if (!organizations || organizations.length === 0) {
		return (
			<motion.div
				className="text-center py-12"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
					<Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
					<h3 className="text-xl font-medium mb-2">
						Aucune organisation
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						Vous n'êtes membre d'aucune organisation pour le moment.
						Rejoignez une organisation pour accéder à ses formations
						exclusives.
					</p>
					<Button
						onClick={() =>
							(window.location.href = "/organizations")
						}
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
					>
						Gérer les organisations
					</Button>
				</div>
			</motion.div>
		);
	}

	// État de chargement pour le sélecteur d'organisation
	if (isLoading && organizations.length > 0) {
		return (
			<div>
				<div className="mb-6">
					<Select
						value={selectedOrganizationId}
						onValueChange={onSelectOrganization}
					>
						<SelectTrigger className="w-full max-w-md">
							<SelectValue placeholder="Sélectionner une organisation" />
						</SelectTrigger>
						<SelectContent>
							{organizations.map((org) => (
								<SelectItem key={org.id} value={org.id}>
									{org.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{[1, 2, 3, 4, 5, 6].map((item) => (
						<Card
							key={item}
							className="border border-gray-200 dark:border-gray-700"
						>
							<CardHeader className="pb-2">
								<Skeleton className="h-6 w-3/4 mb-2" />
								<Skeleton className="h-4 w-1/2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-32 w-full rounded-md mb-4" />
								<Skeleton className="h-4 w-3/4 mb-2" />
								<Skeleton className="h-4 w-1/2" />
							</CardContent>
							<CardFooter>
								<Skeleton className="h-10 w-full rounded-md" />
							</CardFooter>
						</Card>
					))}
				</div>
			</div>
		);
	}

	// Trouver l'organisation sélectionnée
	const selectedOrganization = organizations.find(
		(org) => org.id === selectedOrganizationId
	);

	return (
		<div>
			<div className="mb-6">
				<Select
					value={selectedOrganizationId}
					onValueChange={onSelectOrganization}
				>
					<SelectTrigger className="w-full max-w-md">
						<SelectValue placeholder="Sélectionner une organisation" />
					</SelectTrigger>
					<SelectContent>
						{organizations.map((org) => (
							<SelectItem key={org.id} value={org.id}>
								{org.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{selectedOrganization && (
				<div className="mb-6">
					<h2 className="text-lg font-medium mb-2">
						Formations de {selectedOrganization.name}
					</h2>
					{selectedOrganization.description && (
						<p className="text-gray-600 dark:text-gray-300 mb-4">
							{selectedOrganization.description}
						</p>
					)}

					{/* Afficher un séparateur */}
					<div className="border-t border-gray-200 dark:border-gray-700 pt-4"></div>
				</div>
			)}

			{/* Afficher un message si aucune formation n'est disponible pour l'organisation sélectionnée */}
			{selectedOrganizationId &&
				(!formations || formations.length === 0) &&
				!isLoading && (
					<motion.div
						className="text-center py-12"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
					>
						<div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto">
							<BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-xl font-medium mb-2">
								Aucune formation disponible
							</h3>
							<p className="text-gray-600 dark:text-gray-300 mb-6">
								L'organisation "{selectedOrganization?.name}"
								n'a pas encore publié de formations.
							</p>
						</div>
					</motion.div>
				)}

			{/* Afficher la liste des formations */}
			{selectedOrganizationId && formations && formations.length > 0 && (
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{formations.map((formation, index) => {
						const enrolled = isUserEnrolled(formation);
						const isFlipped = flippedCardId === formation.id;

						return (
							<motion.div
								key={`${formation.id}_${
									formation.source?.organizationId || ""
								}`}
								variants={itemVariants}
								custom={index}
							>
								<Card
									className={`h-full flex flex-col border-gray-200 dark:border-gray-700 ${
										enrolled
											? "border-green-300 dark:border-green-800"
											: "hover:border-wisetwin-blue dark:hover:border-wisetwin-blue"
									} transition-all duration-300`}
								>
									<div className="relative h-full flex flex-col">
										{/* Face avant (informations principales) */}
										<div
											className={`${
												isFlipped
													? "hidden"
													: "flex flex-col h-full"
											}`}
										>
											<CardHeader className="pb-2">
												<CardTitle className="text-lg font-semibold flex items-center justify-between">
													<span>
														{formation.name}
													</span>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0"
														onClick={(e) => {
															e.stopPropagation();
															onToggleInfo(
																formation.id
															);
														}}
													>
														<InfoIcon className="h-4 w-4" />
													</Button>
												</CardTitle>
												<div className="flex flex-wrap gap-2 mt-1">
													{formation.category && (
														<Badge
															variant="outline"
															className="text-xs bg-gray-100 dark:bg-gray-800 font-normal"
														>
															{formation.category}
														</Badge>
													)}
													{formation.source?.type ===
														"organization" && (
														<Badge className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-normal">
															{
																formation.source
																	.name
															}
														</Badge>
													)}
												</div>
											</CardHeader>

											<CardContent className="flex-grow">
												{/* Image ou placeholder */}
												<div className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-md h-32 flex items-center justify-center">
													{formation.imageUrl ? (
														<img
															src={
																formation.imageUrl
															}
															alt={formation.name}
															className="h-full w-full object-cover rounded-md"
														/>
													) : (
														<BookOpen className="h-12 w-12 text-gray-400" />
													)}
												</div>

												{/* Description courte */}
												<p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
													{formation.description ||
														"Aucune description disponible pour cette formation."}
												</p>

												{/* Détails */}
												<div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
													<div className="flex items-center">
														<Clock className="h-4 w-4 mr-2" />
														<span>
															{formatDuration(
																formation.duration
															)}
														</span>
													</div>
													{formation.certification && (
														<div className="flex items-center">
															<BadgeCheck className="h-4 w-4 mr-2 text-green-500" />
															<span>
																Certification
																disponible
															</span>
														</div>
													)}
												</div>
											</CardContent>

											<CardFooter className="pt-2 mt-auto">
												<Button
													className={`w-full ${
														enrolled
															? "bg-green-500 hover:bg-green-600 text-white"
															: "bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
													}`}
													onClick={() =>
														!enrolled &&
														onEnroll(formation)
													}
													disabled={enrolled}
												>
													{enrolled ? (
														<>
															<BadgeCheck className="mr-2 h-4 w-4" />
															Déjà inscrit
														</>
													) : (
														"S'inscrire"
													)}
												</Button>
											</CardFooter>
										</div>

										{/* Face arrière (détails) */}
										<div
											className={`${
												isFlipped
													? "flex flex-col h-full"
													: "hidden"
											}`}
										>
											<CardHeader className="pb-2">
												<CardTitle className="text-lg font-semibold flex items-center justify-between">
													<span>
														Détails du cours
													</span>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0"
														onClick={(e) => {
															e.stopPropagation();
															onToggleInfo(
																formation.id
															);
														}}
													>
														<RotateCcw className="h-4 w-4" />
													</Button>
												</CardTitle>
											</CardHeader>

											<CardContent className="flex-grow">
												{/* Contenu complet */}
												<div className="space-y-4">
													<div>
														<h4 className="text-sm font-medium mb-1">
															Description complète
														</h4>
														<p className="text-sm text-gray-600 dark:text-gray-300">
															{formation.description ||
																"Aucune description disponible."}
														</p>
													</div>

													{formation.objectives &&
														formation.objectives
															.length > 0 && (
															<div>
																<h4 className="text-sm font-medium mb-1">
																	Objectifs
																	pédagogiques
																</h4>
																<ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300 space-y-1">
																	{formation.objectives.map(
																		(
																			objective,
																			idx
																		) => (
																			<li
																				key={
																					idx
																				}
																			>
																				{
																					objective
																				}
																			</li>
																		)
																	)}
																</ul>
															</div>
														)}

													<div>
														<h4 className="text-sm font-medium mb-1">
															Informations
															complémentaires
														</h4>
														<div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
															<div className="flex justify-between">
																<span>
																	Organisation:
																</span>
																<span>
																	{formation
																		.source
																		?.name ||
																		"Non spécifiée"}
																</span>
															</div>
															<div className="flex justify-between">
																<span>
																	Durée
																	totale:
																</span>
																<span>
																	{formatDuration(
																		formation.duration
																	)}
																</span>
															</div>
															<div className="flex justify-between">
																<span>
																	Niveau:
																</span>
																<span>
																	{formation.level ||
																		"Non spécifié"}
																</span>
															</div>
															<div className="flex justify-between">
																<span>
																	Certification:
																</span>
																<span>
																	{formation.certification
																		? "Oui"
																		: "Non"}
																</span>
															</div>
														</div>
													</div>
												</div>
											</CardContent>

											<CardFooter className="pt-2 mt-auto">
												<Button
													className={`w-full ${
														enrolled
															? "bg-green-500 hover:bg-green-600 text-white"
															: "bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
													}`}
													onClick={() =>
														!enrolled &&
														onEnroll(formation)
													}
													disabled={enrolled}
												>
													{enrolled ? (
														<>
															<BadgeCheck className="mr-2 h-4 w-4" />
															Déjà inscrit
														</>
													) : (
														"S'inscrire"
													)}
												</Button>
											</CardFooter>
										</div>
									</div>
								</Card>
							</motion.div>
						);
					})}
				</motion.div>
			)}
		</div>
	);
}
