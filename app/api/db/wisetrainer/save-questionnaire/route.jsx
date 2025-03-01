//app/api/db/wisetrainer/save-questionnaire/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import wisetrainerTemplate from "@/lib/config/wisetrainer/courses/wisetrainer-template.json";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const { userId, questionnaireId, responses } = await request.json();

		if (!userId || !questionnaireId || !responses) {
			return NextResponse.json(
				{
					error: "Toutes les informations requises ne sont pas fournies",
				},
				{ status: 400 }
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

			// Créer un utilisateur temporaire avec des informations minimales
			user = await prisma.user.create({
				data: {
					auth0Id: `temp-${userId}`, // ID temporaire
					email: `temp-${userId}@example.com`, // Email temporaire
					name: "Utilisateur Temporaire",
					azureContainer: userId,
				},
			});

			console.log(`Utilisateur temporaire créé avec ID: ${user.id}`);
		}

		// Trouver le module correspondant dans la configuration
		const module = wisetrainerTemplate.modules.find(
			(m) => m.id === questionnaireId
		);

		if (!module) {
			return NextResponse.json(
				{ error: "Questionnaire non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier les réponses et calculer le score
		const evaluatedResponses = responses.map((response) => {
			const question = module.questions.find(
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
				// Toutes les bonnes réponses doivent être sélectionnées, et uniquement celles-ci
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

		// Vérifier si un scénario avec cet ID existe déjà
		let scenario = await prisma.scenario.findFirst({
			where: {
				scenarioId: questionnaireId,
			},
		});

		// Si le scénario n'existe pas, vérifier d'abord si le cours existe
		if (!scenario) {
			// Vérifier si le cours existe
			let course = await prisma.course.findUnique({
				where: {
					courseId: "wisetrainer-template",
				},
			});

			// Si le cours n'existe pas, le créer
			if (!course) {
				course = await prisma.course.create({
					data: {
						courseId: "wisetrainer-template",
						name: wisetrainerTemplate.name,
						description: wisetrainerTemplate.description,
						imageUrl: wisetrainerTemplate.imageUrl,
						category: wisetrainerTemplate.category,
						difficulty: wisetrainerTemplate.difficulty,
						duration: wisetrainerTemplate.duration,
					},
				});
			}

			// Vérifier si le module existe
			let moduleEntity = await prisma.module.findFirst({
				where: {
					moduleId: questionnaireId,
					course: {
						courseId: "wisetrainer-template",
					},
				},
			});

			// Si le module n'existe pas, le créer
			if (!moduleEntity) {
				const moduleData = wisetrainerTemplate.modules.find(
					(m) => m.id === questionnaireId
				);

				if (moduleData) {
					moduleEntity = await prisma.module.create({
						data: {
							moduleId: moduleData.id,
							title: moduleData.title,
							description: moduleData.description,
							order: moduleData.order,
							course: {
								connect: {
									id: course.id,
								},
							},
						},
					});
				}
			}

			// Créer le scénario
			scenario = await prisma.scenario.create({
				data: {
					scenarioId: questionnaireId,
					title: module.title,
					description: module.description,
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
						userId: user.id, // Utiliser l'ID de l'utilisateur trouvé ou créé
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
