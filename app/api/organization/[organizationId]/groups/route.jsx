// app/api/organization/[organizationId]/groups/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// GET - Récupérer tous les groupes d'une organisation
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

		// Récupérer tous les groupes de l'organisation
		const groups = await prisma.organizationGroup.findMany({
			where: {
				organizationId,
			},
			include: {
				members: {
					include: {
						organizationMember: {
							include: {
								user: {
									select: {
										id: true,
										name: true,
										email: true,
									},
								},
							},
						},
					},
				},
				assignedTrainings: {
					include: {
						training: {
							include: {
								course: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		// Formater les données pour un usage plus simple côté client
		const formattedGroups = groups.map((group) => ({
			id: group.id,
			name: group.name,
			description: group.description,
			createdAt: group.createdAt,
			updatedAt: group.updatedAt,
			memberCount: group.members.length,
			members: group.members.map((member) => ({
				id: member.organizationMember.user.id,
				name: member.organizationMember.user.name,
				email: member.organizationMember.user.email,
				role: member.organizationMember.role,
			})),
			assignedTrainings: group.assignedTrainings.map((assignment) => ({
				id: assignment.training.course.courseId,
				name: assignment.training.course.name,
				description: assignment.training.course.description,
				imageUrl: assignment.training.course.imageUrl,
				assignedAt: assignment.training.assignedAt,
			})),
		}));

		return NextResponse.json({ groups: formattedGroups });
	} catch (error) {
		console.error("Erreur lors de la récupération des groupes:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération des groupes",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST - Créer un nouveau groupe
export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;
		const { name, description } = await request.json();

		// Vérifier que le nom est fourni
		if (!name) {
			return NextResponse.json(
				{ error: "Le nom du groupe est requis" },
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

		// Récupérer l'organisation pour vérifier qu'elle existe
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Créer le groupe
		const newGroup = await prisma.organizationGroup.create({
			data: {
				name,
				description,
				organizationId,
			},
		});

		return NextResponse.json({
			success: true,
			group: newGroup,
		});
	} catch (error) {
		console.error("Erreur lors de la création du groupe:", error);
		return NextResponse.json(
			{
				error: "Échec de la création du groupe",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
