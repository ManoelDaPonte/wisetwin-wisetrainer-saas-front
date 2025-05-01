// components/organization/OrganizationSettingsForm.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

export default function OrganizationSettingsForm({
	organization,
	onSave,
	onDelete,
}) {
	const [formData, setFormData] = useState({
		name: organization?.name || "",
		description: organization?.description || "",
		logoUrl: organization?.logoUrl || "",
	});
	const [errors, setErrors] = useState({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when user types
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: null,
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Le nom de l'organisation est requis";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		try {
			setIsSubmitting(true);
			await onSave(formData);
			setIsSubmitting(false);
		} catch (error) {
			console.error("Erreur lors de la sauvegarde:", error);
			setIsSubmitting(false);
		}
	};

	const handleDeleteConfirm = async () => {
		try {
			if (onDelete) {
				await onDelete();
			}
			setShowDeleteModal(false);
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			setShowDeleteModal(false);
		}
	};

	// Vérifier si l'utilisateur est le propriétaire (seul le propriétaire peut supprimer l'organisation)
	const isOwner = organization?.userRole === "OWNER";

	return (
		<div>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">
							Nom de l'organisation{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Entrez le nom de l'organisation"
							className={errors.name ? "border-red-500" : ""}
						/>
						{errors.name && (
							<p className="text-sm text-red-500">
								{errors.name}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Décrivez votre organisation (optionnel)"
							rows={3}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="logoUrl">URL du logo</Label>
						<Input
							id="logoUrl"
							name="logoUrl"
							value={formData.logoUrl}
							onChange={handleChange}
							placeholder="https://exemple.com/logo.png (optionnel)"
						/>
						<p className="text-xs text-gray-500">
							Laissez vide pour utiliser une lettre par défaut
						</p>
					</div>
				</div>

				<div className="flex justify-end">
					<Button
						type="submit"
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
						disabled={isSubmitting}
					>
						{isSubmitting
							? "Enregistrement..."
							: "Enregistrer les modifications"}
					</Button>
				</div>
			</form>

			{/* Section de suppression de l'organisation */}
			{isOwner && (
				<div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
						<div className="flex items-start">
							<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
							<div>
								<h3 className="text-lg font-medium text-red-800 dark:text-red-300">
									Zone dangereuse
								</h3>
								<p className="mt-1 text-sm text-red-700 dark:text-red-300">
									La suppression d'une organisation est
									permanente et irréversible. Toutes les
									données associées seront perdues.
								</p>
								<div className="mt-4">
									<Button
										variant="destructive"
										onClick={() => setShowDeleteModal(true)}
									>
										Supprimer l'organisation
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Modal de confirmation de suppression */}
			{showDeleteModal && (
				<ConfirmationModal
					title="Supprimer l'organisation"
					message={`Êtes-vous absolument sûr de vouloir supprimer l'organisation "${organization.name}" ? Cette action est irréversible et toutes les données seront perdues.`}
					isVisible={showDeleteModal}
					onConfirm={handleDeleteConfirm}
					onCancel={() => setShowDeleteModal(false)}
					confirmText="Supprimer définitivement"
					cancelText="Annuler"
					isDanger={true}
				/>
			)}
		</div>
	);
}
