//app/api/db/wisetrainer/course-details/organization/[organizationId]/[courseId]/route.jsx

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const { courseId, organizationId } = resolvedParams;

		if (!courseId || !organizationId) {
			return NextResponse.json(
				{
					error: "L'identifiant du cours et de l'organisation sont requis",
				},
				{ status: 400 }
			);
		}

		// Vérifiez d'abord si l'organisation existe
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Vérifiez si le cours appartient à cette organisation
		const organizationTraining =
			await prisma.organizationTraining.findFirst({
				where: {
					organizationId: organizationId,
					course: {
						courseId: courseId,
					},
				},
				include: {
					course: true,
				},
			});

		// Si un lien organisation-cours existe, renvoyer les détails du cours
		if (organizationTraining) {
			// Récupérer également les détails des modules
			const modules = await prisma.module.findMany({
				where: {
					courseId: organizationTraining.course.id,
				},
				orderBy: {
					order: "asc",
				},
			});

			return NextResponse.json({
				id: organizationTraining.course.courseId,
				name: organizationTraining.course.name,
				description: organizationTraining.course.description,
				imageUrl: organizationTraining.course.imageUrl,
				category: organizationTraining.course.category,
				difficulty: organizationTraining.course.difficulty,
				duration: organizationTraining.course.duration,
				source: {
					type: "organization",
					organizationId: organizationId,
					name: organization.name,
				},
				modules: modules.map((m) => ({
					id: m.moduleId,
					title: m.title,
					description: m.description,
					order: m.order,
				})),
			});
		}

		// Si aucun lien n'existe, essayez de charger depuis les fichiers de configuration
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

				// Ajouter les informations de l'organisation
				return NextResponse.json({
					...courseData,
					source: {
						type: "organization",
						organizationId: organizationId,
						name: organization.name,
					},
				});
			}
		} catch (error) {
			console.error(
				`Erreur lors de la lecture du fichier de configuration pour ${courseId}:`,
				error
			);
		}

		// Si toujours pas trouvé, renvoyer une erreur
		return NextResponse.json(
			{
				error: `Cours ${courseId} non trouvé pour l'organisation ${organizationId}`,
			},
			{ status: 404 }
		);
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
