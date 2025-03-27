// components/organization/CreateGroupModal.jsx
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
import { Users } from "lucide-react";

export default function CreateGroupModal({ isOpen, onClose, onSubmit }) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
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
			newErrors.name = "Le nom du groupe est requis";
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
			// Le parent va gérer la fermeture de la modal
		} catch (error) {
			console.error("Erreur lors de la création du groupe:", error);
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setFormData({
			name: "",
			description: "",
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
						<DialogTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							Créer un nouveau groupe
						</DialogTitle>
						<DialogDescription>
							Créez un groupe pour organiser les membres de votre
							organisation et leur assigner des formations
							spécifiques.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">
								Nom du groupe{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Ex: Équipe de production, Sécurité, etc."
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
								placeholder="Description des membres ou de la fonction de ce groupe (optionnel)"
								rows={3}
							/>
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
							{isSubmitting ? "Création..." : "Créer le groupe"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
