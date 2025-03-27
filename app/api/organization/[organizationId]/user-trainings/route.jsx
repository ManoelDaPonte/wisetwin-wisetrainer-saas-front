// app/api/organization/[organizationId]/user-trainings/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// GET - Récupérer les formations disponibles pour l'utilisateur connecté
export async function GET(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;

		// Vérifier l'authentification
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: user.id,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// 1. Si l'utilisateur est OWNER ou ADMIN, il a accès à toutes les formations de l'organisation
		if (membership.role === "OWNER" || membership.role === "ADMIN") {
			const allTrainings = await prisma.organizationTraining.findMany({
				where: {
					organizationId,
					isActive: true,
				},
				include: {
					course: true,
					assignedGroups: {
						include: {
							group: true,
						},
					},
				},
			});

			const formattedTrainings = allTrainings.map((training) => ({
				id: training.course.courseId,
				name: training.course.name,
				description: training.course.description,
				imageUrl: training.course.imageUrl,
				category: training.course.category,
				difficulty: training.course.difficulty,
				duration: training.course.duration,
				isCustomBuild: training.isCustomBuild,
				buildId: training.buildId,
				assignedGroups: training.assignedGroups.map((ag) => ({
					id: ag.group.id,
					name: ag.group.name,
				})),
			}));

			return NextResponse.json({
				trainings: formattedTrainings,
				total: formattedTrainings.length,
				userRole: membership.role,
			});
		}
		// 2. Si l'utilisateur est MEMBER, il n'a accès qu'aux formations assignées à ses groupes
		else {
			// Trouver les groupes de l'utilisateur
			const userGroups = await prisma.groupMember.findMany({
				where: {
					organizationMember: {
						userId: user.id,
						organizationId,
					},
				},
				select: {
					groupId: true,
				},
			});

			const userGroupIds = userGroups.map((g) => g.groupId);

			// Si l'utilisateur n'appartient à aucun groupe, retourner une liste vide
			if (userGroupIds.length === 0) {
				return NextResponse.json({
					trainings: [],
					total: 0,
					userRole: membership.role,
				});
			}

			// Trouver les formations assignées à ces groupes
			const groupTrainings =
				await prisma.organizationGroupTraining.findMany({
					where: {
						groupId: {
							in: userGroupIds,
						},
						training: {
							organizationId,
							isActive: true,
						},
					},
					include: {
						training: {
							include: {
								course: true,
							},
						},
						group: true,
					},
				});

			// Formater les formations (éliminer les doublons si une formation est assignée à plusieurs groupes)
			const trainingMap = new Map();

			groupTrainings.forEach((item) => {
				const trainingId = item.training.course.courseId;

				if (!trainingMap.has(trainingId)) {
					trainingMap.set(trainingId, {
						id: trainingId,
						name: item.training.course.name,
						description: item.training.course.description,
						imageUrl: item.training.course.imageUrl,
						category: item.training.course.category,
						difficulty: item.training.course.difficulty,
						duration: item.training.course.duration,
						isCustomBuild: item.training.isCustomBuild,
						buildId: item.training.buildId,
						assignedGroups: [
							{
								id: item.group.id,
								name: item.group.name,
							},
						],
					});
				} else {
					// Ajouter le groupe à la liste des groupes assignés
					const training = trainingMap.get(trainingId);
					if (
						!training.assignedGroups.some(
							(g) => g.id === item.group.id
						)
					) {
						training.assignedGroups.push({
							id: item.group.id,
							name: item.group.name,
						});
					}
				}
			});

			const formattedTrainings = Array.from(trainingMap.values());

			return NextResponse.json({
				trainings: formattedTrainings,
				total: formattedTrainings.length,
				userRole: membership.role,
				userGroups: userGroupIds.length,
			});
		}
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations de l'utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des formations de l'utilisateur",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
