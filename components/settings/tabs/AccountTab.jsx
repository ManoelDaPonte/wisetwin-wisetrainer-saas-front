// components/settings/tabs/AccountTab.jsx

import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Image from "next/image";
import axios from "axios";
import { useAzureContainer } from "@/lib/hooks/useAzureContainer";

const AccountTab = () => {
	const { user } = useUser();
	const { containerName } = useAzureContainer();
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
		useState(false);
	const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState(null);

	// Formater la date d'inscription (simulation)
	const registrationDate = new Date(2023, 3, 15).toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});

	const openConfirmationModal = () => {
		setIsConfirmationModalOpen(true);
	};

	const openPasswordModal = () => {
		setIsPasswordModalOpen(true);
	};

	const handlePasswordChange = async () => {
		try {
			const response = await axios.post("/api/auth/change-password", {
				userId: user.sub,
			});

			if (response.data.success) {
				// Rediriger vers l'URL de changement de mot de passe Auth0
				window.location.href = response.data.changePasswordUrl;
			}
		} catch (error) {
			console.error("Erreur:", error);
			setError(error.response?.data?.error || "Une erreur est survenue");
		}
	};

	const handleDeleteAccount = async () => {
		setIsSubmitting(true);
		setError(null);

		try {
			const response = await axios.delete("/api/auth/delete-account", {
				data: {
					userId: user.sub,
					azureContainer: containerName,
				},
			});

			if (response.data.success) {
				alert(
					"Votre compte a été supprimé avec succès. Vous allez être déconnecté."
				);
				window.location.href = "/api/auth/logout";
			} else {
				throw new Error(
					response.data.error || "Échec de la suppression du compte"
				);
			}
		} catch (error) {
			console.error("Erreur lors de la suppression du compte:", error);
			setError(
				error.response?.data?.error ||
					error.message ||
					"Une erreur est survenue"
			);
			setIsSubmitting(false);
		}
	};

	return (
		<div>
			<h3 className="text-md font-medium mb-5 dark:text-white">
				Mon Compte
			</h3>

			{user && (
				<div className="space-y-6">
					{/* Profil utilisateur */}
					<div className="flex items-center space-x-4">
						<div className="relative w-16 h-16 rounded-full overflow-hidden">
							<Image
								src={user.picture}
								alt="Photo de profil"
								fill
								className="object-cover"
							/>
						</div>
						<div>
							<h4 className="font-medium dark:text-white">
								{user.name}
							</h4>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								{user.email}
							</p>
							<p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
								Membre depuis {registrationDate}
							</p>
						</div>
					</div>

					{/* Suppression du compte */}
					<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
						<h4 className="text-sm font-medium flex items-center mb-3 text-red-500">
							<AlertTriangle className="h-4 w-4 mr-2" />
							Zone de danger
						</h4>

						<p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
							La suppression de votre compte est irréversible et
							entraînera la perte de toutes vos données.
						</p>

						<Button
							variant="destructive"
							size="sm"
							onClick={openConfirmationModal}
							className="w-full"
						>
							Supprimer mon compte
						</Button>
					</div>
				</div>
			)}

			{/* Modal de confirmation pour la suppression de compte */}
			<ConfirmationModal
				title="Confirmer la suppression"
				message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos données seront perdues."
				isVisible={isConfirmationModalOpen}
				onConfirm={handleDeleteAccount}
				onCancel={() => setIsConfirmationModalOpen(false)}
				confirmText="Supprimer définitivement"
				cancelText="Annuler"
				isDanger={true}
			/>

			{/* Modal pour le changement de mot de passe */}
			{isPasswordModalOpen && (
				<div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
					<div className="bg-white dark:bg-gray-800 w-96 rounded-lg shadow-lg p-6 relative">
						<h3 className="text-lg font-medium mb-4 dark:text-white">
							Changer mon mot de passe
						</h3>

						{error && (
							<div className="mb-4 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
								{error}
							</div>
						)}

						<div className="mb-4">
							<label className="block text-sm font-medium mb-1 dark:text-gray-300">
								Nouveau mot de passe
							</label>
							<input
								type="password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
								placeholder="Minimum 8 caractères"
							/>
						</div>

						<div className="flex justify-end space-x-2">
							<Button
								variant="outline"
								onClick={() => setIsPasswordModalOpen(false)}
								disabled={isSubmitting}
							>
								Annuler
							</Button>
							<Button
								onClick={handlePasswordChange}
								disabled={
									isSubmitting ||
									!newPassword ||
									newPassword.length < 8
								}
							>
								{isSubmitting ? "Chargement..." : "Confirmer"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AccountTab;
