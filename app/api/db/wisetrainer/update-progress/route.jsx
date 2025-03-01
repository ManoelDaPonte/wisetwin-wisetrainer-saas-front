// app/api/db/wisetrainer/update-progress/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const { userId, trainingId, progress, completedModule, moduleScore } =
			await request.json();

		// Récupérer l'ID utilisateur basé sur le container Azure
		const user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}

		// Récupérer l'entraînement de l'utilisateur
		let userTraining = await prisma.userTraining.findFirst({
			where: {
				userId: user.id,
				trainingId: trainingId,
			},
		});

		if (!userTraining) {
			// Si l'entraînement n'existe pas encore pour cet utilisateur, le créer
			userTraining = await prisma.userTraining.create({
				data: {
					userId: user.id,
					trainingId: trainingId,
					progress: progress,
					completedModules: [completedModule],
					totalScore: moduleScore,
					lastAccessed: new Date(),
				},
			});
		} else {
			// Mise à jour de l'entraînement existant
			const updatedCompletedModules =
				userTraining.completedModules.includes(completedModule)
					? userTraining.completedModules
					: [...userTraining.completedModules, completedModule];

			userTraining = await prisma.userTraining.update({
				where: {
					id: userTraining.id,
				},
				data: {
					progress: progress,
					completedModules: updatedCompletedModules,
					totalScore: userTraining.totalScore + moduleScore,
					lastAccessed: new Date(),
				},
			});
		}

		return NextResponse.json({ success: true, userTraining });
	} catch (error) {
		console.error("Error updating progress:", error);
		return NextResponse.json(
			{ error: "Failed to update progress" },
			{ status: 500 }
		);
	}
}
