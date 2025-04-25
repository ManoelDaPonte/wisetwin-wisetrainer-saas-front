// app/api/db/wisetrainer/initialize-progress/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const {
			userId,
			courseId,
			sourceType = "wisetwin",
			sourceOrganizationId = null,
		} = await request.json();

		if (!userId || !courseId) {
			return NextResponse.json(
				{ error: "Les paramètres userId et courseId sont requis" },
				{ status: 400 }
			);
		}

		console.log("INFO INITIALISATION API - Paramètres reçus:", {
			userId,
			courseId,
			sourceType,
			sourceOrganizationId,
		});

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

		// Trouver le cours avec la source spécifiée
		let course = await prisma.course.findFirst({
			where: {
				courseId: courseId,
				sourceType: sourceType,
				sourceOrganizationId: sourceOrganizationId,
			},
		});

		console.log(
			"INFO INITIALISATION API - Cours trouvé:",
			course
				? {
						id: course.id,
						courseId: course.courseId,
						sourceType: course.sourceType,
						sourceOrganizationId: course.sourceOrganizationId,
				  }
				: "Aucun cours trouvé"
		);

		if (!course) {
			// Créer un cours par défaut avec la source spécifiée
			course = await prisma.course.create({
				data: {
					courseId: courseId,
					name: courseId
						.split("-")
						.map(
							(word) =>
								word.charAt(0).toUpperCase() + word.slice(1)
						)
						.join(" "),
					description: `Formation interactive sur ${courseId}`,
					imageUrl: "/images/png/placeholder.png",
					category: "Formation",
					difficulty: "Intermédiaire",
					duration: "30 min",
					sourceType: sourceType,
					sourceOrganizationId: sourceOrganizationId,
				},
			});

			console.log("INFO INITIALISATION API - Nouveau cours créé:", {
				id: course.id,
				courseId: course.courseId,
				sourceType: course.sourceType,
				sourceOrganizationId: course.sourceOrganizationId,
			});
		}

		// Vérifier si l'utilisateur est déjà inscrit
		let userCourse = await prisma.userCourse.findFirst({
			where: {
				userId: user.id,
				courseId: course.id,
			},
		});

		// Si non, créer une entrée
		if (!userCourse) {
			userCourse = await prisma.userCourse.create({
				data: {
					userId: user.id,
					courseId: course.id,
					progress: 0,
					startedAt: new Date(),
					lastAccessed: new Date(),
				},
			});

			console.log(
				"INFO INITIALISATION API - Nouvelle inscription créée:",
				{
					id: userCourse.id,
					userId: user.id,
					courseId: course.id,
				}
			);
		} else {
			// Sinon, mettre à jour lastAccessed
			userCourse = await prisma.userCourse.update({
				where: {
					id: userCourse.id,
				},
				data: {
					lastAccessed: new Date(),
				},
			});

			console.log(
				"INFO INITIALISATION API - Inscription existante mise à jour:",
				{
					id: userCourse.id,
					userId: user.id,
					courseId: course.id,
				}
			);
		}

		return NextResponse.json({
			success: true,
			message: "Progression initialisée avec succès",
			userCourse,
			source: {
				type: sourceType,
				organizationId: sourceOrganizationId,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'initialisation:", error);
		return NextResponse.json(
			{
				error: "Échec de l'initialisation de la progression",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
