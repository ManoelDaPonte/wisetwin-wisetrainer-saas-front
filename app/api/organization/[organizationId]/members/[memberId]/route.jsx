// app/api/organization/[organizationId]/members/[memberId]/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { currentOrganizationMemberService } from "@/lib/services/organizations/currentOrganization/currentOrganizationMemberService";
import { currentOrganizationAuthService } from "@/lib/services/organizations/currentOrganization/currentOrganizationAuthService";

/**
 * PATCH - Modifie le rôle d'un membre
 * Body requis: { role: "ADMIN" | "MEMBER" }
 */
export async function PATCH(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, memberId } = resolvedParams;
		const { role } = await request.json();

		// Valider le rôle
		if (role !== "ADMIN" && role !== "MEMBER") {
			return NextResponse.json(
				{
					error: "Rôle non valide. Les valeurs autorisées sont: ADMIN, MEMBER",
				},
				{ status: 400 }
			);
		}

		// Authentifier l'utilisateur et vérifier son appartenance à l'organisation
		const { user } =
			await currentOrganizationAuthService.authenticateForOrganization(
				session,
				organizationId
			);

		// Modifier le rôle du membre
		const updatedMember =
			await currentOrganizationMemberService.changeMemberRole(
				organizationId,
				memberId,
				role,
				user.id
			);

		return NextResponse.json({
			success: true,
			member: updatedMember,
		});
	} catch (error) {
		console.error("Erreur lors de la modification du rôle:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (
			error.message.includes("droits") ||
			error.message.includes("impossible")
		)
			statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la modification du rôle",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}

/**
 * DELETE - Supprime un membre de l'organisation
 */
export async function DELETE(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, memberId } = resolvedParams;

		// Authentifier l'utilisateur et vérifier son appartenance à l'organisation
		const { user } =
			await currentOrganizationAuthService.authenticateForOrganization(
				session,
				organizationId
			);

		// Supprimer le membre
		await currentOrganizationMemberService.removeMember(
			organizationId,
			memberId,
			user.id
		);

		return NextResponse.json({
			success: true,
			message: "Le membre a été retiré de l'organisation",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du membre:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (
			error.message.includes("droits") ||
			error.message.includes("impossible")
		)
			statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la suppression du membre",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
