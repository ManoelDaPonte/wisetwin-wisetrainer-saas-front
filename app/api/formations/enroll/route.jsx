//app/api/formations/enroll/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function POST(request) {
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
					userId: user.id,
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
		const existingEnrollment = await prisma.formationEnrollment.findFirst({
			where: {
				userId: user.id,
				formationId: courseId,
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
		const enrollment = await prisma.formationEnrollment.create({
			data: {
				userId: user.id,
				formationId: courseId,
				startedAt: new Date(),
				lastAccessedAt: new Date(),
				currentStatus: "in_progress",
			},
		});

		return NextResponse.json({
			success: true,
			message: "Inscription réussie",
			enrollment: enrollment,
		});
	} catch (error) {
		console.error("Erreur lors de l'inscription à la formation:", error);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de l'inscription à la formation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
