//app/api/formations/user-formations/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request) {
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

		// Récupérer les formations de l'utilisateur depuis la base de données
		const userFormations = await prisma.formationEnrollment.findMany({
			where: {
				userId: user.id,
			},
			include: {
				formation: true,
			},
		});

		// Formater les données pour le front-end
		const formattedFormations = await Promise.all(
			userFormations.map(async (enrollment) => {
				// Récupérer l'organisation si elle existe
				let source = {
					type: "wisetwin",
					name: "WiseTwin",
				};

				if (enrollment.formation.organizationId) {
					const organization = await prisma.organization.findUnique({
						where: { id: enrollment.formation.organizationId },
					});

					if (organization) {
						source = {
							type: "organization",
							name: organization.name,
							organizationId: organization.id,
						};
					}
				}

				return {
					id: enrollment.formation.id,
					name: enrollment.formation.name,
					description: enrollment.formation.description,
					imageUrl: enrollment.formation.imageUrl || null,
					duration: enrollment.formation.duration || "Non spécifié",
					level: enrollment.formation.difficulty || "Intermédiaire",
					category: enrollment.formation.category || "Formation",
					certification: false, // À adapter selon votre schéma
					progress:
						enrollment.currentStatus === "completed" ? 100 : 0, // À adapter selon votre tracking de progression
					enrolledAt: enrollment.startedAt,
					completedAt: enrollment.completedAt,
					source: source,
				};
			})
		);

		return NextResponse.json({ trainings: formattedFormations });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations de l'utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la récupération des formations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
