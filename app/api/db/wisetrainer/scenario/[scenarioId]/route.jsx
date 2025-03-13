//app/api/db/wisetrainer/scenario/[scenarioId]/route.jsx

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request, { params }) {
	try {
		const { scenarioId } = await params;

		if (!scenarioId) {
			return NextResponse.json(
				{ error: "L'identifiant du scénario est requis" },
				{ status: 400 }
			);
		}

		// Fonction pour charger un fichier de configuration de cours
		const loadCourseConfig = (courseId) => {
			try {
				const configPath = path.join(
					process.cwd(),
					"lib/config/wisetrainer/courses",
					`${courseId}.json`
				);
				if (fs.existsSync(configPath)) {
					return JSON.parse(fs.readFileSync(configPath, "utf-8"));
				}
				return null;
			} catch (error) {
				console.error(
					`Erreur lors du chargement du fichier de configuration ${courseId}:`,
					error
				);
				return null;
			}
		};

		// Examiner tous les fichiers de configuration disponibles pour trouver le module
		const courseFiles = [
			"wisetrainer-template.json",
			"WiseTrainer_01.json",
			"WiseTrainer_02.json",
			"WiseTrainer_03.json",
		];

		let foundModule = null;
		let courseConfig = null;

		// Parcourir les fichiers de configuration jusqu'à trouver le module
		for (const courseFile of courseFiles) {
			const courseId = courseFile.replace(".json", "");
			courseConfig = loadCourseConfig(courseId);

			if (courseConfig) {
				foundModule = courseConfig.modules.find(
					(m) => m.id === scenarioId
				);
				if (foundModule) break;
			}
		}

		if (!foundModule) {
			return NextResponse.json(
				{ error: "Scénario non trouvé" },
				{ status: 404 }
			);
		}

		// Formatter les données pour le client
		// Important: ne pas inclure l'information sur les réponses correctes
		const formattedQuestions = foundModule.questions.map((q) => ({
			id: q.id,
			text: q.text,
			type: q.type,
			image: q.image, // Ajouter le champ image ici
			options: q.options.map((o) => ({
				id: o.id,
				text: o.text,
				// isCorrect n'est pas inclus pour ne pas donner la réponse
			})),
		}));

		const formattedScenario = {
			id: foundModule.id,
			title: foundModule.title,
			description: foundModule.description,
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
