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

		// Essayer de récupérer les détails du cours depuis la base de données
		const course = await prisma.course.findUnique({
			where: {
				courseId: courseId,
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

		// Si le cours n'existe pas dans la base de données, essayer de charger
		// depuis les fichiers de configuration
		try {
			// Chemin vers les fichiers de configuration des cours
			const configDir = path.join(
				process.cwd(),
				"lib/config/wisetrainer/courses"
			);
			const configFile = path.join(configDir, `${courseId}.json`);

			// Vérifier si le fichier existe
			if (fs.existsSync(configFile)) {
				const configData = JSON.parse(
					fs.readFileSync(configFile, "utf-8")
				);
				return NextResponse.json(configData);
			}

			// Si le fichier n'existe pas, vérifier wisetrainer-template.json
			const templateFile = path.join(
				configDir,
				"wisetrainer-template.json"
			);
			if (fs.existsSync(templateFile)) {
				const templateData = JSON.parse(
					fs.readFileSync(templateFile, "utf-8")
				);

				// Créer une version modifiée du template
				const courseData = {
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

				return NextResponse.json(courseData);
			}
		} catch (error) {
			console.error(
				`Erreur lors de la lecture du fichier de configuration pour ${courseId}:`,
				error
			);
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
