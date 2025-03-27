// app/api/organization/[organizationId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// GET pour récupérer les détails d'une organisation spécifique
export async function GET(request, { params }) {
	try {
		const session = await getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

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

		// Récupérer les détails de l'organisation
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Récupérer tous les membres de l'organisation
		const members = await prisma.organizationMember.findMany({
			where: {
				organizationId: organizationId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
			orderBy: {
				joinedAt: "asc",
			},
		});

		// Compter le nombre de membres
		const membersCount = members.length;

		// Formatter les données des membres pour l'UI
		const formattedMembers = members.map((member) => ({
			id: member.id,
			userId: member.user.id,
			name: member.user.name || member.user.email.split("@")[0],
			email: member.user.email,
			role: member.role,
			joinedAt: member.joinedAt,
		}));

		return NextResponse.json({
			organization: {
				...organization,
				userRole: membership.role,
				members: formattedMembers,
				membersCount,
			},
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'organisation:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération de l'organisation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// DELETE pour supprimer une organisation
export async function DELETE(request, { params }) {
	try {
		const session = await getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

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

		// Vérifier que l'utilisateur est propriétaire de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: user.id,
				role: "OWNER",
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Seul le propriétaire peut supprimer l'organisation" },
				{ status: 403 }
			);
		}

		// Récupérer l'organisation pour vérifier qu'elle existe
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Supprimer l'organisation (les relations seront supprimées automatiquement grâce à onDelete: Cascade)
		await prisma.organization.delete({
			where: {
				id: organizationId,
			},
		});

		return NextResponse.json({
			success: true,
			message: "L'organisation a été supprimée avec succès",
		});
	} catch (error) {
		console.error(
			"Erreur lors de la suppression de l'organisation:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la suppression de l'organisation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

export async function PATCH(request, { params }) {
	try {
		const session = await getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;
		const { name, description, logoUrl } = await request.json();

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

		// Vérifier que l'utilisateur est admin ou propriétaire de l'organisation
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
					error: "Vous n'avez pas les droits pour modifier cette organisation",
				},
				{ status: 403 }
			);
		}

		// Mettre à jour l'organisation
		const updatedOrganization = await prisma.organization.update({
			where: {
				id: organizationId,
			},
			data: {
				name: name,
				description: description,
				logoUrl: logoUrl,
			},
		});

		return NextResponse.json({
			success: true,
			organization: updatedOrganization,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de l'organisation:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la mise à jour de l'organisation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
