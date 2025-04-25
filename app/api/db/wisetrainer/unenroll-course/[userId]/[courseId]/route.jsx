// app/api/db/wisetrainer/unenroll-course/[userId]/[courseId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
	try {
		const url = new URL(request.url);
		const sourceType = url.searchParams.get("sourceType") || "wisetwin";
		const sourceOrganizationId = url.searchParams.get(
			"sourceOrganizationId"
		);

		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const resolvedParams = await params;
		const { userId, courseId } = resolvedParams;

		if (!userId || !courseId) {
			return NextResponse.json(
				{
					error: "Les identifiants d'utilisateur et de cours sont requis",
				},
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer le cours depuis la base de données
		const course = await prisma.course.findFirst({
			where: {
				courseId: courseId,
				sourceType: "wisetwin", // Par défaut, nous cherchons les formations WiseTwin
				sourceOrganizationId: null,
			},
			include: {
				modules: true,
			},
		});

		if (!course) {
			return NextResponse.json(
				{ error: "Cours non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer l'inscription de l'utilisateur
		const userCourse = await prisma.userCourse.findFirst({
			where: {
				userId: user.id,
				courseId: course.id,
			},
		});

		if (!userCourse) {
			return NextResponse.json(
				{ error: "Inscription non trouvée" },
				{ status: 404 }
			);
		}

		// Supprimer l'inscription
		await prisma.userCourse.delete({
			where: {
				id: userCourse.id,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Désinscription réussie",
		});
	} catch (error) {
		console.error("Erreur lors de la désinscription du cours:", error);
		return NextResponse.json(
			{
				error: "Échec de la désinscription",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
