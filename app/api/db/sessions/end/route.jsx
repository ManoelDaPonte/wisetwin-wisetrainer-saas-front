import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Route POST pour terminer une session (compatibilité sendBeacon)
export async function POST(request) {
	try {
		const { userId, sessionId, modulesViewed } = await request.json();

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

		// Déterminer quelle session terminer
		let sessionToEnd;
		if (sessionId) {
			// Si un ID de session est fourni, utiliser celui-là
			sessionToEnd = await prisma.userSession.findFirst({
				where: {
					id: sessionId,
					userId: user.id,
					endTime: null,
				},
			});
		} else {
			// Sinon, prendre la dernière session active
			sessionToEnd = await prisma.userSession.findFirst({
				where: {
					userId: user.id,
					endTime: null,
				},
				orderBy: {
					startTime: "desc",
				},
			});
		}

		if (!sessionToEnd) {
			// Pas d'erreur pour sendBeacon, juste un log serveur
			console.log("Aucune session active trouvée pour", userId);
			return NextResponse.json({
				success: false,
				message: "Aucune session active",
			});
		}

		// Terminer la session
		const endTime = new Date();
		const duration = Math.round(
			(endTime - sessionToEnd.startTime) / (1000 * 60)
		); // Durée en minutes

		const updatedSession = await prisma.userSession.update({
			where: {
				id: sessionToEnd.id,
			},
			data: {
				endTime,
				duration,
				modulesViewed: modulesViewed
					? JSON.stringify(modulesViewed)
					: null,
			},
		});

		// Mettre à jour les statistiques avec le temps passé
		await updateUserStats(user.id, duration);

		return NextResponse.json({
			success: true,
			session: updatedSession,
		});
	} catch (error) {
		console.error("Erreur lors de la fin de la session:", error);
		// Pour sendBeacon, nous retournons toujours un succès
		return NextResponse.json({ success: false, error: error.message });
	}
}

// Fonction auxiliaire pour mettre à jour les statistiques de l'utilisateur
async function updateUserStats(userId, duration) {
	// Même fonction que dans l'autre fichier
	try {
		// Récupérer les statistiques actuelles
		let userStats = await prisma.userStats.findUnique({
			where: {
				userId,
			},
		});

		// Si les statistiques n'existent pas, les créer
		if (!userStats) {
			userStats = await prisma.userStats.create({
				data: {
					userId,
					totalTimeSpent: 0,
					sessionsCompleted: 0,
					questionsAnswered: 0,
					correctAnswers: 0,
				},
			});
		}

		// Mettre à jour les statistiques
		await prisma.userStats.update({
			where: {
				userId,
			},
			data: {
				totalTimeSpent: userStats.totalTimeSpent + duration,
				sessionsCompleted: userStats.sessionsCompleted + 1,
				lastActivity: new Date(),
			},
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour des statistiques:", error);
		throw error;
	}
}
