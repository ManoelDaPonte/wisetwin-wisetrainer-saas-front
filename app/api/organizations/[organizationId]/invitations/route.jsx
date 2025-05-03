// app/api/organizations/[organizationId]/invitations/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { getOrganizationInvitations } from "@/lib/services/organizations/currentOrganization/currentOrganizationInvitationService";
import { currentOrganizationAuthService } from "@/lib/services/organizations/currentOrganization/currentOrganizationAuthService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Authentifier l'utilisateur et vérifier qu'il a un rôle d'admin ou de propriétaire
		await currentOrganizationAuthService.authenticateWithRole(
			session,
			organizationId,
			["OWNER", "ADMIN"]
		);

		// Récupérer toutes les invitations
		const invitations = await getOrganizationInvitations(organizationId);

		// Récupérer les détails des utilisateurs qui ont envoyé les invitations
		const invitationsWithDetails = await Promise.all(
			invitations.map(async (invitation) => {
				const inviter = await prisma.user.findUnique({
					where: { id: invitation.invitedBy },
					select: { name: true, email: true },
				});

				return {
					...invitation,
					inviterName: inviter
						? inviter.name || inviter.email.split("@")[0]
						: "Inconnu",
				};
			})
		);

		return NextResponse.json({ invitations: invitationsWithDetails });
	} catch (error) {
		console.error("Erreur lors de la récupération des invitations:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("droits")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la récupération des invitations",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
