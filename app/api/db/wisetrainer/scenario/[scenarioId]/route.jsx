//app/api/db/wisetrainer/save-questionnaire/route.jsx
import { NextResponse } from "next/server";
import wisetrainerTemplate from "@/lib/config/wisetrainer/courses/wisetrainer-template.json";

export async function GET(request, { params }) {
	try {
		const { scenarioId } = await params;

		if (!scenarioId) {
			return NextResponse.json(
				{ error: "L'identifiant du scénario est requis" },
				{ status: 400 }
			);
		}

		// Trouver le module correspondant dans la configuration
		const module = wisetrainerTemplate.modules.find(
			(m) => m.id === scenarioId
		);

		if (!module) {
			return NextResponse.json(
				{ error: "Scénario non trouvé" },
				{ status: 404 }
			);
		}

		// Formatter les données pour le client
		// Important: ne pas inclure l'information sur les réponses correctes
		const formattedQuestions = module.questions.map((q) => ({
			id: q.id,
			text: q.text,
			type: q.type,
			options: q.options.map((o) => ({
				id: o.id,
				text: o.text,
				// isCorrect n'est pas inclus pour ne pas donner la réponse
			})),
		}));

		const formattedScenario = {
			id: module.id,
			title: module.title,
			description: module.description,
			questions: formattedQuestions,
		};

		return NextResponse.json(formattedScenario);
	} catch (error) {
		console.error("Erreur lors de la récupération du scénario:", error);
		return NextResponse.json(
			{ error: "Échec de la récupération du scénario" },
			{ status: 500 }
		);
	}
}
