// app/api/db/wisetrainer/save-questionnaire/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const { userId, trainingId, questionnaireId, responses, score } =
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

		// Enregistrer chaque réponse de l'utilisateur
		const savedResponses = await Promise.all(
			responses.map(async (response) => {
				return prisma.userResponse.create({
					data: {
						userId: user.id,
						questionId: response.questionId,
						scenarioId: questionnaireId,
						selectedAnswers: response.selectedAnswers,
						isCorrect: response.isCorrect,
						score: score,
					},
				});
			})
		);

		return NextResponse.json({ success: true, savedResponses });
	} catch (error) {
		console.error("Error saving questionnaire responses:", error);
		return NextResponse.json(
			{ error: "Failed to save responses" },
			{ status: 500 }
		);
	}
}
