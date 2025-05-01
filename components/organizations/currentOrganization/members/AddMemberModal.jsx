// components/organization/AddMemberModal.jsx
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

export default function AddMemberModal({ isOpen, onClose, onSubmit }) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("MEMBER");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);

	const validateEmail = (email) => {
		// Regex simple pour validation d'email
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Réinitialiser l'erreur
		setError(null);

		// Valider l'email
		if (!email.trim()) {
			setError("L'adresse email est requise");
			return;
		}

		if (!validateEmail(email)) {
			setError("Veuillez entrer une adresse email valide");
			return;
		}

		try {
			setIsSubmitting(true);
			await onSubmit({ email, role });
			// Réinitialiser le formulaire
			resetForm();
		} catch (error) {
			console.error("Erreur lors de l'ajout du membre:", error);
			setError(
				error.message ||
					"Une erreur est survenue lors de l'ajout du membre"
			);
			setIsSubmitting(false);
		}
	};

	const resetForm = () => {
		setEmail("");
		setRole("MEMBER");
		setError(null);
		setIsSubmitting(false);
	};

	const handleClose = () => {
		resetForm();
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<UserPlus className="w-5 h-5" />
							Ajouter un membre
						</DialogTitle>
						<DialogDescription>
							Invitez un nouvel utilisateur à rejoindre votre
							organisation en lui envoyant une invitation par
							email.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="email">
								Adresse email{" "}
								<span className="text-red-500">*</span>
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="exemple@domaine.com"
								className={error ? "border-red-500" : ""}
							/>
							{error && (
								<p className="text-sm text-red-500">{error}</p>
							)}
						</div>

						<div className="space-y-2">
							<Label htmlFor="role">Rôle</Label>
							<Select value={role} onValueChange={setRole}>
								<SelectTrigger id="role">
									<SelectValue placeholder="Sélectionner un rôle" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ADMIN">
										Administrateur
									</SelectItem>
									<SelectItem value="MEMBER">
										Membre
									</SelectItem>
								</SelectContent>
							</Select>
							<p className="text-xs text-gray-500">
								Les administrateurs peuvent gérer les membres
								mais ne peuvent pas supprimer l'organisation.
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
							{isSubmitting ? "Envoi en cours..." : "Inviter"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
