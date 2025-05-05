//app/api/db/wisetrainer/scenario/[courseId]/[scenarioId]/route.jsx
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
	try {
		const { courseId, scenarioId } = await params;

		if (!courseId || !scenarioId) {
			return NextResponse.json(
				{
					error: "Les identifiants du cours et du scénario sont requis",
				},
				{ status: 400 }
			);
		}

		// Charger le fichier de configuration du cours spécifié
		const configPath = path.join(
			process.cwd(),
			"lib/config/wisetrainer/courses",
			`${courseId}.json`
		);

		// Vérifier si le fichier existe
		if (!fs.existsSync(configPath)) {
			return NextResponse.json(
				{ error: `Configuration du cours ${courseId} non trouvée` },
				{ status: 404 }
			);
		}

		// Charger la configuration
		const courseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

		// Trouver le module correspondant au scénario dans ce cours uniquement
		const foundModule = courseConfig.modules.find(
			(m) => m.id === scenarioId
		);

		if (!foundModule) {
			return NextResponse.json(
				{
					error: `Scénario ${scenarioId} non trouvé dans le cours ${courseId}`,
				},
				{ status: 404 }
			);
		}

		// Vérifier si c'est un module de type guide
		if (foundModule.type === "guide") {
			// Pour un guide, inclure la structure complète
			return NextResponse.json({
				id: foundModule.id,
				title: foundModule.title,
				description: foundModule.description,
				type: "guide",
				educational: foundModule.educational || null,
				sequenceButtons: foundModule.sequenceButtons || [],
				steps: foundModule.steps || [],
				courseId: courseId, // Inclure l'ID du cours pour référence
			});
		}

		// Vérifier si c'est un module de type information
		if (foundModule.type === "information") {
			// Pour un module d'information, retourner les données directement
			return NextResponse.json({
				id: foundModule.id,
				title: foundModule.title,
				description: foundModule.description,
				type: "information",
				modalData: {
					imageUrl: foundModule.modalData?.imageUrl || null,
					keyToPress: foundModule.modalData?.keyToPress || null,
					animationToPlay: foundModule.modalData?.animationToPlay || null
				},
				courseId: courseId, // Inclure l'ID du cours pour référence
			});
		}

		// Vérifier que le module a une propriété questions avant d'y accéder
		if (!foundModule.questions) {
			return NextResponse.json(
				{ error: `Le module ${scenarioId} n'a pas de questions définies` },
				{ status: 400 }
			);
		}

		// Pour un questionnaire standard, formatter les données
		const formattedQuestions = foundModule.questions.map((q) => ({
			id: q.id,
			text: q.text,
			type: q.type,
			image: q.image,
			options: q.options.map((o) => ({
				id: o.id,
				text: o.text,
			})),
		}));

		const formattedScenario = {
			id: foundModule.id,
			title: foundModule.title,
			description: foundModule.description,
			questions: formattedQuestions,
			courseId: courseId, // Inclure l'ID du cours pour référence
		};

		return NextResponse.json(formattedScenario);
	} catch (error) {
		console.error("Erreur lors de la récupération du scénario:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération du scénario",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}