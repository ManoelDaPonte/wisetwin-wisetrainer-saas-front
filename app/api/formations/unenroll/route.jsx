// app/api/formations/unenroll/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

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
		// Récupérer l'utilisateur authentifié
		const session = await auth();

		if (!session?.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const userId = session.user.id;

		// Trouver l'inscription de l'utilisateur à la formation
		const userFormation = await prisma.userFormation.findFirst({
			where: {
				userId: userId,
				formationId: courseId,
				...(sourceType === "organization" && sourceOrganizationId
					? { organizationId: sourceOrganizationId }
					: { organizationId: null }),
			},
		});

		if (!userFormation) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas inscrit à cette formation" },
				{ status: 404 }
			);
		}

		// Désinscrire l'utilisateur de la formation
		await prisma.userFormation.delete({
			where: {
				id: userFormation.id,
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
			},
			{ status: 500 }
		);
	}
}
