//app/api/formations/unenroll/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function DELETE(request) {
	// Récupérer les paramètres de requête
	const { searchParams } = new URL(request.url);
	const courseId = searchParams.get("courseId");
	const sourceType = searchParams.get("sourceType") || "wisetwin";
	const sourceOrganizationId = searchParams.get("sourceOrganizationId");

	if (!courseId) {
		return NextResponse.json(
			{ error: "L'ID du cours est requis" },
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

		// Trouver l'inscription de l'utilisateur à la formation
		const enrollment = await prisma.formationEnrollment.findFirst({
			where: {
				userId: user.id,
				formationId: courseId,
			},
		});

		if (!enrollment) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas inscrit à cette formation" },
				{ status: 404 }
			);
		}

		// Désinscrire l'utilisateur de la formation
		await prisma.formationEnrollment.delete({
			where: {
				id: enrollment.id,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Désinscription réussie",
		});
	} catch (error) {
		console.error(
			"Erreur lors de la désinscription de la formation:",
			error
		);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la désinscription de la formation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
