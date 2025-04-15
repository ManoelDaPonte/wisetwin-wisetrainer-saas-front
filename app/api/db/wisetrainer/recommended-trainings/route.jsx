//app/api/db/wisetrainer/recommended-trainings/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export async function GET(request) {
	try {
		// Récupérer les formations les plus populaires (celles avec le plus d'utilisateurs inscrits)
		const popularCourses = await prisma.course.findMany({
			take: 6, // Limiter à 6 formations
			orderBy: {
				userCourses: {
					_count: "desc", // Ordonner par nombre d'inscriptions décroissant
				},
			},
			include: {
				_count: {
					select: { userCourses: true },
				},
			},
		});

		// Si aucune formation n'est trouvée en base de données, charger à partir des fichiers de configuration
		if (popularCourses.length === 0) {
			const configDir = path.join(
				process.cwd(),
				"lib/config/wisetrainer/courses"
			);

			// Lire tous les fichiers de configuration de cours
			const courseFiles = fs
				.readdirSync(configDir)
				.filter(
					(file) =>
						file.endsWith(".json") &&
						file !== "wisetrainer-template.json"
				);

			const recommendedCourses = [];

			// Extraire les données de cours et les ajouter à la liste
			for (const file of courseFiles.slice(0, 6)) {
				// Prendre les 6 premiers
				try {
					const courseData = JSON.parse(
						fs.readFileSync(path.join(configDir, file), "utf8")
					);
					recommendedCourses.push({
						id: courseData.id,
						courseId: courseData.id,
						name: courseData.name,
						description: courseData.description,
						imageUrl:
							courseData.imageUrl ||
							WISETRAINER_CONFIG.DEFAULT_IMAGE,
						category: courseData.category || "Formation",
						difficulty: courseData.difficulty || "Intermédiaire",
						duration: courseData.duration || "30 min",
					});
				} catch (error) {
					console.error(
						`Erreur lors de la lecture du fichier ${file}:`,
						error
					);
				}
			}

			return NextResponse.json({ trainings: recommendedCourses });
		}

		// Formater les résultats
		const formattedCourses = popularCourses.map((course) => ({
			id: course.id,
			courseId: course.courseId,
			name: course.name,
			description: course.description,
			imageUrl: course.imageUrl || WISETRAINER_CONFIG.DEFAULT_IMAGE,
			category: course.category,
			difficulty: course.difficulty,
			duration: course.duration,
			enrolledCount: course._count.userCourses,
		}));

		return NextResponse.json({ trainings: formattedCourses });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations recommandées:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des formations recommandées",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
