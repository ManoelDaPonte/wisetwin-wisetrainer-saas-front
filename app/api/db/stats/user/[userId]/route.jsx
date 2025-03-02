//app/api/db/stats/user/[userId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Route pour obtenir les statistiques d'un utilisateur
export async function GET(request, { params }) {
	try {
		const { userId } = await params;

		if (!userId) {
			return NextResponse.json(
				{ error: "L'identifiant de l'utilisateur est requis" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur basé sur son container Azure
		const user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer les statistiques de l'utilisateur
		let userStats = await prisma.userStats.findUnique({
			where: {
				userId: user.id,
			},
		});

		// Si les statistiques n'existent pas, les créer
		if (!userStats) {
			userStats = await prisma.userStats.create({
				data: {
					userId: user.id,
					totalTimeSpent: 0,
					sessionsCompleted: 0,
					questionsAnswered: 0,
					correctAnswers: 0,
				},
			});
		}

		// Compter les cours actifs
		const activeCourses = await prisma.userCourse.count({
			where: {
				userId: user.id,
			},
		});

		// Calculer le taux de complétion moyen
		const courses = await prisma.userCourse.findMany({
			where: {
				userId: user.id,
			},
		});

		const completionRate =
			courses.length > 0
				? Math.round(
						courses.reduce(
							(sum, course) => sum + course.progress,
							0
						) / courses.length
				  )
				: 0;

		// Calculer le taux de réussite des réponses
		const successRate =
			userStats.questionsAnswered > 0
				? Math.round(
						(userStats.correctAnswers /
							userStats.questionsAnswered) *
							100
				  )
				: 0;

		// Enrichir les statistiques avec des informations supplémentaires
		const enrichedStats = {
			...userStats,
			activeCourses,
			completionRate,
			successRate,
			// Convertir les minutes en heures pour l'affichage
			totalTimeInHours: Math.round(userStats.totalTimeSpent / 60),
		};

		return NextResponse.json(enrichedStats);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des statistiques:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des statistiques",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Route pour mettre à jour les statistiques d'un utilisateur
export async function POST(request, { params }) {
	try {
		const { userId } = await params;
		const data = await request.json();

		if (!userId) {
			return NextResponse.json(
				{ error: "L'identifiant de l'utilisateur est requis" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur
		const user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer les statistiques actuelles
		let userStats = await prisma.userStats.findUnique({
			where: {
				userId: user.id,
			},
		});

		// Si les statistiques n'existent pas, les créer
		if (!userStats) {
			userStats = await prisma.userStats.create({
				data: {
					userId: user.id,
					totalTimeSpent: 0,
					sessionsCompleted: 0,
					questionsAnswered: 0,
					correctAnswers: 0,
				},
			});
		}

		// Mettre à jour les statistiques
		const updatedStats = await prisma.userStats.update({
			where: {
				userId: user.id,
			},
			data: {
				// Incrémenter les valeurs existantes avec les nouvelles valeurs
				totalTimeSpent:
					userStats.totalTimeSpent + (data.timeSpent || 0),
				sessionsCompleted:
					userStats.sessionsCompleted + (data.sessionsCompleted || 0),
				questionsAnswered:
					userStats.questionsAnswered + (data.questionsAnswered || 0),
				correctAnswers:
					userStats.correctAnswers + (data.correctAnswers || 0),
				lastActivity: new Date(),
			},
		});

		return NextResponse.json({
			success: true,
			stats: updatedStats,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour des statistiques:", error);
		return NextResponse.json(
			{
				error: "Échec de la mise à jour des statistiques",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
