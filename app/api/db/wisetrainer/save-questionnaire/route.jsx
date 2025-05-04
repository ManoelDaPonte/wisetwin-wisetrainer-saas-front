//app/api/db/wisetrainer/save-questionnaire/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const {
			userId,
			questionnaireId,
			responses,
			trainingId,
			sourceType = "wisetwin",
			sourceOrganizationId = null,
		} = await request.json();

		if (!userId || !questionnaireId || !responses || !trainingId) {
			return NextResponse.json(
				{
					error: "Toutes les informations requises ne sont pas fournies",
				},
				{ status: 400 }
			);
		}

		console.log("Sauvegarde des réponses avec source:", {
			trainingId,
			sourceType,
			sourceOrganizationId,
		});

		// Utiliser directement le trainingId fourni pour charger la configuration du cours
		const configPath = path.join(
			process.cwd(),
			"lib/config/wisetrainer/courses",
			`${trainingId}.json`
		);

		// Vérifier si le fichier existe
		if (!fs.existsSync(configPath)) {
			return NextResponse.json(
				{ error: `Configuration du cours ${trainingId} non trouvée` },
				{ status: 404 }
			);
		}

		// Charger la configuration du cours
		const courseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

		// Trouver le module correspondant au questionnaire dans ce cours uniquement
		const foundModule = courseConfig.modules.find(
			(m) => m.id === questionnaireId
		);

		if (!foundModule) {
			return NextResponse.json(
				{
					error: `Module ${questionnaireId} non trouvé dans le cours ${trainingId}`,
				},
				{ status: 404 }
			);
		}

		// Récupérer l'utilisateur
		let user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{
					error: "Utilisateur non trouvé. Veuillez vous connecter à votre compte.",
				},
				{ status: 404 }
			);
		}

		// Vérifier si le cours existe en DB avec la source spécifiée
		let courseDb = await prisma.course.findFirst({
			where: {
				courseId: trainingId,
				sourceType: sourceType,
				sourceOrganizationId: sourceOrganizationId,
			},
		});

		// Si le cours n'existe pas en DB, le créer
		if (!courseDb) {
			courseDb = await prisma.course.create({
				data: {
					courseId: trainingId,
					name: courseConfig.name,
					description: courseConfig.description,
					imageUrl:
						courseConfig.imageUrl || "/images/png/placeholder.png",
					category: courseConfig.category || "Formation",
					difficulty: courseConfig.difficulty || "Intermédiaire",
					duration: courseConfig.duration || "30 min",
					sourceType: sourceType,
					sourceOrganizationId: sourceOrganizationId,
				},
			});
		}

		// Vérifier les réponses et calculer le score
		const evaluatedResponses = responses.map((response) => {
			const question = foundModule.questions.find(
				(q) => q.id === response.questionId
			);

			if (!question) {
				return {
					...response,
					isCorrect: false,
					correctAnswers: [],
				};
			}

			let isCorrect = false;
			const correctOptions = question.options
				.filter((o) => o.isCorrect)
				.map((o) => o.id);

			if (question.type === "SINGLE") {
				// Pour les questions à choix unique
				isCorrect =
					response.selectedAnswers.length === 1 &&
					correctOptions.includes(response.selectedAnswers[0]);
			} else {
				// Pour les questions à choix multiple
				isCorrect =
					response.selectedAnswers.length === correctOptions.length &&
					response.selectedAnswers.every((a) =>
						correctOptions.includes(a)
					);
			}

			return {
				...response,
				isCorrect,
				correctAnswers: correctOptions,
			};
		});

		// Calculer le score final
		const finalScore = Math.round(
			(evaluatedResponses.filter((r) => r.isCorrect).length /
				evaluatedResponses.length) *
				100
		);

		// Vérifier si le module existe en DB
		let moduleEntity = await prisma.module.findFirst({
			where: {
				moduleId: questionnaireId,
				course: {
					courseId: trainingId,
				},
			},
		});

		// Si le module n'existe pas en DB, le créer
		if (!moduleEntity) {
			moduleEntity = await prisma.module.create({
				data: {
					moduleId: foundModule.id,
					title: foundModule.title,
					description: foundModule.description,
					order: foundModule.order || 1,
					course: {
						connect: {
							id: courseDb.id,
						},
					},
				},
			});
		}

		// Vérifier si un scénario avec cet ID existe déjà
		let scenario = await prisma.scenario.findFirst({
			where: {
				scenarioId: questionnaireId,
				module: {
					moduleId: questionnaireId,
					course: {
						courseId: trainingId,
					},
				},
			},
		});

		// Si le scénario n'existe pas, le créer
		if (!scenario) {
			scenario = await prisma.scenario.create({
				data: {
					scenarioId: questionnaireId,
					title: foundModule.title,
					description: foundModule.description,
					module: {
						connect: {
							id: moduleEntity.id,
						},
					},
				},
			});
		}

		// Enregistrer les réponses dans la base de données
		const savedResponses = await Promise.all(
			evaluatedResponses.map(async (response) => {
				return prisma.userResponse.create({
					data: {
						userId: user.id,
						scenarioId: scenario.id,
						questionId: response.questionId,
						selectedAnswers: response.selectedAnswers,
						isCorrect: response.isCorrect,
						score: finalScore,
					},
				});
			})
		);

		return NextResponse.json({
			success: true,
			score: finalScore,
			responses: evaluatedResponses,
		});
	} catch (error) {
		console.error("Erreur lors de l'enregistrement des réponses:", error);
		return NextResponse.json(
			{
				error: "Échec de l'enregistrement des réponses",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
