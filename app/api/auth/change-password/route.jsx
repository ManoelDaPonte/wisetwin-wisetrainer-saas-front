//app/api/auth/change-password/route.jsx

import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		// Récupération des données de la requête
		const { userId } = await request.json();

		// Construction de l'URL de changement de mot de passe Auth0
		const baseUrl = process.env.AUTH0_ISSUER_BASE_URL;
		const redirectUri = `${
			process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
		}/settings?passwordChanged=true`;
		const clientId = process.env.AUTH0_CLIENT_ID;

		const changePasswordUrl = `${baseUrl}/password/change?client_id=${clientId}&returnTo=${encodeURIComponent(
			redirectUri
		)}`;

		return NextResponse.json({
			success: true,
			changePasswordUrl: changePasswordUrl,
		});
	} catch (error) {
		console.error("Erreur:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
