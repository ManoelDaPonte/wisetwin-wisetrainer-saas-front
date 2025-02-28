"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";

const UserMetadataContext = createContext();

export const UserMetadataProvider = ({ children }) => {
	const { user, isLoading } = useUser();
	const [metadata, setMetadata] = useState(null);

	useEffect(() => {
		if (user && !isLoading) {
			const fetchMetadata = async () => {
				try {
					const response = await axios.get(
						`/api/auth/fetch-user-metadata/${user.sub}`
					);
					setMetadata(response.data);
				} catch (error) {
					console.error(
						"Error fetching user metadata:",
						error.response ? error.response.data : error.message
					);
				}
			};

			fetchMetadata();
		}
	}, [user, isLoading]);

	return (
		<UserMetadataContext.Provider value={{ metadata }}>
			{children}
		</UserMetadataContext.Provider>
	);
};

export const useUserMetadata = () => {
	return useContext(UserMetadataContext);
};
