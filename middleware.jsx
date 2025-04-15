import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function middleware(request) {
	// Utiliser le middleware Auth0 pour gérer les sessions et les routes d'authentification
	const authRes = await auth0.middleware(request);

	// Si le chemin commence par /auth, laisser le middleware Auth0 le gérer
	if (request.nextUrl.pathname.startsWith("/auth")) {
		return authRes;
	}

	// Obtenir la session à partir du middleware Auth0
	const session = await auth0.getSession(request);

	// Si l'utilisateur accède à la page de connexion et est déjà connecté
	if (request.nextUrl.pathname === "/login" && session) {
		// S'il y a un returnTo dans l'URL, rediriger vers cette destination
		const returnTo = request.nextUrl.searchParams.get("returnTo");
		if (returnTo) {
			return NextResponse.redirect(new URL(returnTo, request.url));
		}
		// Sinon, rediriger vers la page d'accueil
		return NextResponse.redirect(new URL("/", request.url));
	}

	// Si l'utilisateur tente d'accéder à des pages protégées sans être connecté
	if (
		!session &&
		request.nextUrl.pathname !== "/login" &&
		!request.nextUrl.pathname.startsWith("/auth")
	) {
		// Récupérer le chemin actuel pour la redirection après authentification
		const currentPath = request.nextUrl.pathname;
		const searchParams = request.nextUrl.search;
		const fullPath = searchParams
			? `${currentPath}${searchParams}`
			: currentPath;

		// Créer l'URL de redirection vers la page de login avec le paramètre returnTo
		const loginUrl = new URL("/login", request.url);
		loginUrl.searchParams.set("returnTo", fullPath);

		return NextResponse.redirect(loginUrl);
	}

	// Retourner la réponse du middleware Auth0 pour propager les en-têtes nécessaires
	return authRes;
}

export const config = {
	matcher: [
		// Match toutes les routes sauf les ressources statiques
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
