// app/api/auth/check-session/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET() {
	try {
		const session = await auth0.getSession();

		if (!session || !session.user) {
			return NextResponse.json(
				{
					authenticated: false,
					message: "Utilisateur non authentifié",
				},
				{ status: 401 }
			);
		}

		return NextResponse.json({
			authenticated: true,
			user: {
				sub: session.user.sub,
				email: session.user.email,
				name: session.user.name || session.user.email,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la vérification de la session:", error);
		return NextResponse.json(
			{
				authenticated: false,
				error: "Erreur de session",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
