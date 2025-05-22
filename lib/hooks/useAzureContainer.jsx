"use client";
import { useUser } from "@auth0/nextjs-auth0";
import { useState, useEffect } from "react";
import axios from "axios";

export function useAzureContainer() {
	const { user, isLoading: userLoading } = useUser();
	const [containerName, setContainerName] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function setupContainer() {
			if (!user) {
				setIsLoading(false);
				return;
			}

			try {
				// Initialiser l'utilisateur dans la base de données
				// Cette API va gérer la création du container si nécessaire
				// app/api/auth/initialize-user/route.jsx

				if (
					initResponse.data.success &&
					initResponse.data.user.azureContainer
				) {
					setContainerName(initResponse.data.user.azureContainer);
				} else {
					throw new Error(
						"Échec de l'initialisation de l'utilisateur"
					);
				}

				setIsLoading(false);
			} catch (err) {
				console.error(
					"Erreur lors de la configuration du container:",
					err
				);
				setError(err);
				setIsLoading(false);
			}
		}

		setupContainer();
	}, [user]);

	return {
		containerName,
		isLoading: isLoading || userLoading,
		error,
		user,
	};
}
