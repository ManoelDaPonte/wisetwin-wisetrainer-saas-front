//app/api/db/wisetrainer/update-progress/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import wisetrainerTemplate from "@/lib/config/wisetrainer/courses/wisetrainer-template.json";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const { userId, trainingId, progress, completedModule, moduleScore } =
			await request.json();

		// Récupérer l'ID utilisateur basé sur le container Azure
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

		// Vérifier si le cours existe
		let course = await prisma.course.findUnique({
			where: {
				courseId: trainingId,
			},
		});

		// Si le cours n'existe pas, le créer
		if (!course) {
			// Vérifier s'il s'agit de notre cours de base
			if (trainingId === "wisetrainer-template") {
				course = await prisma.course.create({
					data: {
						courseId: "wisetrainer-template",
						name: wisetrainerTemplate.name,
						description: wisetrainerTemplate.description,
						imageUrl:
							wisetrainerTemplate.imageUrl ||
							"/images/png/placeholder.png",
						category: wisetrainerTemplate.category,
						difficulty: wisetrainerTemplate.difficulty,
						duration: wisetrainerTemplate.duration,
					},
				});
			} else {
				// Créer un cours générique si ce n'est pas notre cours de base
				course = await prisma.course.create({
					data: {
						courseId: trainingId,
						name: trainingId,
						description: `Formation ${trainingId}`,
						imageUrl: "/images/png/placeholder.png",
						category: "Formation",
						difficulty: "Intermédiaire",
						duration: "30 min",
					},
				});
			}
		}

		// Récupérer l'entraînement de l'utilisateur
		let userTraining = await prisma.userCourse.findFirst({
			where: {
				userId: user.id,
				courseId: course.id,
			},
			include: {
				userModules: true,
			},
		});

		if (!userTraining) {
			// Si l'entraînement n'existe pas encore pour cet utilisateur, le créer
			userTraining = await prisma.userCourse.create({
				data: {
					userId: user.id,
					courseId: course.id,
					progress: progress,
					startedAt: new Date(),
					lastAccessed: new Date(),
				},
			});
		} else {
			const courseModules = await prisma.module.findMany({
				where: {
					courseId: course.id,
				},
			});
			const totalModules = courseModules.length;

			// CORRECTION : Calculer le nombre de modules complétés
			const completedModuleCount =
				userTraining.userModules.filter((module) => module.completed)
					.length + (completedModule ? 1 : 0); // +1 si un nouveau module vient d'être complété

			const updatedProgress = Math.min(
				100,
				Math.round((completedModuleCount / totalModules) * 100)
			);

			// Mise à jour de l'entraînement existant
			userTraining = await prisma.userCourse.update({
				where: {
					id: userTraining.id,
				},
				data: {
					progress: updatedProgress,
					lastAccessed: new Date(),
					// Si tous les modules sont complétés, marquer le cours comme terminé
					completedAt:
						completedModuleCount >= totalModules
							? new Date()
							: userTraining.completedAt,
				},
			});
		}

		// Si un module a été complété, mettre à jour ou créer l'entrée du module
		if (completedModule) {
			// Vérifier si le module existe
			let moduleEntity = await prisma.module.findFirst({
				where: {
					moduleId: completedModule,
					courseId: course.id,
				},
			});

			// Si le module n'existe pas, le créer
			if (!moduleEntity) {
				// Vérifier s'il s'agit d'un module de notre cours de base
				let moduleData = null;
				if (trainingId === "wisetrainer-template") {
					moduleData = wisetrainerTemplate.modules.find(
						(m) => m.id === completedModule
					);
				}

				moduleEntity = await prisma.module.create({
					data: {
						moduleId: completedModule,
						title: moduleData
							? moduleData.title
							: `Module ${completedModule}`,
						description: moduleData
							? moduleData.description
							: `Description du module ${completedModule}`,
						order: moduleData ? moduleData.order : 1,
						courseId: course.id,
					},
				});
			}

			// Vérifier si l'utilisateur a déjà une entrée pour ce module
			const userModule = await prisma.userModule.findFirst({
				where: {
					userCourseId: userTraining.id,
					moduleId: moduleEntity.id,
				},
			});

			if (userModule) {
				// Mettre à jour le module existant
				await prisma.userModule.update({
					where: {
						id: userModule.id,
					},
					data: {
						completed: true,
						score: moduleScore || userModule.score,
					},
				});
			} else {
				// Créer une nouvelle entrée de module
				await prisma.userModule.create({
					data: {
						userCourseId: userTraining.id,
						moduleId: moduleEntity.id,
						completed: true,
						score: moduleScore || 0,
					},
				});
			}
		}

		return NextResponse.json({ success: true, userTraining });
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de la progression:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la mise à jour de la progression",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
