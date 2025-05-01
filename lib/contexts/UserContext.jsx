// lib/contexts/UserContext.js
"use client";
import React, { createContext, useContext } from "react";
import { useUser as useUserHook } from "@/lib/hooks/auth/useUser";

// Créer le contexte
const UserContext = createContext(undefined);

// Fournisseur qui expose les données utilisateur à toute l'application
export function UserProvider({ children }) {
	const userState = useUserHook();

	return (
		<UserContext.Provider value={userState}>
			{children}
		</UserContext.Provider>
	);
}

// Hook pour consommer le contexte
export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error(
			"useUser doit être utilisé à l'intérieur de UserProvider"
		);
	}
	return context;
}
