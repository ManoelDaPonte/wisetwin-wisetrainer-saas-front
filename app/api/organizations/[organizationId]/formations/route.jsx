//app/api/organizations/[organizationId]/trainings/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { currentOrganizationTrainingService } from "@/lib/services/organizations/currentOrganization/currentOrganizationTrainingService";
import { currentOrganizationAuthService } from "@/lib/services/organizations/currentOrganization/currentOrganizationAuthService";

/**
 * GET - Récupère toutes les formations d'une organisation
 */
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Authentifier l'utilisateur et vérifier son appartenance à l'organisation
		await currentOrganizationAuthService.authenticateForOrganization(
			session,
			organizationId
		);

		// Récupérer les formations
		const trainings =
			await currentOrganizationTrainingService.getOrganizationTrainings(
				organizationId
			);

		return NextResponse.json({ trainings });
	} catch (error) {
		console.error("Erreur lors de la récupération des formations:", error);

		// Déterminer le code d'état approprié
		let statusCode = 500;
		if (error.message === "Non autorisé") statusCode = 401;
		else if (error.message === "Utilisateur non trouvé") statusCode = 404;
		else if (error.message.includes("n'êtes pas membre")) statusCode = 403;

		return NextResponse.json(
			{
				error: "Échec de la récupération des formations",
				details: error.message,
			},
			{ status: statusCode }
		);
	}
}
