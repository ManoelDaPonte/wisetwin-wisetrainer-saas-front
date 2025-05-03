//app/api/formations/public-formations/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request) {
	try {
		// Récupérer la session Auth0 de l'utilisateur (facultatif pour les formations publiques)
		const session = await auth0.getSession();
		let user = null;

		if (session && session.user) {
			// Récupérer l'utilisateur depuis la base de données si authentifié
			user = await findUserByAuth0Id(session.user.sub);
		}

		// Récupérer toutes les formations publiques
		const publicFormations = await prisma.formation.findMany({
			where: {
				isPublic: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Formater les données pour le front-end
		const formattedFormations = publicFormations.map((formation) => {
			return {
				id: formation.id,
				name: formation.name,
				description: formation.description,
				imageUrl: formation.imageUrl || null,
				duration: formation.duration || "Non spécifié",
				level: formation.difficulty || "Intermédiaire",
				category: formation.category || "Formation",
				certification: false, // À adapter selon votre schéma
				source: {
					type: "wisetwin",
					name: "WiseTwin",
				},
			};
		});

		return NextResponse.json({ trainings: formattedFormations });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations publiques:",
			error
		);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la récupération des formations publiques",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
