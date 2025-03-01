// app/api/auth/fetch-user-metadata/[userId]/route.jsx
import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { ManagementClient } from "auth0";

export async function GET(request, context) {
	try {
		// Récupérer les paramètres de manière asynchrone
		const params = await context.params;
		const { userId } = params;

		// Récupérer la session Auth0 pour vérifier l'authentification
		const session = await getSession();

		if (!session) {
			return NextResponse.json(
				{ error: "Not authenticated" },
				{ status: 401 }
			);
		}

		// Vérifier que l'utilisateur demande ses propres métadonnées
		if (session.user.sub !== userId) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 403 }
			);
		}

		// Initialiser le client Auth0 Management API
		const management = new ManagementClient({
			domain: process.env.AUTH0_DOMAIN,
			clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
			clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
		});

		// Récupérer les métadonnées de l'utilisateur - Attention à la méthode correcte
		const user = await management.users.get({ id: userId });

		if (!user || !user.data) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Construction de l'objet métadonnées
		const userData = user.data;
		const metadata = {
			// Métadonnées par défaut si elles n'existent pas encore
			azure_container_name:
				userData.app_metadata?.azure_container_name ||
				`user-${userId.split("|")[1]}`,
			thingsboard_customer_id:
				userData.app_metadata?.thingsboard_customer_id,
			...userData.app_metadata,
			...userData.user_metadata,
		};

		// Si l'utilisateur n'a pas encore de container Azure, définir un par défaut
		if (!metadata.azure_container_name) {
			// Créer le nom de container par défaut
			metadata.azure_container_name = `user-${userId.split("|")[1]}`;

			// Mettre à jour les métadonnées de l'utilisateur
			await management.users.updateAppMetadata(
				{ id: userId },
				{ azure_container_name: metadata.azure_container_name }
			);
		}

		return NextResponse.json(metadata);
	} catch (error) {
		console.error("Error fetching user metadata:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch user metadata",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
