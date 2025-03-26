// components/organization/CreateOrganizationModal.jsx
import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";

export default function CreateOrganizationModal({ isOpen, onClose, onSubmit }) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		logoUrl: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState({});

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
			await onSubmit(formData);
			// La fonction onSubmit est censée gérer la fermeture du modal et les notifications
		} catch (error) {
			console.error("Erreur lors de la création:", error);
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setFormData({
			name: "",
			description: "",
			logoUrl: "",
		});
		setErrors({});
		setIsSubmitting(false);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>
							Créer une nouvelle organisation
						</DialogTitle>
						<DialogDescription>
							Remplissez les informations ci-dessous pour créer
							votre organisation. Vous serez automatiquement
							désigné comme propriétaire.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
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
							type="submit"
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
							disabled={isSubmitting}
						>
							{isSubmitting
								? "Création..."
								: "Créer l'organisation"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
