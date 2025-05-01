// app/api/organization/[organizationId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";
import { currentOrganizationService } from "@/lib/services/organizations/currentOrganization/currentOrganizationService";
import { currentOrganizationAuthService } from "@/lib/services/organizations/currentOrganization/currentOrganizationAuthService";

const prisma = new PrismaClient();

// GET pour récupérer les détails d'une organisation spécifique
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Authentifier l'utilisateur et vérifier son appartenance à l'organisation
		const { user, membership } =
			await currentOrganizationAuthService.authenticateForOrganization(
				session,
				organizationId
			);

		// Récupérer les détails de l'organisation avec tous ses membres
		const organization =
			await currentOrganizationService.getOrganizationById(
				organizationId,
				{
					basicInfo: true,
					allMembers: true,
				}
			);

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			organization: {
				...organization,
				userRole: membership.role,
			},
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de l'organisation:",
			error
		);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("n'êtes pas membre")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la récupération de l'organisation",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}

// DELETE pour supprimer une organisation
export async function DELETE(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Authentifier l'utilisateur et vérifier qu'il a le rôle de propriétaire
		await currentOrganizationAuthService.authenticateWithRole(
			session,
			organizationId,
			["OWNER"]
		);

		// Utiliser le service pour supprimer l'organisation et son container
		const deleteResult =
			await currentOrganizationService.deleteOrganization(organizationId);

		if (!deleteResult.success) {
			return NextResponse.json(
				{ error: deleteResult.message },
				{ status: 500 }
			);
		}

		return NextResponse.json(deleteResult);
	} catch (error) {
		console.error(
			"Erreur lors de la suppression de l'organisation:",
			error
		);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("droits")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la suppression de l'organisation",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}

export async function PATCH(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;
		const { name, description, logoUrl } = await request.json();

		// Authentifier l'utilisateur et vérifier qu'il a un rôle d'admin ou de propriétaire
		await currentOrganizationAuthService.authenticateWithRole(
			session,
			organizationId,
			["OWNER", "ADMIN"]
		);

		// Mettre à jour l'organisation
		const updatedOrganization = await prisma.organization.update({
			where: {
				id: organizationId,
			},
			data: {
				name: name,
				description: description,
				logoUrl: logoUrl,
			},
		});

		return NextResponse.json({
			success: true,
			organization: updatedOrganization,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour de l'organisation:",
			error
		);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("droits")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la mise à jour de l'organisation",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
