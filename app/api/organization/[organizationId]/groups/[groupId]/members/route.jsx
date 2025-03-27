// app/api/organization/[organizationId]/groups/[groupId]/members/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// GET - Récupérer les membres d'un groupe spécifique
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

		// Récupérer les membres du groupe
		const groupMembers = await prisma.groupMember.findMany({
			where: {
				groupId,
			},
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
		});

		// Formater les données pour un usage plus simple côté client
		const formattedMembers = groupMembers.map((member) => ({
			id: member.id,
			userId: member.organizationMember.user.id,
			name: member.organizationMember.user.name,
			email: member.organizationMember.user.email,
			role: member.organizationMember.role,
			joinedAt: member.createdAt,
		}));

		return NextResponse.json({
			members: formattedMembers,
			total: formattedMembers.length,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des membres du groupe:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des membres du groupe",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST - Ajouter des membres à un groupe
export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId, groupId } = params;
		const { memberIds } = await request.json();

		// Vérifier que des IDs de membres sont fournis
		if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
			return NextResponse.json(
				{ error: "Les identifiants des membres sont requis" },
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

		// Récupérer tous les membres de l'organisation
		const organizationMembers = await prisma.organizationMember.findMany({
			where: {
				organizationId,
				id: {
					in: memberIds,
				},
			},
		});

		if (organizationMembers.length === 0) {
			return NextResponse.json(
				{ error: "Aucun membre valide trouvé pour cette organisation" },
				{ status: 400 }
			);
		}

		// Récupérer les membres actuels du groupe
		const existingGroupMembers = await prisma.groupMember.findMany({
			where: {
				groupId,
			},
			select: {
				organizationMemberId: true,
			},
		});

		const existingMemberIds = existingGroupMembers.map(
			(m) => m.organizationMemberId
		);

		// Filtrer pour ne garder que les nouveaux membres
		const newMembers = organizationMembers.filter(
			(m) => !existingMemberIds.includes(m.id)
		);

		// Ajouter les nouveaux membres au groupe
		const createdMembers = await Promise.all(
			newMembers.map((member) =>
				prisma.groupMember.create({
					data: {
						groupId,
						organizationMemberId: member.id,
					},
				})
			)
		);

		// Si certains membres étaient déjà dans le groupe
		const alreadyInGroup = memberIds.length - newMembers.length;

		return NextResponse.json({
			success: true,
			message: `${createdMembers.length} membres ajoutés au groupe${
				alreadyInGroup > 0
					? ` (${alreadyInGroup} membres déjà présents)`
					: ""
			}`,
			addedMembers: createdMembers.length,
			alreadyInGroup,
		});
	} catch (error) {
		console.error("Erreur lors de l'ajout des membres au groupe:", error);
		return NextResponse.json(
			{
				error: "Échec de l'ajout des membres au groupe",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// DELETE - Supprimer des membres d'un groupe
export async function DELETE(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId, groupId } = params;
		const { memberIds } = await request.json();

		// Vérifier que des IDs de membres sont fournis
		if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
			return NextResponse.json(
				{ error: "Les identifiants des membres sont requis" },
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

		// Supprimer les membres du groupe
		const result = await prisma.groupMember.deleteMany({
			where: {
				groupId,
				organizationMemberId: {
					in: memberIds,
				},
			},
		});

		return NextResponse.json({
			success: true,
			message: `${result.count} membres supprimés du groupe`,
			removedCount: result.count,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la suppression des membres du groupe:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la suppression des membres du groupe",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
