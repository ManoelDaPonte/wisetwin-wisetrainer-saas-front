// app/api/formations/user-formations/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request) {
	try {
		// Récupérer l'utilisateur authentifié
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const userId = session.user.id;

		// Récupérer les formations de l'utilisateur depuis la base de données
		const userFormations = await prisma.userFormation.findMany({
			where: {
				userId: userId,
			},
			include: {
				formation: true,
				organization: true,
			},
		});

		// Formater les données pour le front-end
		const formattedFormations = userFormations.map((userFormation) => {
			return {
				id: userFormation.formation.id,
				name: userFormation.formation.name,
				description: userFormation.formation.description,
				imageUrl: userFormation.formation.imageUrl,
				duration: userFormation.formation.duration,
				level: userFormation.formation.level,
				category: userFormation.formation.category,
				certification: userFormation.formation.certification,
				objectives: userFormation.formation.objectives,
				progress: userFormation.progress || 0,
				enrolledAt: userFormation.enrolledAt,
				completedAt: userFormation.completedAt,
				source: userFormation.organization
					? {
							type: "organization",
							name: userFormation.organization.name,
							organizationId: userFormation.organization.id,
					  }
					: {
							type: "wisetwin",
							name: "WiseTwin",
					  },
			};
		});

		return NextResponse.json({ trainings: formattedFormations });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations de l'utilisateur:",
			error
		);
		return NextResponse.json(
			{ error: "Erreur serveur lors de la récupération des formations" },
			{ status: 500 }
		);
	}
}
