// app/api/organization/[organizationId]/groups/[groupId]/trainings/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// GET - Récupérer les formations assignées à un groupe spécifique
export async function GET(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId, groupId } = params;

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

		// Vérifier que le groupe existe et appartient à l'organisation
		const group = await prisma.organizationGroup.findFirst({
			where: {
				id: groupId,
				organizationId,
			},
		});

		if (!group) {
			return NextResponse.json(
				{
					error: "Groupe non trouvé ou n'appartient pas à l'organisation",
				},
				{ status: 404 }
			);
		}

		// Récupérer les formations assignées au groupe
		const groupTrainings = await prisma.organizationGroupTraining.findMany({
			where: {
				groupId,
			},
			include: {
				training: {
					include: {
						course: true,
					},
				},
			},
		});

		// Formater les données pour un usage plus simple côté client
		const formattedTrainings = groupTrainings.map((item) => ({
			id: item.training.course.courseId,
			name: item.training.course.name,
			description: item.training.course.description,
			imageUrl: item.training.course.imageUrl,
			category: item.training.course.category,
			difficulty: item.training.course.difficulty,
			duration: item.training.course.duration,
			assignedAt: item.assignedAt,
			isCustomBuild: item.training.isCustomBuild,
			buildId: item.training.buildId,
		}));

		return NextResponse.json({
			trainings: formattedTrainings,
			total: formattedTrainings.length,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations du groupe:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des formations du groupe",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST - Assigner des formations à un groupe
export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId, groupId } = params;
		const { trainingIds } = await request.json();

		// Vérifier que des IDs de formations sont fournis
		if (
			!trainingIds ||
			!Array.isArray(trainingIds) ||
			trainingIds.length === 0
		) {
			return NextResponse.json(
				{ error: "Les identifiants des formations sont requis" },
				{ status: 400 }
			);
		}

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

		// Vérifier que l'utilisateur est admin ou propriétaire de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: user.id,
				role: {
					in: ["OWNER", "ADMIN"],
				},
			},
		});

		if (!membership) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
				},
				{ status: 403 }
			);
		}

		// Vérifier que le groupe existe et appartient à l'organisation
		const group = await prisma.organizationGroup.findFirst({
			where: {
				id: groupId,
				organizationId,
			},
		});

		if (!group) {
			return NextResponse.json(
				{
					error: "Groupe non trouvé ou n'appartient pas à l'organisation",
				},
				{ status: 404 }
			);
		}

		// Récupérer les formations de l'organisation
		const organizationTrainings =
			await prisma.organizationTraining.findMany({
				where: {
					organizationId,
					course: {
						courseId: {
							in: trainingIds,
						},
					},
					isActive: true,
				},
			});

		if (organizationTrainings.length === 0) {
			return NextResponse.json(
				{
					error: "Aucune formation valide trouvée pour cette organisation",
				},
				{ status: 400 }
			);
		}

		// Récupérer les formations déjà assignées au groupe
		const existingGroupTrainings =
			await prisma.organizationGroupTraining.findMany({
				where: {
					groupId,
					trainingId: {
						in: organizationTrainings.map((t) => t.id),
					},
				},
			});

		const existingTrainingIds = existingGroupTrainings.map(
			(t) => t.trainingId
		);

		// Filtrer pour ne garder que les nouvelles formations
		const newTrainings = organizationTrainings.filter(
			(t) => !existingTrainingIds.includes(t.id)
		);

		// Assigner les nouvelles formations au groupe
		const assignedTrainings = await Promise.all(
			newTrainings.map((training) =>
				prisma.organizationGroupTraining.create({
					data: {
						groupId,
						trainingId: training.id,
						assignedById: user.id,
					},
				})
			)
		);

		// Si certaines formations étaient déjà assignées au groupe
		const alreadyAssigned =
			organizationTrainings.length - newTrainings.length;

		return NextResponse.json({
			success: true,
			message: `${
				assignedTrainings.length
			} formations assignées au groupe${
				alreadyAssigned > 0
					? ` (${alreadyAssigned} formations déjà assignées)`
					: ""
			}`,
			assignedCount: assignedTrainings.length,
			alreadyAssigned,
		});
	} catch (error) {
		console.error(
			"Erreur lors de l'assignation des formations au groupe:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de l'assignation des formations au groupe",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// DELETE - Supprimer des formations d'un groupe
export async function DELETE(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId, groupId } = params;
		const { trainingIds } = await request.json();

		// Vérifier que des IDs de formations sont fournis
		if (
			!trainingIds ||
			!Array.isArray(trainingIds) ||
			trainingIds.length === 0
		) {
			return NextResponse.json(
				{ error: "Les identifiants des formations sont requis" },
				{ status: 400 }
			);
		}

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

		// Vérifier que l'utilisateur est admin ou propriétaire de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: user.id,
				role: {
					in: ["OWNER", "ADMIN"],
				},
			},
		});

		if (!membership) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
				},
				{ status: 403 }
			);
		}

		// Vérifier que le groupe existe et appartient à l'organisation
		const group = await prisma.organizationGroup.findFirst({
			where: {
				id: groupId,
				organizationId,
			},
		});

		if (!group) {
			return NextResponse.json(
				{
					error: "Groupe non trouvé ou n'appartient pas à l'organisation",
				},
				{ status: 404 }
			);
		}

		// Trouver les formations dans l'organisation pour obtenir leurs IDs
		const organizationTrainings =
			await prisma.organizationTraining.findMany({
				where: {
					organizationId,
					course: {
						courseId: {
							in: trainingIds,
						},
					},
				},
			});

		const trainingDbIds = organizationTrainings.map((t) => t.id);

		// Supprimer les assignations de formations au groupe
		const result = await prisma.organizationGroupTraining.deleteMany({
			where: {
				groupId,
				trainingId: {
					in: trainingDbIds,
				},
			},
		});

		return NextResponse.json({
			success: true,
			message: `${result.count} formations désassignées du groupe`,
			removedCount: result.count,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la désassignation des formations du groupe:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la désassignation des formations du groupe",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
