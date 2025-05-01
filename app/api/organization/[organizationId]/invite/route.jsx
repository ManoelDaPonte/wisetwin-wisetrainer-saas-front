// app/api/organization/[organizationId]/invite/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import {
	createInvitation,
	sendInvitationEmail,
} from "@/lib/services/organizations/currentOrganization/currentOrganizationInvitationService";
import { currentOrganizationAuthService } from "@/lib/services/organizations/currentOrganization/currentOrganizationAuthService";
import { currentOrganizationService } from "@/lib/services/organizations/currentOrganization/currentOrganizationService";

export async function POST(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;
		const { email, role = "MEMBER" } = await request.json();

		// Valider l'email
		if (!email || !email.trim()) {
			return NextResponse.json(
				{ error: "L'adresse email est requise" },
				{ status: 400 }
			);
		}

		// Valider le rôle
		if (role !== "ADMIN" && role !== "MEMBER") {
			return NextResponse.json(
				{
					error: "Rôle non valide. Les valeurs autorisées sont: ADMIN, MEMBER",
				},
				{ status: 400 }
			);
		}

		// Authentifier l'utilisateur et vérifier qu'il a un rôle d'admin ou de propriétaire
		const { user } =
			await currentOrganizationAuthService.authenticateWithRole(
				session,
				organizationId,
				["OWNER", "ADMIN"]
			);

		// Récupérer l'organisation pour l'email
		const organization =
			await currentOrganizationService.getOrganizationById(
				organizationId
			);

		// Créer l'invitation
		const invitationResult = await createInvitation(
			organizationId,
			user.id,
			{ email, role }
		);

		// Si l'invitation a été créée avec succès, envoyer l'email
		if (invitationResult.success) {
			await sendInvitationEmail(
				email,
				organization.name,
				invitationResult.invitation.inviteCode
			);
		}

		return NextResponse.json({
			success: true,
			message: invitationResult.message,
			invitation: invitationResult.invitation,
		});
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'invitation:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("droits")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de l'envoi de l'invitation",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
