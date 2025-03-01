// lib/hooks/useAzureContainer.jsx
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect } from "react";
import axios from "axios";

export function useAzureContainer() {
	const { user, isLoading: userLoading } = useUser();
	const [containerName, setContainerName] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchContainerName() {
			if (!user) {
				setIsLoading(false);
				return;
			}

			try {
				// On peut dériver le nom du container à partir de l'ID de l'utilisateur
				const defaultContainerName = `user-${user.sub.split("|")[1]}`;
				setContainerName(defaultContainerName);
				setIsLoading(false);
			} catch (err) {
				console.error("Error determining container name:", err);
				setError(err);
				setIsLoading(false);
			}
		}

		fetchContainerName();
	}, [user]);

	return {
		containerName,
		isLoading: isLoading || userLoading,
		error,
		user,
	};
}
