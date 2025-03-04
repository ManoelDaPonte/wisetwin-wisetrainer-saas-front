//middleware.js
import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";
import { NextResponse } from "next/server";

// Fonction pour vérifier si une route doit être protégée
function isProtectedRoute(pathname) {
	const protectedPaths = [
		"/overview",
		"/digital-twin",
		"/wisetrainer",
		"/iot-dashboard",
		"/alerts",
		"/predictive",
		"/", // Page d'accueil également protégée
	];

	return protectedPaths.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`)
	);
}

// Fonction pour vérifier si une route doit être publique
function isPublicRoute(pathname) {
	const publicPaths = [
		"/_next",
		"/api/auth",
		"/login",
		"/favicon.ico",
		"/static",
		"/images",
		"/logos",
	];

	return publicPaths.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`)
	);
}

export default withMiddlewareAuthRequired(function middleware(req) {
	const pathname = req.nextUrl.pathname;

	// Si l'utilisateur accède à la page de connexion alors qu'il est déjà connecté
	if (pathname === "/login") {
		// withMiddlewareAuthRequired garantit déjà qu'il y a une session,
		// donc ici nous redirigeons vers l'accueil
		const url = req.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url);
	}

	// Pour les routes publiques, on laisse passer
	if (isPublicRoute(pathname)) {
		return NextResponse.next();
	}

	// Pour les routes protégées, Auth0 s'en occupe
	if (isProtectedRoute(pathname)) {
		return NextResponse.next();
	}

	// Pour toutes les autres routes, on laisse passer par défaut
	return NextResponse.next();
});

export const config = {
	matcher: [
		"/((?!api/auth|_next/static|_next/image|favicon.ico|images|logos).*)",
	],
};
