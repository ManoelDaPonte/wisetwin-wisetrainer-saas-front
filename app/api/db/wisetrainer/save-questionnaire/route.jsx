//app/api/db/wisetrainer/save-questionnaire/route.jsx

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const { userId, questionnaireId, responses, trainingId } =
			await request.json();

		if (!userId || !questionnaireId || !responses) {
			return NextResponse.json(
				{
					error: "Toutes les informations requises ne sont pas fournies",
				},
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

		// Déterminer le cours auquel appartient ce module
		// Si trainingId est fourni, l'utiliser
		// Sinon, chercher dans tous les fichiers disponibles
		let foundModule = null;
		let courseConfig = null;
		let courseId = trainingId;

		if (courseId) {
			// Charger la configuration du cours spécifié
			courseConfig = loadCourseConfig(courseId);
			if (courseConfig) {
				foundModule = courseConfig.modules.find(
					(m) => m.id === questionnaireId
				);
			}
		} else {
			// Chercher dans tous les fichiers de configuration disponibles
			const courseFiles = [
				"WiseTrainer_01.json",
				"wisetrainer-template.json",
			];

			for (const courseFile of courseFiles) {
				courseId = courseFile.replace(".json", "");
				courseConfig = loadCourseConfig(courseId);

				if (courseConfig) {
					foundModule = courseConfig.modules.find(
						(m) => m.id === questionnaireId
					);
					if (foundModule) break;
				}
			}
		}

		if (!foundModule) {
			return NextResponse.json(
				{
					error: "Module non trouvé dans les configurations disponibles",
				},
				{ status: 404 }
			);
		}

		// Récupérer ou créer l'utilisateur
		let user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		// Si l'utilisateur n'existe pas, le créer
		if (!user) {
			console.log(
				`Utilisateur avec container ${userId} non trouvé, création d'un utilisateur temporaire`
			);

			user = await prisma.user.create({
				data: {
					auth0Id: `temp-${userId}`,
					email: `temp-${userId}@example.com`,
					name: "Utilisateur Temporaire",
					azureContainer: userId,
				},
			});

			console.log(`Utilisateur temporaire créé avec ID: ${user.id}`);
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

		// Vérifier si le cours existe en DB
		let courseDb = await prisma.course.findUnique({
			where: {
				courseId: courseId,
			},
		});

		// Si le cours n'existe pas en DB, le créer
		if (!courseDb) {
			courseDb = await prisma.course.create({
				data: {
					courseId: courseId,
					name: courseConfig.name,
					description: courseConfig.description,
					imageUrl:
						courseConfig.imageUrl || "/images/png/placeholder.png",
					category: courseConfig.category || "Formation",
					difficulty: courseConfig.difficulty || "Intermédiaire",
					duration: courseConfig.duration || "30 min",
				},
			});
		}

		// Vérifier si le module existe en DB
		let moduleEntity = await prisma.module.findFirst({
			where: {
				moduleId: questionnaireId,
				course: {
					courseId: courseId,
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
