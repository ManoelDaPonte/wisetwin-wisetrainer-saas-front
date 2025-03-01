// hooks/useAzureContainer.js
import { useUser } from "@auth0/nextjs-auth0/client";
import { useMemo } from "react";

export function useAzureContainer() {
	const { user, isLoading, error } = useUser();

	const containerName = useMemo(() => {
		if (!user) return null;
		return `user-${user.sub.split("|")[1]}`;
	}, [user]);

	return {
		containerName,
		isLoading,
		error,
		user,
	};
}
