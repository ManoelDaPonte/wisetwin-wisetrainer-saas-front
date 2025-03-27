// app/api/organization/[organizationId]/invitations/[invitationId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// DELETE pour annuler une invitation
export async function DELETE(request, { params }) {
	try {
		const session = await getSession();
		const resolvedParams = await params;
		const { organizationId, invitationId } = resolvedParams;

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
					error: "Vous n'avez pas les droits pour annuler cette invitation",
				},
				{ status: 403 }
			);
		}

		// Vérifier que l'invitation existe et appartient à cette organisation
		const invitation = await prisma.organizationInvitation.findFirst({
			where: {
				id: invitationId,
				organizationId: organizationId,
			},
		});

		if (!invitation) {
			return NextResponse.json(
				{ error: "Invitation non trouvée" },
				{ status: 404 }
			);
		}

		// Supprimer l'invitation
		await prisma.organizationInvitation.delete({
			where: {
				id: invitationId,
			},
		});

		return NextResponse.json({
			success: true,
			message: "L'invitation a été annulée avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de l'annulation de l'invitation:", error);
		return NextResponse.json(
			{
				error: "Échec de l'annulation de l'invitation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
