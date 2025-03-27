// app/api/organization/[organizationId]/invitations/[invitationId]/resend/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";
import { sendInvitationEmail } from "@/lib/services/mailService";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
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
					error: "Vous n'avez pas les droits pour renvoyer cette invitation",
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

		// Vérifier que l'invitation est toujours en attente
		if (invitation.status !== "PENDING") {
			return NextResponse.json(
				{ error: "Cette invitation n'est plus en attente" },
				{ status: 400 }
			);
		}

		// Mettre à jour la date d'expiration
		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 7); // Expire dans 7 jours

		const updatedInvitation = await prisma.organizationInvitation.update({
			where: {
				id: invitationId,
			},
			data: {
				expiresAt: expirationDate,
			},
		});

		// Récupérer les infos de l'organisation
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		// Renvoyer l'email d'invitation
		await sendInvitationEmail(
			invitation.email,
			organization.name,
			invitation.inviteCode
		);

		return NextResponse.json({
			success: true,
			message: `Invitation renvoyée à ${invitation.email}`,
			invitation: {
				id: updatedInvitation.id,
				email: updatedInvitation.email,
				role: updatedInvitation.role,
				status: updatedInvitation.status,
				expiresAt: updatedInvitation.expiresAt,
			},
		});
	} catch (error) {
		console.error("Erreur lors du renvoi de l'invitation:", error);
		return NextResponse.json(
			{
				error: "Échec du renvoi de l'invitation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
