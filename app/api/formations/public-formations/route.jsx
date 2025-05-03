// app/api/formations/public-formations/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
	try {
		// Récupérer l'utilisateur authentifié (optionnel pour les formations publiques)
		const session = await auth();

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
				imageUrl: formation.imageUrl,
				duration: formation.duration,
				level: formation.level,
				category: formation.category,
				certification: formation.certification,
				objectives: formation.objectives,
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
			},
			{ status: 500 }
		);
	}
}
