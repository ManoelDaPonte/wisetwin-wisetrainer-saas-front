import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

const prisma = new PrismaClient();

/**
 * API optimisée qui combine plusieurs endpoints en un seul pour éviter les appels redondants
 * Inclut :
 * - Données utilisateur
 * - Formations avec détails enrichis (si demandées)
 * - Statistiques (si demandées)
 */
export async function GET(request) {
	try {
		// Vérifier l'authentification
		const session = await auth0.getSession();
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const { sub } = session.user;

		// Récupérer l'URL de la requête pour analyser les paramètres
		const { searchParams } = new URL(request.url);

		// Paramètres pour contrôler ce qui est inclus dans la réponse
		const includeTrainings = searchParams.get("trainings") === "true";
		const includeStats = searchParams.get("stats") === "true";

		// Récupérer l'utilisateur
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: sub,
			},
			include: {
				organizations: {
					include: {
						organization: true,
					},
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Préparer les données de base de l'utilisateur
		const userData = {
			id: user.id,
			auth0Id: user.auth0Id,
			email: user.email,
			name: user.name,
			azureContainer: user.azureContainer,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
			organizations: user.organizations.map((membership) => ({
				id: membership.organization.id,
				name: membership.organization.name,
				role: membership.role,
				azureContainer: membership.organization.azureContainer,
			})),
			auth0: {
				sub: session.user.sub,
				email: session.user.email,
				name: session.user.name,
				picture: session.user.picture,
			},
		};

		// Données à retourner
		const responseData = {
			success: true,
			user: userData,
		};

		// Si demandé, ajouter les formations avec les détails enrichis
		if (includeTrainings) {
			// Récupérer les formations de l'utilisateur
			const userCourses = await prisma.userCourse.findMany({
				where: {
					userId: user.id,
				},
				include: {
					course: true,
					userModules: {
						include: {
							module: true,
						},
					},
				},
				orderBy: {
					lastAccessed: "desc",
				},
			});

			// Transformer les formations avec les détails
			const trainings = await Promise.all(
				userCourses.map(async (userCourse) => {
					// Vérifier si c'est une formation d'organisation
					let source = {
						type: userCourse.course.sourceType || "wisetwin",
						name: "WiseTwin",
					};

					if (
						userCourse.course.sourceType === "organization" &&
						userCourse.course.sourceOrganizationId
					) {
						// Récupérer les détails de l'organisation
						try {
							const organization =
								await prisma.organization.findUnique({
									where: {
										id: userCourse.course
											.sourceOrganizationId,
									},
									select: {
										id: true,
										name: true,
										azureContainer: true,
									},
								});

							if (organization) {
								source = {
									type: "organization",
									organizationId: organization.id,
									name: organization.name,
									containerName: organization.azureContainer,
								};
							}
						} catch (error) {
							console.warn(
								`Erreur lors de la récupération des détails de l'organisation pour le cours ${userCourse.course.id}:`,
								error
							);
						}
					}

					// Transformer les modules utilisateur
					const modules = userCourse.userModules.map(
						(userModule) => ({
							id: userModule.module.moduleId,
							title: userModule.module.title,
							description: userModule.module.description,
							completed: userModule.completed,
							score: userModule.score,
							order: userModule.module.order,
						})
					);

					// Générer l'ID composite pour distinguer les formations de même ID mais de sources différentes
					const compositeId = `${userCourse.course.courseId}__${
						source.type
					}__${source.organizationId || "wisetwin"}`;

					// Récupérer les détails supplémentaires de la formation
					let imageUrl =
						userCourse.course.imageUrl ||
						WISETRAINER_CONFIG.DEFAULT_IMAGE;
					let description = userCourse.course.description || "";

					try {
						// Chemin adapté au type de source
						const coursePath =
							source.type === "organization"
								? `${userCourse.course.courseId}.json`
								: `${WISETRAINER_CONFIG.COURSES_PATH}/${userCourse.course.courseId}.json`;

						// Pour une implémentation complète, il faudrait récupérer les détails depuis les fichiers JSON
						// Ici, on utilise simplement les données de base disponibles
					} catch (error) {
						console.warn(
							`Erreur lors de la récupération des détails pour ${userCourse.course.courseId}:`,
							error
						);
					}

					return {
						id: userCourse.course.courseId,
						compositeId,
						name: userCourse.course.name,
						description: description,
						imageUrl: imageUrl,
						category: userCourse.course.category,
						difficulty: userCourse.course.difficulty,
						duration: userCourse.course.duration,
						progress: userCourse.progress,
						lastAccessed: userCourse.lastAccessed,
						startedAt: userCourse.startedAt,
						completedAt: userCourse.completedAt,
						modules,
						completedModules: modules.filter((m) => m.completed)
							.length,
						totalModules: modules.length,
						source,
						// URL pour accéder à la formation (basée sur la source)
						trainingUrl:
							source.type === "organization"
								? `/wisetrainer/${source.organizationId}/${userCourse.course.courseId}`
								: `/wisetrainer/${userCourse.course.courseId}`,
					};
				})
			);

			responseData.trainings = trainings;
		}

		// Si demandé, ajouter les statistiques utilisateur
		if (includeStats) {
			// Récupérer les statistiques de la base de données
			const userStats = await prisma.userStats.findUnique({
				where: {
					userId: user.id,
				},
			});

			// Valeurs par défaut si aucune statistique trouvée
			const completedTrainings = responseData.trainings
				? responseData.trainings.filter((t) => t.progress === 100)
						.length
				: 0;

			const totalTrainings = responseData.trainings
				? responseData.trainings.length
				: 0;

			const completionRate =
				totalTrainings > 0
					? Math.round((completedTrainings / totalTrainings) * 100)
					: 0;

			if (userStats) {
				// Calculer le taux de réussite
				const successRate =
					userStats.questionsAnswered > 0
						? Math.round(
								(userStats.correctAnswers /
									userStats.questionsAnswered) *
									100
						  )
						: 0;

				// Convertir les minutes en heures (minimum 1h)
				const totalTimeInHours = userStats.totalTimeSpent
					? Math.max(1, Math.round(userStats.totalTimeSpent / 60))
					: 0;

				responseData.stats = {
					digitalTwin: 0, // Pas encore implémenté
					wiseTrainer: totalTrainings,
					totalTime: totalTimeInHours,
					completionRate: userStats.completionRate || completionRate,
					questionsAnswered: userStats.questionsAnswered || 0,
					correctAnswers: userStats.correctAnswers || 0,
					successRate,
					averageScore: userStats.averageScore || 0,
					sessionsCompleted: userStats.sessionsCompleted || 0,
				};
			} else {
				// Statistiques par défaut si aucune trouvée
				responseData.stats = {
					digitalTwin: 0,
					wiseTrainer: totalTrainings,
					totalTime: 1, // Valeur minimale pour éviter de montrer 0h
					completionRate,
					questionsAnswered: 0,
					correctAnswers: 0,
					successRate: 0,
					averageScore: 0,
					sessionsCompleted: 0,
				};
			}
		}

		return NextResponse.json(responseData);
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des données utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des données utilisateur",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
