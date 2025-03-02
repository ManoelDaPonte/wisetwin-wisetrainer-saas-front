//app/api/db/achievements/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Route pour obtenir tous les accomplissements disponibles
export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");

		// Récupérer tous les accomplissements
		const achievements = await prisma.achievement.findMany({
			orderBy: {
				title: "asc",
			},
		});

		// Si un userId est fourni, récupérer aussi les accomplissements de l'utilisateur
		if (userId) {
			const userAchievements = await prisma.userAchievement.findMany({
				where: {
					user: {
						azureContainer: userId,
					},
				},
				include: {
					achievement: true,
				},
			});

			// Enrichir les données des accomplissements avec l'état de déblocage pour l'utilisateur
			const enrichedAchievements = achievements.map((achievement) => {
				const userAchievement = userAchievements.find(
					(ua) => ua.achievementId === achievement.id
				);
				return {
					...achievement,
					unlocked: !!userAchievement,
					unlockedAt: userAchievement?.unlockedAt || null,
				};
			});

			return NextResponse.json({ achievements: enrichedAchievements });
		}

		return NextResponse.json({ achievements });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des accomplissements:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des accomplissements",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Route pour créer un nouvel accomplissement (admin uniquement)
export async function POST(request) {
	try {
		const data = await request.json();

		// Vérification des données requises
		if (
			!data.achievementId ||
			!data.title ||
			!data.description ||
			!data.iconName ||
			!data.criteria
		) {
			return NextResponse.json(
				{ error: "Données incomplètes" },
				{ status: 400 }
			);
		}

		// Créer l'accomplissement
		const achievement = await prisma.achievement.create({
			data: {
				achievementId: data.achievementId,
				title: data.title,
				description: data.description,
				iconName: data.iconName,
				criteria: data.criteria,
			},
		});

		return NextResponse.json({
			success: true,
			achievement,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la création de l'accomplissement:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la création de l'accomplissement",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
