// app/api/organization/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";
import {
	getUserOrganizations,
	createOrganization,
} from "@/lib/services/organizations/organizationService";

// GET pour récupérer toutes les organisations d'un utilisateur
export async function GET(request) {
	try {
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur
		const user = await findUserByAuth0Id(session.user.sub);

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer les organisations
		const organizations = await getUserOrganizations(user.id);

		return NextResponse.json({ organizations });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des organisations:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des organisations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST pour créer une nouvelle organisation
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

		// Récupérer les données de la requête
		const organizationData = await request.json();

		if (!organizationData.name) {
			return NextResponse.json(
				{ error: "Le nom de l'organisation est requis" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur
		const user = await findUserByAuth0Id(session.user.sub);

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Créer l'organisation
		const organization = await createOrganization(
			organizationData,
			user.id
		);

		return NextResponse.json({
			success: true,
			organization: {
				...organization,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'organisation:", error);
		return NextResponse.json(
			{
				error: "Échec de la création de l'organisation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
