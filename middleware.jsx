// middleware.js
import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0/edge";

export async function middleware(req) {
	const res = NextResponse.next();
	const session = await getSession(req, res);

	// Si l'utilisateur accède à la page de connexion et est déjà connecté
	if (req.nextUrl.pathname === "/login" && session) {
		// S'il y a un returnTo dans l'URL, rediriger vers cette destination
		const returnTo = req.nextUrl.searchParams.get("returnTo");
		if (returnTo) {
			// Ne pas encoder à nouveau l'URL
			return NextResponse.redirect(new URL(returnTo, req.url));
		}
		// Sinon, rediriger vers la page d'accueil
		return NextResponse.redirect(new URL("/", req.url));
	}

	// Si l'utilisateur tente d'accéder à des pages protégées sans être connecté
	if (
		!session &&
		req.nextUrl.pathname !== "/login" &&
		!req.nextUrl.pathname.startsWith("/api/auth")
	) {
		// Récupérer le chemin actuel pour la redirection après authentification
		const currentPath = req.nextUrl.pathname;
		const searchParams = req.nextUrl.search;
		const fullPath = searchParams
			? `${currentPath}${searchParams}`
			: currentPath;

		// Créer l'URL de redirection vers la page de login avec le paramètre returnTo
		const loginUrl = new URL("/login", req.url);
		loginUrl.searchParams.set("returnTo", fullPath); // Pas d'encodage ici

		return NextResponse.redirect(loginUrl);
	}

	return res;
}

export const config = {
	matcher: [
		// Exclure les routes publiques du middleware
		"/((?!api/auth|login|api/auth/.*|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
	],
};
