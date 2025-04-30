// app/api/auth/initialize-user/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { initializeUser } from "@/lib/services/userService";

export async function POST(request) {
	try {
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Utiliser le service pour initialiser l'utilisateur
		const user = await initializeUser(session.user);

		// Formater la réponse pour le client
		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				// Autres données utilisateur pertinentes
			},
		});
	} catch (error) {
		console.error(
			"Erreur lors de l'initialisation de l'utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de l'initialisation de l'utilisateur",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
