// app/api/auth/[auth0]/route.jsx
import { handleAuth, handleLogin, handleLogout } from "@auth0/nextjs-auth0";

export const GET = async (request, props) => {
	const params = await props.params;
	const resolvedParams = await params;

	// Récupérer le paramètre returnTo de l'URL si présent
	const url = new URL(request.url);
	const returnTo = url.searchParams.get("returnTo");

	// Configuration du retour après authentification
	let authorizationParams = {};

	if (returnTo) {
		authorizationParams.returnTo = returnTo; // Ne pas décoder ici
	}

	return handleAuth({
		signup: handleLogin({
			authorizationParams: {
				...authorizationParams,
				screen_hint: "signup",
			},
		}),
		login: handleLogin({
			authorizationParams,
		}),
		logout: handleLogout({
			returnTo: "/login", // Redirect to login page after logout
		}),
	})(request, { params: resolvedParams });
};
