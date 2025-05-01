// app/api/organization/[organizationId]/members/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { memberService } from "@/lib/services/organizations/organization/memberService";
import { organizationAuthService } from "@/lib/services/organizations/organization/authService";

/**
 * GET - Récupère tous les membres d'une organisation
 * Paramètres de requête optionnels:
 * - includeTags: boolean - Inclure les tags des membres (par défaut: false)
 */
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;
		const { searchParams } = new URL(request.url);

		// Options
		const includeTags = searchParams.get("includeTags") === "true";

		// Authentifier l'utilisateur et vérifier son appartenance à l'organisation
		await organizationAuthService.authenticateForOrganization(
			session,
			organizationId
		);

		// Récupérer les membres avec ou sans leurs tags
		const members = await memberService.getOrganizationMembers(
			organizationId,
			{ includeTags }
		);

		return NextResponse.json({ members });
	} catch (error) {
		console.error("Erreur lors de la récupération des membres:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("n'êtes pas membre")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la récupération des membres",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
