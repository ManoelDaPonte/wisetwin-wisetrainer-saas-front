// app/api/db/wisetrainer/scenario/[scenarioId]/route.js
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const { scenarioId } = params;

		// Récupérer le scénario avec ses questions et options
		const scenario = await prisma.scenario.findUnique({
			where: {
				id: scenarioId,
			},
			include: {
				questions: {
					include: {
						options: true,
					},
				},
			},
		});

		if (!scenario) {
			return NextResponse.json(
				{ error: "Scenario not found" },
				{ status: 404 }
			);
		}

		// Formater les données pour le client
		const formattedQuestions = scenario.questions.map((q) => ({
			id: q.id,
			text: q.text,
			correctAnswerId: q.correctAnswerId,
			correctAnswerIds: q.correctAnswerIds,
			type: q.type,
			explanation: q.explanation,
			options: q.options.map((o) => ({
				id: o.id,
				text: o.text,
				isCorrect: o.isCorrect,
			})),
		}));

		const formattedScenario = {
			id: scenario.id,
			title: scenario.title,
			description: scenario.description,
			questions: formattedQuestions,
		};

		return NextResponse.json(formattedScenario);
	} catch (error) {
		console.error("Error fetching scenario:", error);
		return NextResponse.json(
			{ error: "Failed to fetch scenario" },
			{ status: 500 }
		);
	}
}
