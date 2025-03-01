import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client"; // Utiliser le hook d'auth0 pour obtenir les informations de l'utilisateur
import axios from "axios"; // Importer axios pour effectuer les requêtes HTTP
import ConfirmationModal from "@/components/common/ConfirmationModal"; // Importer le composant de confirmation

const AccountTab = () => {
	const { user } = useUser(); // Récupérer l'utilisateur depuis Auth0

	// Récupérer userId et containerName
	const userId = user?.sub; // Utilisateur ID de Auth0
	const containerName = metadata?.azure_container_name;
	const customerId = metadata?.thingsboard_customer_id;

	// État pour contrôler la visibilité de la modale de confirmation
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
		useState(false);

	const handleDeleteAccount = async () => {
		if (!userId || !containerName || !customerId) {
			alert("Unable to retrieve necessary account information.");
			return;
		}

		try {
			const response = await axios.delete(
				`/api/auth/delete-account/${userId}/${containerName}/${customerId}`
			);

			if (response.status === 200) {
				window.location.href = "/api/auth/logout"; // Redirection après suppression
			} else {
				console.error("Failed to delete account.");
				alert(
					"There was an error deleting your account. Please try again."
				);
			}
		} catch (error) {
			console.error(
				"An error occurred:",
				error.response?.data || error.message
			);
			alert("An error occurred while deleting your account.");
		}
	};

	// Fonction pour afficher la modale de confirmation
	const openConfirmationModal = () => {
		setIsConfirmationModalOpen(true);
	};

	// Fonction pour gérer la confirmation de suppression du compte
	const confirmDeleteAccount = () => {
		handleDeleteAccount(); // Appeler la fonction de suppression du compte
		setIsConfirmationModalOpen(false); // Fermer la modale après confirmation
	};

	return (
		<div>
			<h3 className="text-md font-medium mb-4">Account</h3>
			{/* Suppression du compte */}
			<div className="flex justify-between items-center py-2">
				<span>Delete Account</span>
				<button
					onClick={openConfirmationModal} // Ouvrir la modale de confirmation
					className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
				>
					Delete
				</button>
			</div>

			{/* Affichage du composant de confirmation */}
			<ConfirmationModal
				title="Confirm Delete"
				message="Are you sure you want to delete your account? This action cannot be undone."
				isVisible={isConfirmationModalOpen} // Contrôle de la visibilité
				onConfirm={confirmDeleteAccount} // Appeler la fonction pour confirmer
				onCancel={() => setIsConfirmationModalOpen(false)} // Fermer la modale si annulé
			/>
		</div>
	);
};

export default AccountTab;
