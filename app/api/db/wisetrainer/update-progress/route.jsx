// app/api/db/wisetrainer/update-progress/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const { userId, trainingId, progress, completedModule, moduleScore } =
			await request.json();

		// Fonction pour charger un fichier de configuration de cours
		const loadCourseConfig = (courseId) => {
			try {
				const configPath = path.join(
					process.cwd(),
					"lib/config/wisetrainer/courses",
					`${courseId}.json`
				);
				if (fs.existsSync(configPath)) {
					return JSON.parse(fs.readFileSync(configPath, "utf-8"));
				}
				return null;
			} catch (error) {
				console.error(
					`Erreur lors du chargement du fichier de configuration ${courseId}:`,
					error
				);
				return null;
			}
		};

		// Charger la configuration du cours
		const courseConfig = loadCourseConfig(trainingId);
		if (!courseConfig) {
			console.warn(
				`Configuration du cours ${trainingId} non trouvée, utilisation des valeurs par défaut`
			);
		}

		// Récupérer l'ID utilisateur basé sur le container Azure
		let user = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		// Si l'utilisateur n'existe pas, retourner une erreur
		if (!user) {
			return NextResponse.json(
				{
					error: "Utilisateur non trouvé. Veuillez vous connecter pour enregistrer votre progression.",
					requireAuth: true,
				},
				{ status: 401 }
			);
		}

		// Vérifier si le cours existe
		let course = await prisma.course.findUnique({
			where: {
				courseId: trainingId,
			},
		});

		// Si le cours n'existe pas, le créer
		if (!course) {
			if (courseConfig) {
				// Utiliser les données du fichier de configuration
				course = await prisma.course.create({
					data: {
						courseId: trainingId,
						name: courseConfig.name,
						description: courseConfig.description,
						imageUrl:
							courseConfig.imageUrl ||
							"/images/png/placeholder.png",
						category: courseConfig.category || "Formation",
						difficulty: courseConfig.difficulty || "Intermédiaire",
						duration: courseConfig.duration || "30 min",
					},
				});
			} else {
				// Utiliser des valeurs par défaut
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
			try {
				userTraining = await prisma.userCourse.create({
					data: {
						userId: user.id,
						courseId: course.id,
						progress: progress || 0,
						startedAt: new Date(),
						lastAccessed: new Date(),
					},
				});
			} catch (error) {
				// Si une erreur de contrainte unique se produit, récupérer l'enregistrement existant
				if (error.code === "P2002") {
					console.log(
						"Enregistrement UserCourse déjà existant, récupération..."
					);
					userTraining = await prisma.userCourse.findFirst({
						where: {
							userId: user.id,
							courseId: course.id,
						},
						include: {
							userModules: true,
						},
					});
				} else {
					throw error; // Si c'est une autre erreur, la propager
				}
			}
		} else {
			// Calculer le nombre total de modules du cours
			let totalModules = 3; // Valeur par défaut

			if (courseConfig && courseConfig.modules) {
				totalModules = courseConfig.modules.length;
			} else {
				// Récupérer tous les modules du cours depuis la base de données
				const courseModules = await prisma.module.findMany({
					where: {
						courseId: course.id,
					},
				});
				totalModules = courseModules.length || totalModules;
			}

			// Calculer le nombre de modules complétés
			const completedModuleCount =
				userTraining.userModules.filter((module) => module.completed)
					.length + (completedModule ? 1 : 0);

			// S'assurer que nous n'avons pas compté deux fois le même module
			const uniqueCompletedModules = new Set(
				userTraining.userModules
					.filter((m) => m.completed)
					.map((m) => m.moduleId)
			);

			if (completedModule) {
				const moduleEntity = await prisma.module.findFirst({
					where: {
						moduleId: completedModule,
						courseId: course.id,
					},
				});

				if (moduleEntity) {
					uniqueCompletedModules.add(moduleEntity.id);
				}
			}

			// Calculer la progression en fonction du nombre total de modules du cours
			const updatedProgress = Math.min(
				100,
				Math.round((uniqueCompletedModules.size / totalModules) * 100)
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
						uniqueCompletedModules.size >= totalModules
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
				let moduleData = null;
				if (courseConfig && courseConfig.modules) {
					moduleData = courseConfig.modules.find(
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
