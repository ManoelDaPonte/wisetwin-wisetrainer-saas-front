// app/api/formations/enroll/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request) {
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

		// Récupérer les données de la requête
		const data = await request.json();
		const { courseId, sourceType, sourceOrganizationId } = data;

		if (!courseId) {
			return NextResponse.json(
				{ error: "L'ID du cours est requis" },
				{ status: 400 }
			);
		}

		// Vérifier si la formation existe
		const formation = await prisma.formation.findUnique({
			where: {
				id: courseId,
			},
		});

		if (!formation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Si la formation est liée à une organisation, vérifier si l'utilisateur est membre
		if (sourceType === "organization" && sourceOrganizationId) {
			const membership = await prisma.organizationMember.findFirst({
				where: {
					userId: userId,
					organizationId: sourceOrganizationId,
				},
			});

			if (!membership) {
				return NextResponse.json(
					{ error: "Vous n'êtes pas membre de cette organisation" },
					{ status: 403 }
				);
			}
		}

		// Vérifier si l'utilisateur est déjà inscrit à cette formation
		const existingEnrollment = await prisma.userFormation.findFirst({
			where: {
				userId: userId,
				formationId: courseId,
				...(sourceType === "organization" && sourceOrganizationId
					? { organizationId: sourceOrganizationId }
					: {}),
			},
		});

		if (existingEnrollment) {
			return NextResponse.json(
				{
					message: "Vous êtes déjà inscrit à cette formation",
					success: true,
				},
				{ status: 200 }
			);
		}

		// Inscrire l'utilisateur à la formation
		const userFormation = await prisma.userFormation.create({
			data: {
				userId: userId,
				formationId: courseId,
				progress: 0,
				enrolledAt: new Date(),
				...(sourceType === "organization" && sourceOrganizationId
					? { organizationId: sourceOrganizationId }
					: {}),
			},
		});

		return NextResponse.json({
			success: true,
			message: "Inscription réussie",
			enrollment: userFormation,
		});
	} catch (error) {
		console.error("Erreur lors de l'inscription à la formation:", error);
		return NextResponse.json(
			{ error: "Erreur serveur lors de l'inscription à la formation" },
			{ status: 500 }
		);
	}
}
