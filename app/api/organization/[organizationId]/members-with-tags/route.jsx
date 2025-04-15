//app/api/organization/[organizationId]/members-with-tags/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
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

		// Pour chaque membre, récupérer ses tags
		const membersWithTags = await Promise.all(
			members.map(async (member) => {
				const userTags = await prisma.userTag.findMany({
					where: {
						userId: member.user.id,
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

				return {
					id: member.id,
					userId: member.user.id,
					name: member.user.name || member.user.email.split("@")[0],
					email: member.user.email,
					role: member.role,
					joinedAt: member.joinedAt,
					tags: formattedTags,
				};
			})
		);

		return NextResponse.json({ members: membersWithTags });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des membres avec tags:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des membres",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
