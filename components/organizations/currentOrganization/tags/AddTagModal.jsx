//components/organizations/organization/tags/AddTagModal.jsx
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
import { Textarea } from "@/components/ui/textarea";
import { Tag } from "lucide-react";

// Couleurs prédéfinies pour les tags
const predefinedColors = [
	"#3B82F6", // Bleu
	"#10B981", // Vert
	"#F59E0B", // Jaune
	"#EF4444", // Rouge
	"#8B5CF6", // Violet
	"#EC4899", // Rose
	"#6B7280", // Gris
	"#000000", // Noir
];

export default function AddTagModal({ isOpen, onClose, onSubmit, tag = null }) {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		color: "#3B82F6",
	});
	const [errors, setErrors] = useState({});

	// Si un tag est fourni pour l'édition, initialiser le formulaire avec ses valeurs
	useEffect(() => {
		if (tag) {
			setFormData({
				id: tag.id,
				name: tag.name || "",
				description: tag.description || "",
				color: tag.color || "#3B82F6",
			});
		}
	}, [tag]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Effacer l'erreur quand l'utilisateur modifie le champ
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const handleColorSelect = (color) => {
		setFormData((prev) => ({ ...prev, color }));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.name.trim()) {
			newErrors.name = "Le nom du tag est requis";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		onSubmit(formData);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Tag className="w-5 h-5" />
							{tag ? "Modifier le tag" : "Ajouter un tag"}
						</DialogTitle>
						<DialogDescription>
							{tag
								? "Modifiez les informations du tag"
								: "Créez un nouveau tag pour votre organisation"}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">
								Nom du tag{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="ex: Technicien, Commercial, RH..."
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
								placeholder="Description du tag (optionnel)"
								rows={3}
							/>
						</div>

						<div className="space-y-2">
							<Label>Couleur</Label>
							<div className="flex flex-wrap gap-2">
								{predefinedColors.map((color) => (
									<button
										key={color}
										type="button"
										className={`w-8 h-8 rounded-full border-2 ${
											formData.color === color
												? "border-black dark:border-white"
												: "border-transparent"
										}`}
										style={{ backgroundColor: color }}
										onClick={() => handleColorSelect(color)}
									/>
								))}
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
						>
							{tag ? "Enregistrer" : "Ajouter"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
