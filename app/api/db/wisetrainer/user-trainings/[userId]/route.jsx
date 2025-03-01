import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	const resolvedParams = await params;
	try {
		const { userId } = resolvedParams;

		// Récupérer l'utilisateur basé sur son container Azure
		let user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		// Si l'utilisateur n'existe pas, créer un nouvel utilisateur
		if (!user) {
			console.log(
				`Utilisateur avec container ${userId} non trouvé, création d'un utilisateur temporaire`
			);

			// Créer un utilisateur temporaire avec des informations minimales
			user = await prisma.user.create({
				data: {
					auth0Id: `temp-${userId}`, // ID temporaire
					email: `temp-${userId}@example.com`, // Email temporaire
					name: "Utilisateur Temporaire",
					azureContainer: userId,
				},
			});

			console.log(`Utilisateur temporaire créé avec ID: ${user.id}`);
		}

		// Récupérer tous les entraînements de l'utilisateur
		const userTrainings = await prisma.userCourse.findMany({
			where: {
				userId: user.id,
			},
			include: {
				course: true,
				userModules: {
					include: {
						module: true,
					},
				},
			},
		});

		// Formater les données pour le client
		const trainings = userTrainings.map((ut) => ({
			id: ut.course.courseId,
			name: ut.course.name,
			description: ut.course.description,
			imageUrl: ut.course.imageUrl,
			progress: ut.progress,
			startedAt: ut.startedAt,
			lastAccessed: ut.lastAccessed,
			completedAt: ut.completedAt,
			modules: ut.userModules.map((um) => ({
				id: um.module.moduleId,
				title: um.module.title,
				description: um.module.description,
				completed: um.completed,
				score: um.score,
			})),
		}));

		// Si aucun entraînement trouvé, retourner un tableau vide
		return NextResponse.json({
			trainings: trainings.length > 0 ? trainings : [],
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des entraînements:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des entraînements",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
