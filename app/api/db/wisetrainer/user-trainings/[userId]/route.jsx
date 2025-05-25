// app/api/db/wisetrainer/user-trainings/[userId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const resolvedParams = await params;
		const { userId } = resolvedParams;
		
		// Récupérer les paramètres de contexte depuis les query params
		const { searchParams } = new URL(request.url);
		const sourceContainer = searchParams.get('sourceContainer');
		const contextType = searchParams.get('contextType');

		if (!userId) {
			return NextResponse.json(
				{ error: "L'identifiant de l'utilisateur est requis" },
				{ status: 400 }
			);
		}

		// Déterminer si c'est un UUID ou un container name
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		let user;

		if (uuidRegex.test(userId)) {
			// C'est un UUID, chercher par ID
			user = await prisma.user.findUnique({
				where: {
					id: userId,
				},
			});
		} else {
			// C'est un container name (compatibilité)
			user = await prisma.user.findFirst({
				where: {
					azureContainer: userId,
				},
			});
		}

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer toutes les formations de l'utilisateur
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

		// Transformer les données pour le client
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
									id: userCourse.course.sourceOrganizationId,
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
				const modules = userCourse.userModules.map((userModule) => ({
					id: userModule.module.moduleId,
					title: userModule.module.title,
					description: userModule.module.description,
					completed: userModule.completed,
					score: userModule.score,
					order: userModule.module.order,
				}));

				// Calculer le score moyen basé sur les modules complétés
				const completedModules = modules.filter(m => m.completed);
				const averageScore = completedModules.length > 0 
					? Math.round(completedModules.reduce((sum, m) => sum + m.score, 0) / completedModules.length)
					: 0;

				// Déterminer le statut de la formation selon la logique métier
				let status = 'in_progress';
				let statusLabel = 'En cours';
				let canRestart = false;

				if (userCourse.progress === 100) {
					if (averageScore >= 80) {
						status = 'completed';
						statusLabel = 'Validée';
					} else {
						status = 'failed';
						statusLabel = 'Échec';
						canRestart = true; // Proposer de recommencer
					}
				}

				// Générer l'ID composite pour distinguer les formations de même ID mais de sources différentes
				const compositeId = `${userCourse.course.courseId}__${
					source.type
				}__${source.organizationId || "wisetwin"}`;

				return {
					id: userCourse.course.courseId,
					compositeId,
					name: userCourse.course.name,
					description: userCourse.course.description,
					imageUrl: userCourse.course.imageUrl,
					category: userCourse.course.category,
					difficulty: userCourse.course.difficulty,
					duration: userCourse.course.duration,
					progress: userCourse.progress,
					score: averageScore,
					status: status, // 'in_progress', 'completed', 'failed'
					statusLabel: statusLabel,
					canRestart: canRestart,
					lastAccessed: userCourse.lastAccessed,
					startedAt: userCourse.startedAt,
					completedAt: userCourse.completedAt,
					modules,
					completedModules: completedModules.length,
					totalModules: modules.length,
					source,
					// URL pour accéder à la formation
					trainingUrl: `/wisetrainer/${userCourse.course.courseId}`,
				};
			})
		);

		// Filtrer selon le contexte
		let filteredTrainings = trainings;
		
		if (contextType === 'personal') {
			// Mode personnel : seulement les formations inscrites à titre personnel
			// (pas d'organisationId dans la source)
			filteredTrainings = trainings.filter(t => 
				t.source.type !== 'organization'
			);
		} else if (contextType === 'organization' && sourceContainer) {
			// Mode organisation : seulement les formations de cette organisation
			filteredTrainings = trainings.filter(t => 
				t.source.type === 'organization' && 
				t.source.containerName === sourceContainer
			);
		} else if (sourceContainer) {
			// Filtrage legacy par sourceContainer seulement
			filteredTrainings = trainings.filter(t => {
				// Pour les formations personnelles, vérifier si le container correspond
				if (t.source.type !== 'organization' && sourceContainer === user.azureContainer) {
					return true;
				}
				// Pour les formations d'organisation, vérifier le container
				return t.source.containerName === sourceContainer;
			});
		}

		// Catégoriser les formations par statut pour faciliter l'utilisation côté client
		const categorizedTrainings = {
			inProgress: filteredTrainings.filter(t => t.status === 'in_progress'),
			completed: filteredTrainings.filter(t => t.status === 'completed'),
			failed: filteredTrainings.filter(t => t.status === 'failed'),
			all: filteredTrainings
		};

		// Statistiques globales
		const stats = {
			total: filteredTrainings.length,
			inProgress: categorizedTrainings.inProgress.length,
			completed: categorizedTrainings.completed.length,
			failed: categorizedTrainings.failed.length,
			averageProgress: filteredTrainings.length > 0 
				? Math.round(filteredTrainings.reduce((sum, t) => sum + t.progress, 0) / filteredTrainings.length)
				: 0,
			averageScore: filteredTrainings.filter(t => t.score > 0).length > 0
				? Math.round(filteredTrainings.filter(t => t.score > 0).reduce((sum, t) => sum + t.score, 0) / filteredTrainings.filter(t => t.score > 0).length)
				: 0
		};

		return NextResponse.json({
			success: true,
			trainings: categorizedTrainings,
			stats: stats
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations de l'utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des formations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
