import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// GET pour récupérer toutes les formations associées à un tag
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, tagId } = resolvedParams;

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

		// Vérifier que l'utilisateur est membre de l'organisation
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

		// Vérifier si le tag existe et appartient à l'organisation
		const tag = await prisma.organizationTag.findFirst({
			where: {
				id: tagId,
				organizationId: organizationId,
			},
		});

		if (!tag) {
			return NextResponse.json(
				{ error: "Tag non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer toutes les formations associées au tag
		const trainings = await prisma.tagTraining.findMany({
			where: {
				tagId: tagId,
			},
			include: {
				course: true,
			},
		});

		// Reformater les données pour la réponse
		const formattedTrainings = trainings.map((training) => ({
			id: training.course.id,
			name: training.course.name,
			description: training.course.description,
			imageUrl: training.course.imageUrl,
			category: training.course.category,
			difficulty: training.course.difficulty,
			duration: training.course.duration,
			courseId: training.course.courseId,
		}));

		return NextResponse.json({
			success: true,
			trainings: formattedTrainings,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations associées au tag:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des formations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
