// app/api/organization/[organizationId]/members/[memberId]/tags/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { memberService } from "@/lib/services/organizations/organization/memberService";
import { organizationAuthService } from "@/lib/services/organizations/organization/authService";

/**
 * PUT - Met à jour les tags d'un membre
 * Body requis: { tagIds: string[] }
 */
export async function PUT(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, memberId } = resolvedParams;
		const { tagIds } = await request.json();

		// Valider les tagIds
		if (!Array.isArray(tagIds)) {
			return NextResponse.json(
				{ error: "Format de tagIds invalide, un tableau est attendu" },
				{ status: 400 }
			);
		}

		// Authentifier l'utilisateur et vérifier qu'il a un rôle d'admin ou de propriétaire
		const { user } = await organizationAuthService.authenticateWithRole(
			session,
			organizationId,
			["OWNER", "ADMIN"]
		);

		// Mettre à jour les tags du membre
		const updatedTags = await memberService.updateMemberTags(
			organizationId,
			memberId,
			tagIds
		);

		return NextResponse.json({
			success: true,
			tags: updatedTags,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour des tags:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (
			error.message.includes("droits") ||
			error.message.includes("n'êtes pas membre")
		)
			statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la mise à jour des tags",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}

/**
 * GET - Récupère les tags d'un membre
 */
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, memberId } = resolvedParams;

		// Authentifier l'utilisateur et vérifier son appartenance à l'organisation
		await organizationAuthService.authenticateForOrganization(
			session,
			organizationId
		);

		// Récupérer le membre
		const member = await memberService.getMemberById(memberId);

		if (!member) {
			return NextResponse.json(
				{ error: "Membre non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer les tags du membre
		const tags = await memberService.getMemberTags(
			organizationId,
			member.user.id
		);

		return NextResponse.json({
			success: true,
			tags: tags,
		});
	} catch (error) {
		console.error("Erreur lors de la récupération des tags:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (
			error.message === "Utilisateur non trouvé" ||
			error.message === "Membre non trouvé"
		)
			statusCode = 404;
		else if (error.message.includes("n'êtes pas membre")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la récupération des tags",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
