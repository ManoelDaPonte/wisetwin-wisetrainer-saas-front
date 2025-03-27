// app/api/organization/[organizationId]/invitations/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

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

		// Vérifier que l'utilisateur est membre de l'organisation avec des droits d'administration
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
					error: "Vous n'avez pas les droits pour voir les invitations",
				},
				{ status: 403 }
			);
		}

		// Récupérer toutes les invitations de l'organisation
		const invitations = await prisma.organizationInvitation.findMany({
			where: {
				organizationId: organizationId,
			},
			orderBy: [
				{ status: "asc" }, // PENDING en premier
				{ invitedAt: "desc" }, // Plus récentes en premier
			],
		});

		return NextResponse.json({
			invitations: invitations.map((invitation) => ({
				id: invitation.id,
				email: invitation.email,
				role: invitation.role,
				status: invitation.status,
				invitedAt: invitation.invitedAt,
				expiresAt: invitation.expiresAt,
				invitedBy: invitation.invitedBy,
			})),
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des invitations:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération des invitations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
