//app/api/organization/[organizationId]/tags/training-associations/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// Récupérer toutes les associations tag-formation
export async function GET(request, { params }) {
	try {
		const session = await getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier si l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: user.id,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer toutes les associations tag-formation pour cette organisation
		const associations = await prisma.tagTraining.findMany({
			where: {
				tag: {
					organizationId: organizationId,
				},
			},
			include: {
				tag: true,
				course: true,
			},
		});

		// Transformer les données pour les renvoyer (simplifiées)
		const formattedAssociations = associations.map((assoc) => ({
			id: assoc.id,
			tagId: assoc.tagId,
			courseId: assoc.courseId,
			tagName: assoc.tag.name,
			courseName:
				assoc.course?.name ||
				assoc.course?.courseId ||
				"Formation inconnue",
		}));

		return NextResponse.json({
			associations: formattedAssociations,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des associations:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des associations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
