// app/api/formations/[formationId]/modules/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	const formationId = params.formationId;

	try {
		// Récupérer la session Auth0 de l'utilisateur
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await findUserByAuth0Id(session.user.sub);

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer la formation
		const formation = await prisma.formation.findUnique({
			where: {
				id: formationId,
			},
			include: {
				organization: {
					select: {
						id: true,
						name: true,
					},
				},
				builds3D: {
					include: {
						modules3D: {
							orderBy: {
								order: "asc",
							},
						},
					},
				},
				courses: {
					include: {
						lessons: {
							orderBy: {
								order: "asc",
							},
						},
					},
				},
			},
		});

		if (!formation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Vérifier si l'utilisateur est inscrit à cette formation
		const enrollment = await prisma.formationEnrollment.findFirst({
			where: {
				userId: user.id,
				formationId: formation.id,
			},
		});

		// Si l'utilisateur n'est pas inscrit, renvoyer une liste vide
		if (!enrollment) {
			return NextResponse.json({
				modules3D: [],
				lessons: [],
				isEnrolled: false,
			});
		}

		// Récupérer la progression de l'utilisateur dans les modules 3D et les leçons
		// Pour les modules 3D
		let formattedModules3D = [];
		let formattedLessons = [];

		if (formation.builds3D.length > 0) {
			const build3D = formation.builds3D[0]; // On prend le premier build 3D (pourrait être adapté si plusieurs)

			// Récupérer le progrès de l'utilisateur dans ce build
			const build3DProgress = await prisma.build3DProgress.findFirst({
				where: {
					enrollmentId: enrollment.id,
					build3DId: build3D.id,
				},
				include: {
					moduleProgress: {
						include: {
							module: true,
						},
					},
				},
			});

			// Formater les données des modules 3D
			formattedModules3D = build3D.modules3D.map((module) => {
				// Trouver la progression de l'utilisateur pour ce module
				const moduleProgress = build3DProgress?.moduleProgress.find(
					(p) => p.moduleId === module.id
				);

				// Déterminer si le module est verrouillé
				// (par exemple, les modules doivent être complétés dans l'ordre)
				const moduleIndex = build3D.modules3D.findIndex(
					(m) => m.id === module.id
				);
				const previousModuleCompleted =
					moduleIndex === 0 ||
					(moduleIndex > 0 &&
						build3DProgress?.moduleProgress.some(
							(p) =>
								p.moduleId ===
									build3D.modules3D[moduleIndex - 1].id &&
								p.isCompleted
						));

				const locked = moduleIndex > 0 && !previousModuleCompleted;

				return {
					id: module.id,
					title: module.title,
					description: module.description || "",
					type: module.type,
					buildId: build3D.id,
					completed: moduleProgress?.isCompleted || false,
					locked: locked,
				};
			});
		}

		// Pour les cours et leçons
		if (formation.courses.length > 0) {
			const course = formation.courses[0]; // On prend le premier cours (pourrait être adapté si plusieurs)

			// Récupérer le progrès de l'utilisateur dans ce cours
			const courseProgress = await prisma.courseProgress.findFirst({
				where: {
					enrollmentId: enrollment.id,
					courseId: course.id,
				},
				include: {
					lessonProgress: {
						include: {
							lesson: true,
						},
					},
				},
			});

			// Formater les données des leçons
			formattedLessons = course.lessons.map((lesson) => {
				// Trouver la progression de l'utilisateur pour cette leçon
				const lessonProgress = courseProgress?.lessonProgress.find(
					(p) => p.lessonId === lesson.id
				);

				// Déterminer si la leçon est verrouillée
				// (par exemple, les leçons doivent être complétées dans l'ordre)
				const lessonIndex = course.lessons.findIndex(
					(l) => l.id === lesson.id
				);
				const previousLessonCompleted =
					lessonIndex === 0 ||
					(lessonIndex > 0 &&
						courseProgress?.lessonProgress.some(
							(p) =>
								p.lessonId ===
									course.lessons[lessonIndex - 1].id &&
								p.isCompleted
						));

				const locked = lessonIndex > 0 && !previousLessonCompleted;

				return {
					id: lesson.id,
					title: lesson.title,
					content: lesson.content,
					mediaUrl: lesson.mediaUrl,
					duration: lesson.duration || "10 min",
					courseId: course.id,
					completed: lessonProgress?.isCompleted || false,
					locked: locked,
				};
			});
		}

		// Renvoyer les données formatées
		return NextResponse.json({
			modules3D: formattedModules3D,
			lessons: formattedLessons,
			isEnrolled: true,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des modules:", error);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la récupération des modules",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
