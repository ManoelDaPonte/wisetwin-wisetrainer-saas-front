// app/api/db/wisetrainer/user-trainings/[userId]/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	const resolvedParams = await params;
	try {
		const { userId } = resolvedParams;

		// Obtenir tous les entrainements de l'utilisateur
		const userTrainings = await prisma.userTraining.findMany({
			where: {
				user: {
					azureContainer: userId,
				},
			},
			include: {
				training: true,
			},
		});

		// Formater les données pour le client
		const trainings = userTrainings.map((ut) => ({
			id: ut.trainingId,
			name: ut.training.name,
			description: ut.training.description,
			difficulty: ut.training.difficulty,
			duration: ut.training.duration,
			category: ut.training.category,
			imageUrl: ut.training.imageUrl,
			progress: ut.progress,
			completedModules: ut.completedModules,
			totalScore: ut.totalScore,
			lastAccessed: ut.lastAccessed,
		}));

		return NextResponse.json({ trainings });
	} catch (error) {
		console.error("Error fetching user trainings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch user trainings" },
			{ status: 500 }
		);
	}
}
