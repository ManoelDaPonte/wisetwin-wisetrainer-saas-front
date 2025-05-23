//app/api/db/wisetrainer/course-details/[courseId]/route.jsx

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const { courseId } = resolvedParams;

		if (!courseId) {
			return NextResponse.json(
				{ error: "L'identifiant du cours est requis" },
				{ status: 400 }
			);
		}

		// Essayer d'abord de charger depuis les fichiers de configuration
		try {
			const configDir = path.join(
				process.cwd(),
				"lib/config/wisetrainer/courses"
			);
			const configFile = path.join(configDir, `${courseId}.json`);

			// Vérifier si le fichier existe pour ce cours spécifique
			if (fs.existsSync(configFile)) {
				const courseData = JSON.parse(
					fs.readFileSync(configFile, "utf-8")
				);
				return NextResponse.json(courseData);
			}

			// Si le fichier n'existe pas, essayer wisetrainer-template.json
			const templateFile = path.join(
				configDir,
				"wisetrainer-template.json"
			);
			if (fs.existsSync(templateFile)) {
				const templateData = JSON.parse(
					fs.readFileSync(templateFile, "utf-8")
				);

				// Adapter le template avec l'ID du cours demandé
				const adaptedData = {
					...templateData,
					id: courseId,
					name: courseId
						.split("-")
						.map(
							(word) =>
								word.charAt(0).toUpperCase() + word.slice(1)
						)
						.join(" "),
				};

				return NextResponse.json(adaptedData);
			}
		} catch (error) {
			console.error(
				`Erreur lors de la lecture du fichier de configuration pour ${courseId}:`,
				error
			);
		}

		// Si aucun fichier JSON trouvé, essayer la base de données
		const course = await prisma.course.findFirst({
			where: {
				courseId: courseId,
				sourceType: "wisetwin", // Par défaut, nous cherchons les formations WiseTwin
				sourceOrganizationId: null,
			},
			include: {
				modules: true,
			},
		});

		if (course) {
			return NextResponse.json({
				id: course.courseId,
				name: course.name,
				description: course.description,
				imageUrl: course.imageUrl,
				category: course.category,
				difficulty: course.difficulty,
				duration: course.duration,
				modules: course.modules.map((m) => ({
					id: m.moduleId,
					title: m.title,
					description: m.description,
					order: m.order,
				})),
			});
		}

		// Si aucune information n'est trouvée, retourner une structure par défaut
		return NextResponse.json({
			id: courseId,
			name: courseId
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" "),
			description: "Formation interactive",
			imageUrl: "/images/png/placeholder.png",
			category: "Formation",
			difficulty: "Intermédiaire",
			duration: "30 min",
			modules: [
				{
					id: "module1",
					title: "Module 1",
					description: "Premier module",
					order: 1,
				},
				{
					id: "module2",
					title: "Module 2",
					description: "Deuxième module",
					order: 2,
				},
				{
					id: "module3",
					title: "Module 3",
					description: "Troisième module",
					order: 3,
				},
			],
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des détails du cours:",
			error
		);
		return NextResponse.json(
			{ error: "Échec de la récupération des détails du cours" },
			{ status: 500 }
		);
	}
}
