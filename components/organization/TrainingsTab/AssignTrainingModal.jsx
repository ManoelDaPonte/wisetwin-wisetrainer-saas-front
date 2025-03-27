// components/organization/AssignTrainingModal.jsx
import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Search, Users, BookOpen } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

export default function AssignTrainingModal({
	isOpen,
	onClose,
	onSubmit,
	availableTrainings = [],
	organizationGroups = [],
}) {
	const [formData, setFormData] = useState({
		trainingId: "",
		groupIds: [],
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

	// Réinitialiser le formulaire quand la modal s'ouvre
	useEffect(() => {
		if (isOpen) {
			setFormData({
				trainingId: "",
				groupIds: [],
			});
			setSearchTerm("");
			setErrors({});
		}
	}, [isOpen]);

	// Filtrer les formations basées sur le terme de recherche
	const filteredTrainings = availableTrainings.filter((training) => {
		return (
			training.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			training.description
				.toLowerCase()
				.includes(searchTerm.toLowerCase())
		);
	});

	const handleSelectTraining = (trainingId) => {
		setFormData((prev) => ({
			...prev,
			trainingId,
		}));

		// Clear error
		if (errors.trainingId) {
			setErrors((prev) => ({
				...prev,
				trainingId: null,
			}));
		}
	};

	const handleToggleGroup = (groupId) => {
		setFormData((prev) => {
			const newGroupIds = prev.groupIds.includes(groupId)
				? prev.groupIds.filter((id) => id !== groupId)
				: [...prev.groupIds, groupId];

			return {
				...prev,
				groupIds: newGroupIds,
			};
		});

		// Clear error
		if (errors.groupIds) {
			setErrors((prev) => ({
				...prev,
				groupIds: null,
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.trainingId) {
			newErrors.trainingId = "Veuillez sélectionner une formation";
		}

		if (formData.groupIds.length === 0) {
			newErrors.groupIds = "Veuillez sélectionner au moins un groupe";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			setIsSubmitting(true);
			await onSubmit(formData);
			// Le parent va gérer la fermeture de la modal
		} catch (error) {
			console.error(
				"Erreur lors de l'assignation de la formation:",
				error
			);
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setFormData({
			trainingId: "",
			groupIds: [],
		});
		setSearchTerm("");
		setErrors({});
		setIsSubmitting(false);
		onClose();
	};

	// Trouver la formation sélectionnée
	const selectedTraining = availableTrainings.find(
		(t) => t.id === formData.trainingId
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<GraduationCap className="w-5 h-5" />
						Assigner une formation
					</DialogTitle>
					<DialogDescription>
						Sélectionnez une formation et assignez-la à un ou
						plusieurs groupes
					</DialogDescription>
				</DialogHeader>

				<div className="py-4 space-y-6">
					{/* Étape 1: Sélectionner une formation */}
					<div>
						<h3 className="text-sm font-medium mb-2 flex items-center">
							<BookOpen className="w-4 h-4 mr-1" />
							1. Sélectionner une formation
						</h3>

						<div className="relative mb-2">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<Input
								placeholder="Rechercher une formation..."
								className="pl-10"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div className="border rounded-md max-h-[200px] overflow-y-auto">
							{filteredTrainings.length === 0 ? (
								<div className="p-4 text-center text-gray-500">
									Aucune formation ne correspond à votre
									recherche
								</div>
							) : (
								filteredTrainings.map((training) => (
									<div
										key={training.id}
										className={`flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
											formData.trainingId === training.id
												? "bg-blue-50 dark:bg-blue-900/20"
												: ""
										}`}
										onClick={() =>
											handleSelectTraining(training.id)
										}
									>
										<div className="relative w-12 h-12 rounded overflow-hidden mr-3">
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
										<div className="flex-1">
											<div className="font-medium">
												{training.name}
											</div>
											<div className="text-xs text-gray-500 line-clamp-1">
												{training.description}
											</div>
										</div>
									</div>
								))
							)}
						</div>

						{errors.trainingId && (
							<p className="text-sm text-red-500 mt-1">
								{errors.trainingId}
							</p>
						)}
					</div>

					{/* Étape 2: Sélectionner les groupes */}
					<div>
						<h3 className="text-sm font-medium mb-2 flex items-center">
							<Users className="w-4 h-4 mr-1" />
							2. Sélectionner les groupes
						</h3>

						<div className="border rounded-md overflow-hidden">
							{organizationGroups.length === 0 ? (
								<div className="p-4 text-center text-gray-500">
									Aucun groupe disponible. Veuillez d'abord
									créer un groupe.
								</div>
							) : (
								organizationGroups.map((group) => (
									<div
										key={group.id}
										className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
									>
										<Checkbox
											id={`group-${group.id}`}
											checked={formData.groupIds.includes(
												group.id
											)}
											onCheckedChange={() =>
												handleToggleGroup(group.id)
											}
											className="mr-3"
										/>
										<Label
											htmlFor={`group-${group.id}`}
											className="flex items-center justify-between w-full cursor-pointer"
										>
											<div>
												<div className="font-medium">
													{group.name}
												</div>
												<div className="text-xs text-gray-500">
													{group.memberCount} membres
												</div>
											</div>
										</Label>
									</div>
								))
							)}
						</div>

						{errors.groupIds && (
							<p className="text-sm text-red-500 mt-1">
								{errors.groupIds}
							</p>
						)}
					</div>

					{/* Résumé */}
					{selectedTraining && formData.groupIds.length > 0 && (
						<div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
							<h3 className="text-sm font-medium mb-2">
								Résumé de l'assignation
							</h3>
							<p className="text-sm">
								La formation{" "}
								<strong>{selectedTraining.name}</strong> sera
								assignée à {formData.groupIds.length} groupe(s)
							</p>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Annuler
					</Button>
					<Button
						type="button"
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
						onClick={handleSubmit}
						disabled={
							isSubmitting ||
							!formData.trainingId ||
							formData.groupIds.length === 0
						}
					>
						{isSubmitting
							? "Assignation..."
							: "Assigner la formation"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
