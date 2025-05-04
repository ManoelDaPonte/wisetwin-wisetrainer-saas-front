// app/api/formations/[formationId]/modules/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	const resolvedParams = await params;
	const formationId = resolvedParams.formationId;

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

		// Vérifier si la formation existe
		const formation = await prisma.formation.findUnique({
			where: { id: formationId },
			include: {
				organization: true,
			},
		});

		if (!formation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Si la formation appartient à une organisation, vérifier les droits d'accès
		if (formation.organizationId) {
			const membership = await prisma.organizationMember.findFirst({
				where: {
					userId: user.id,
					organizationId: formation.organizationId,
				},
			});

			if (!membership) {
				return NextResponse.json(
					{
						error: "Vous n'êtes pas autorisé à accéder à cette formation",
					},
					{ status: 403 }
				);
			}
		}

		// Vérifier si l'utilisateur est inscrit à la formation
		const enrollment = await prisma.formationEnrollment.findFirst({
			where: {
				userId: user.id,
				formationId: formationId,
			},
		});

		// Récupérer les modules 3D de la formation
		const modules3D = await prisma.build3D.findMany({
			where: {
				formationId: formationId,
			},
			include: {
				modules3D: {
					orderBy: {
						order: "asc",
					},
				},
			},
		});

		// Récupérer les leçons de la formation
		const courses = await prisma.course.findMany({
			where: {
				formationId: formationId,
			},
			include: {
				lessons: {
					orderBy: {
						order: "asc",
					},
				},
			},
			orderBy: {
				order: "asc",
			},
		});

		// Formater les données pour le front-end
		const formattedModules3D = [];
		const formattedLessons = [];

		// Si l'utilisateur est inscrit, récupérer sa progression
		let build3DProgresses = [];
		let courseProgresses = [];

		if (enrollment) {
			// Récupérer la progression pour les modules 3D
			build3DProgresses = await prisma.build3DProgress.findMany({
				where: {
					enrollmentId: enrollment.id,
				},
				include: {
					moduleProgress: true,
				},
			});

			// Récupérer la progression pour les cours
			courseProgresses = await prisma.courseProgress.findMany({
				where: {
					enrollmentId: enrollment.id,
				},
				include: {
					lessonProgress: true,
				},
			});
		}

		// Formatter les modules 3D avec la progression
		modules3D.forEach((build) => {
			const buildProgress = build3DProgresses.find(
				(p) => p.build3DId === build.id
			);

			build.modules3D.forEach((module, index) => {
				const moduleProgress = buildProgress?.moduleProgress.find(
					(p) => p.moduleId === module.id
				);

				// Logique pour déterminer si le module est verrouillé
				const previousModuleCompleted =
					index === 0 ||
					(index > 0 &&
						buildProgress?.moduleProgress.some(
							(p) =>
								p.moduleId === build.modules3D[index - 1].id &&
								p.isCompleted
						));

				const locked = index > 0 && !previousModuleCompleted;

				formattedModules3D.push({
					id: module.id,
					title: module.title,
					description: module.description,
					type: module.type,
					order: module.order,
					buildId: build.id,
					completed: moduleProgress?.isCompleted || false,
					locked: locked,
				});
			});
		});

		// Formatter les leçons avec la progression
		courses.forEach((course) => {
			const courseProgress = courseProgresses.find(
				(p) => p.courseId === course.id
			);

			course.lessons.forEach((lesson, index) => {
				const lessonProgress = courseProgress?.lessonProgress.find(
					(p) => p.lessonId === lesson.id
				);

				// Logique pour déterminer si la leçon est verrouillée
				const previousLessonCompleted =
					index === 0 ||
					(index > 0 &&
						courseProgress?.lessonProgress.some(
							(p) =>
								p.lessonId === course.lessons[index - 1].id &&
								p.isCompleted
						));

				const locked = index > 0 && !previousLessonCompleted;

				formattedLessons.push({
					id: lesson.id,
					title: lesson.title,
					content: lesson.content,
					mediaUrl: lesson.mediaUrl,
					order: lesson.order,
					duration: lesson.duration,
					courseId: course.id,
					completed: lessonProgress?.isCompleted || false,
					locked: locked,
				});
			});
		});

		return NextResponse.json({
			modules3D: formattedModules3D,
			lessons: formattedLessons,
			isEnrolled: !!enrollment,
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
