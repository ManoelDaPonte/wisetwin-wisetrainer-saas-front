// middleware.js
import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0/edge";

export async function middleware(req) {
	const res = NextResponse.next();
	const session = await getSession(req, res);

	// Si l'utilisateur accède à la page de connexion et est déjà connecté
	if (req.nextUrl.pathname === "/login" && session) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	// Si l'utilisateur tente d'accéder à des pages protégées sans être connecté
	if (
		!session &&
		req.nextUrl.pathname !== "/login" &&
		!req.nextUrl.pathname.startsWith("/api/auth")
	) {
		return NextResponse.redirect(new URL("/login", req.url));
	}

	return res;
}

export const config = {
	matcher: [
		// Exclure les routes publiques du middleware
		"/((?!api/auth|login|api/auth/.*|_next/static|_next/image|favicon.ico|.*\\..*$).*)",
	],
};
