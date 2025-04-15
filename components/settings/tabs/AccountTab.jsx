// components/settings/tabs/AccountTab.jsx
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, User, Mail, Edit, Save } from "lucide-react";
import Image from "next/image";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { Badge } from "@/components/ui/badge";

export default function AccountTab() {
	const { user } = useUser();
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
		useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSaveProfile = async () => {
		// Ici, on simulerait l'enregistrement des données du profil
		console.log("Saving profile data:", formData);
		setIsEditing(false);
		// Afficher une notification de succès
	};

	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-medium mb-5">
					Informations personnelles
				</h3>

				<div className="flex flex-col md:flex-row gap-8">
					{/* Photo de profil */}
					<div className="flex flex-col items-center space-y-3">
						<div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-800">
							{user?.picture ? (
								<Image
									src={user.picture}
									alt="Photo de profil"
									fill
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
									<User className="w-16 h-16 text-gray-400" />
								</div>
							)}
						</div>
						<Button variant="outline" size="sm">
							Changer la photo
						</Button>
					</div>

					{/* Formulaire d'informations */}
					<div className="flex-grow space-y-4">
						<div className="flex justify-between items-center">
							<h4 className="text-md font-medium">
								Détails du profil
							</h4>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsEditing(!isEditing)}
								className="flex items-center gap-1"
							>
								{isEditing ? (
									<>
										<Save className="w-4 h-4" />
										Enregistrer
									</>
								) : (
									<>
										<Edit className="w-4 h-4" />
										Modifier
									</>
								)}
							</Button>
						</div>

						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Nom complet</Label>
								<Input
									id="name"
									name="name"
									value={formData.name}
									onChange={handleChange}
									disabled={!isEditing}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Adresse e-mail</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleChange}
									disabled={!isEditing}
								/>
								<p className="text-xs text-muted-foreground">
									Cette adresse est utilisée pour vous
									connecter et recevoir des notifications.
								</p>
							</div>

							{isEditing && (
								<div className="pt-4">
									<Button
										onClick={handleSaveProfile}
										className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
									>
										Enregistrer les modifications
									</Button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Section de suppression du compte */}
			<div className="border-t pt-6">
				<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
					<div className="flex items-start">
						<AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
						<div>
							<h3 className="text-lg font-medium text-red-800 dark:text-red-300">
								Supprimer mon compte
							</h3>
							<p className="mt-1 text-sm text-red-700 dark:text-red-300">
								La suppression de votre compte est permanente et
								irréversible. Toutes vos données personnelles
								seront supprimées.
							</p>
							<div className="mt-4">
								<Button
									variant="destructive"
									onClick={() =>
										setIsConfirmationModalOpen(true)
									}
								>
									Supprimer mon compte
								</Button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Modal de confirmation pour la suppression du compte */}
			<ConfirmationModal
				title="Confirmer la suppression"
				message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues."
				isVisible={isConfirmationModalOpen}
				onConfirm={() => {
					// Action de suppression du compte ici
					console.log("Account deletion confirmed");
					setIsConfirmationModalOpen(false);
				}}
				onCancel={() => setIsConfirmationModalOpen(false)}
				confirmText="Supprimer définitivement"
				cancelText="Annuler"
				isDanger={true}
			/>
		</div>
	);
}
