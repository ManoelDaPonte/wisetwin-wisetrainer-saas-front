//app/api/auth/user-details/[userId]/route.jsx

import { NextResponse } from "next/server";
import axios from "axios";
import { getSession } from "@auth0/nextjs-auth0";

export async function GET(request, { params }) {
	try {
		// Récupérer l'ID utilisateur depuis l'URL
		const userId = params.userId;

		// Vérifier que l'utilisateur est autorisé à accéder à ces informations
		const session = await getSession(request);

		if (!session?.user || session.user.sub !== userId) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Vérifier les variables d'environnement
		if (
			!process.env.AUTH0_MGMT_CLIENT_ID ||
			!process.env.AUTH0_MGMT_CLIENT_SECRET ||
			!process.env.AUTH0_ISSUER_BASE_URL
		) {
			console.error("Variables d'environnement Auth0 manquantes");
			return NextResponse.json(
				{ error: "Configuration serveur incorrecte" },
				{ status: 500 }
			);
		}

		// Obtenir un token d'accès à l'API Management
		const tokenResponse = await axios.post(
			`${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`,
			{
				client_id: process.env.AUTH0_MGMT_CLIENT_ID,
				client_secret: process.env.AUTH0_MGMT_CLIENT_SECRET,
				audience: `${process.env.AUTH0_ISSUER_BASE_URL}/api/v2/`,
				grant_type: "client_credentials",
			}
		);

		const accessToken = tokenResponse.data.access_token;

		// Récupérer les informations de l'utilisateur
		const userResponse = await axios.get(
			`${
				process.env.AUTH0_ISSUER_BASE_URL
			}/api/v2/users/${encodeURIComponent(userId)}`,
			{
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			}
		);

		return NextResponse.json(userResponse.data);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des détails utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des détails utilisateur",
				message: error.message,
			},
			{ status: 500 }
		);
	}
}
