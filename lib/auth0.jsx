import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
	// Options de configuration personnalisées (si nécessaire)
	authorizationParameters: {
		// Paramètres d'autorisation par défaut
	},
});
