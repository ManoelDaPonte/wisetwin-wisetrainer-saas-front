// app/api/db/wisetrainer/unenroll/[userId]/[trainingId]/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
	try {
		const { userId, trainingId } = params;

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

		// Supprimer l'entrainement de l'utilisateur
		await prisma.userTraining.deleteMany({
			where: {
				userId: user.id,
				trainingId: trainingId,
			},
		});

		// Supprimer les réponses aux questionnaires liés à cet entrainement
		await prisma.userResponse.deleteMany({
			where: {
				userId: user.id,
				scenario: {
					trainingId: trainingId,
				},
			},
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error unenrolling from training:", error);
		return NextResponse.json(
			{ error: "Failed to unenroll from training" },
			{ status: 500 }
		);
	}
}
