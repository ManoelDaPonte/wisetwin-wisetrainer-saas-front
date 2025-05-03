// app/api/invitations/[inviteCode]/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { invitationService } from "@/lib/services/organizations/invitations/invitationService";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

// GET pour récupérer les détails d'une invitation
export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const { inviteCode } = resolvedParams;

		// Utiliser le service pour récupérer les détails de l'invitation
		const result = await invitationService.getInvitationDetails(inviteCode);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.statusCode }
			);
		}

		return NextResponse.json({ invitation: result.invitation });
	} catch (error) {
		console.error("Erreur lors de la récupération de l'invitation:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération de l'invitation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST pour accepter une invitation
export async function POST(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { inviteCode } = resolvedParams;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Veuillez vous connecter pour accepter l'invitation" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur actuel en utilisant le userService
		const currentUser = await findUserByAuth0Id(session.user.sub);

		if (!currentUser) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Utiliser le service pour accepter l'invitation
		const result = await invitationService.acceptInvitation(
			inviteCode,
			currentUser
		);

		if (!result.success) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.statusCode }
			);
		}

		return NextResponse.json({
			success: true,
			message: result.message,
			membership: result.membership,
			organizationId: result.organizationId,
		});
	} catch (error) {
		console.error("Erreur lors de l'acceptation de l'invitation:", error);
		return NextResponse.json(
			{
				error: "Échec de l'acceptation de l'invitation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
