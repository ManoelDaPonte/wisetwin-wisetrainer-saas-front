"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
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
				// Générer un nom de container basé sur l'ID Auth0
				const authId = user.sub.split("|")[1];
				const generatedContainerName = `user-${authId}`;

				// Vérifier si le container existe déjà
				const checkResponse = await axios.get(
					`/api/azure/check-container-exists?container=${generatedContainerName}`
				);

				if (checkResponse.data.exists) {
					// Le container existe déjà, on l'utilise
					setContainerName(generatedContainerName);
				} else {
					// Le container n'existe pas, on le crée
					const createResponse = await axios.post(
						`/api/azure/create-container`,
						{
							containerName: generatedContainerName,
						}
					);

					if (createResponse.data.success) {
						setContainerName(generatedContainerName);
					} else {
						throw new Error(
							"Échec de la création du container: " +
								createResponse.data.error
						);
					}
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
