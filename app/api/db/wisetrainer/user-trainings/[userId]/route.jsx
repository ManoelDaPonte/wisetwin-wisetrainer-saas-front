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

		if (!userId) {
			return NextResponse.json(
				{ error: "L'identifiant de l'utilisateur est requis" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
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
					lastAccessed: userCourse.lastAccessed,
					startedAt: userCourse.startedAt,
					completedAt: userCourse.completedAt,
					modules,
					completedModules: modules.filter((m) => m.completed).length,
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

		return NextResponse.json({
			success: true,
			trainings,
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
