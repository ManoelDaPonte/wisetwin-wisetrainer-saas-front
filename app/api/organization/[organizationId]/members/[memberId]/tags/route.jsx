//app/api/organization/[organizationId]/members/[memberId]/tags/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// GET pour récupérer les tags d'un membre
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const { organizationId, memberId } = params;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
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
				organizationId: organizationId,
				userId: user.id,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Vérifier que le membre cible existe dans l'organisation
		const targetMember = await prisma.organizationMember.findFirst({
			where: {
				id: memberId,
				organizationId: organizationId,
			},
			include: {
				user: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!targetMember) {
			return NextResponse.json(
				{ error: "Membre non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer les tags de l'utilisateur
		const userTags = await prisma.userTag.findMany({
			where: {
				userId: targetMember.user.id,
				tag: {
					organizationId: organizationId,
				},
			},
			include: {
				tag: true,
			},
		});

		const formattedTags = userTags.map((ut) => ({
			id: ut.tag.id,
			name: ut.tag.name,
			color: ut.tag.color,
			description: ut.tag.description,
		}));

		return NextResponse.json({ tags: formattedTags });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des tags du membre:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des tags",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// PUT pour mettre à jour les tags d'un membre
export async function PUT(request, { params }) {
	try {
		const session = await auth0.getSession();
		const { organizationId, memberId } = params;
		const { tagIds } = await request.json();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Vérifier que tagIds est un tableau
		if (!Array.isArray(tagIds)) {
			return NextResponse.json(
				{ error: "Le format des tags est invalide" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
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

		// Vérifier que l'utilisateur a les droits admin dans l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
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

		// Vérifier que le membre cible existe dans l'organisation
		const targetMember = await prisma.organizationMember.findFirst({
			where: {
				id: memberId,
				organizationId: organizationId,
			},
			include: {
				user: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!targetMember) {
			return NextResponse.json(
				{ error: "Membre non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que tous les tags existent et appartiennent à l'organisation
		const organizationTags = await prisma.organizationTag.findMany({
			where: {
				id: {
					in: tagIds,
				},
				organizationId: organizationId,
			},
		});

		if (organizationTags.length !== tagIds.length) {
			return NextResponse.json(
				{
					error: "Certains tags n'existent pas ou n'appartiennent pas à cette organisation",
				},
				{ status: 400 }
			);
		}

		// Supprimer tous les tags existants de l'utilisateur pour cette organisation
		await prisma.userTag.deleteMany({
			where: {
				userId: targetMember.user.id,
				tag: {
					organizationId: organizationId,
				},
			},
		});

		// Ajouter les nouveaux tags
		const userTagsToCreate = tagIds.map((tagId) => ({
			userId: targetMember.user.id,
			tagId: tagId,
		}));

		if (userTagsToCreate.length > 0) {
			await prisma.userTag.createMany({
				data: userTagsToCreate,
			});
		}

		// Récupérer les tags mis à jour pour les renvoyer
		const updatedUserTags = await prisma.userTag.findMany({
			where: {
				userId: targetMember.user.id,
				tag: {
					organizationId: organizationId,
				},
			},
			include: {
				tag: true,
			},
		});

		const formattedTags = updatedUserTags.map((ut) => ({
			id: ut.tag.id,
			name: ut.tag.name,
			color: ut.tag.color,
			description: ut.tag.description,
		}));

		return NextResponse.json({
			success: true,
			message: "Tags mis à jour avec succès",
			tags: formattedTags,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour des tags du membre:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la mise à jour des tags",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
