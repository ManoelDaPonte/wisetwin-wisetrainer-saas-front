// app/api/organization/[organizationId]/invitations/[invitationId]/resend/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { resendInvitation } from "@/lib/services/organizations/currentOrganization/currentOrganizationInvitationService";
import { currentOrganizationAuthService } from "@/lib/services/organizations/currentOrganization/currentOrganizationAuthService";
import { currentOrganizationService } from "@/lib/services/organizations/currentOrganization/currentOrganizationService";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST - Renvoyer une invitation
export async function POST(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, invitationId } = resolvedParams;

		// Authentifier l'utilisateur et vérifier qu'il a un rôle d'admin ou de propriétaire
		await currentOrganizationAuthService.authenticateWithRole(
			session,
			organizationId,
			["OWNER", "ADMIN"]
		);

		// Récupérer le nom de l'organisation
		const organization =
			currentOrganizationService.getOrganizationById(organizationId);
		// Renvoyer l'invitation
		await resendInvitation(invitationId, organization.name);

		return NextResponse.json({
			success: true,
			message: "L'invitation a été renvoyée",
		});
	} catch (error) {
		console.error("Erreur lors du renvoi de l'invitation:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("droits")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec du renvoi de l'invitation",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
