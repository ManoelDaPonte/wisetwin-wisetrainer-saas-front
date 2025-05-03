//app/api/formations/organization-formations/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request) {
	// Récupérer l'ID de l'organisation depuis les paramètres de requête
	const { searchParams } = new URL(request.url);
	const organizationId = searchParams.get("organizationId");

	if (!organizationId) {
		return NextResponse.json(
			{ error: "L'ID de l'organisation est requis" },
			{ status: 400 }
		);
	}

	try {
		// Récupérer la session Auth0 de l'utilisateur
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await findUserByAuth0Id(session.user.sub);

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier si l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				userId: user.id,
				organizationId: organizationId,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer les formations de l'organisation
		const organizationFormations = await prisma.formation.findMany({
			where: {
				organizationId: organizationId,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Récupérer les détails de l'organisation
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Formater les données pour le front-end
		const formattedFormations = organizationFormations.map((formation) => {
			return {
				id: formation.id,
				name: formation.name,
				description: formation.description,
				imageUrl: formation.imageUrl || null,
				duration: formation.duration || "Non spécifié",
				level: formation.difficulty || "Intermédiaire",
				category: formation.category || "Formation",
				certification: false, // À adapter selon votre schéma
				objectives: formation.description, // À adapter selon votre schéma
				source: {
					type: "organization",
					name: organization.name,
					organizationId: organization.id,
				},
			};
		});

		return NextResponse.json({ trainings: formattedFormations });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations de l'organisation:",
			error
		);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la récupération des formations de l'organisation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
