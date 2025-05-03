// app/api/formations/organization-formations/route.jsx// app/api/formations/organization-formations/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
		// Récupérer l'utilisateur authentifié
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const userId = session.user.id;

		// Vérifier si l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				userId: userId,
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
			include: {
				organization: true,
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
				imageUrl: formation.imageUrl,
				duration: formation.duration,
				level: formation.level,
				category: formation.category,
				certification: formation.certification,
				objectives: formation.objectives,
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
			},
			{ status: 500 }
		);
	}
}
