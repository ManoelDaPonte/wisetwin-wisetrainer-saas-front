// components/settings/tabs/AccountTab.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/hooks/useUser"; // Notre hook personnalisé
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, User, Edit, Save, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSettings } from "@/lib/contexts/SettingsContext";
import { useRouter } from "next/navigation";
import { accountService } from "@/lib/services/accountService";

export default function AccountTab() {
	const { user, error: userError, updateUser, refreshUser } = useUser();
	const router = useRouter();
	const { refreshSettings } = useSettings();
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [isDeletingAccount, setIsDeletingAccount] = useState(false);
	const [saveStatus, setSaveStatus] = useState({
		type: "", // "success" ou "error"
		message: "",
	});

	// Mise à jour du state formData quand l'utilisateur est chargé
	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || "",
			});
		}
	}, [user]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Réinitialiser le statut quand l'utilisateur modifie le champ
		setSaveStatus({ type: "", message: "" });
	};

	const handleSaveProfile = async () => {
		// Validation
		if (!formData.name.trim()) {
			setSaveStatus({
				type: "error",
				message: "Le nom ne peut pas être vide",
			});
			return;
		}

		setIsLoading(true);
		setSaveStatus({ type: "", message: "" });

		try {
			// Utiliser notre hook updateUser pour mettre à jour le profil
			const result = await updateUser({ 
				name: formData.name.trim() 
			});

			if (!result.success) {
				throw new Error(result.error || "Une erreur est survenue");
			}

			// Mise à jour réussie
			setSaveStatus({
				type: "success",
				message: "Nom mis à jour avec succès",
			});
			
			setIsEditing(false);
			
			// Rafraîchir les informations du contexte
			refreshSettings();
			
			// Force refresh pour mettre à jour les informations utilisateur
			router.refresh();

			// Attendre 3 secondes avant de faire disparaître le message de succès
			setTimeout(() => {
				setSaveStatus({ type: "", message: "" });
			}, 3000);
		} catch (error) {
			console.error("Erreur lors de la mise à jour du nom:", error);
			setSaveStatus({
				type: "error",
				message:
					error.message ||
					"Une erreur est survenue lors de la mise à jour de votre nom",
			});
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Gère la suppression du compte utilisateur
	 */
	const handleDeleteAccount = async () => {
		try {
			setIsDeletingAccount(true);
			
			// Appeler le service de suppression de compte
			const result = await accountService.deleteAccount();
			
			if (!result.success) {
				throw new Error(result.error || "Une erreur est survenue lors de la suppression du compte");
			}
			
			// La redirection est gérée par le service accountService
		} catch (error) {
			console.error("Erreur lors de la suppression du compte:", error);
			setSaveStatus({
				type: "error",
				message: error.message || "Une erreur est survenue lors de la suppression du compte."
			});
			setIsConfirmationModalOpen(false);
			setIsDeletingAccount(false);
		}
	};

	// Utiliser le nom de la base de données Prisma via notre hook useUser
	const displayName = formData.name || user?.name || "";

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
							{/* Message de statut */}
							{saveStatus.type === "success" && (
								<Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
									<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
									<AlertDescription className="text-green-700 dark:text-green-300">
										{saveStatus.message}
									</AlertDescription>
								</Alert>
							)}

							{saveStatus.type === "error" && (
								<Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
									<AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
									<AlertDescription className="text-red-700 dark:text-red-300">
										{saveStatus.message}
									</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="name">Nom complet</Label>
								<Input
									id="name"
									name="name"
									value={isEditing ? formData.name : displayName}
									onChange={handleChange}
									disabled={!isEditing}
									className={
										isEditing
											? ""
											: "bg-gray-50 dark:bg-gray-800/50"
									}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Adresse e-mail</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={user?.email || ""}
									disabled={true}
									className="bg-gray-50 dark:bg-gray-800/50"
								/>
							</div>

							{isEditing && (
								<div className="pt-4">
									<Button
										onClick={handleSaveProfile}
										className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
										disabled={isLoading}
									>
										{isLoading
											? "Enregistrement..."
											: "Enregistrer les modifications"}
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
				message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues. Vous serez déconnecté immédiatement après la suppression."
				isVisible={isConfirmationModalOpen}
				onConfirm={handleDeleteAccount}
				onCancel={() => setIsConfirmationModalOpen(false)}
				confirmText="Supprimer définitivement"
				cancelText="Annuler"
				isDanger={true}
				isProcessing={isDeletingAccount}
			/>
		</div>
	);
}