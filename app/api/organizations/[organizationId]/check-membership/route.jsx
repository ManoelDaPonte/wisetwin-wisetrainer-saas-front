// app/api/organizations/[organizationId]/check-membership/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	const resolvedParams = await params;
	const organizationId = resolvedParams.organizationId;

	if (!organizationId) {
		return NextResponse.json(
			{ error: "ID d'organisation manquant" },
			{ status: 400 }
		);
	}

	try {
		// Récupérer la session Auth0 de l'utilisateur
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{
					isMember: false,
					error: "Non authentifié",
					message:
						"Vous devez être connecté pour accéder à cette ressource",
				},
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await findUserByAuth0Id(session.user.sub);

		if (!user) {
			return NextResponse.json(
				{
					isMember: false,
					error: "Utilisateur non trouvé",
					message:
						"Votre profil utilisateur n'existe pas dans notre système",
				},
				{ status: 404 }
			);
		}

		// Vérifier si l'utilisateur est membre de cette organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				userId: user.id,
				organizationId: organizationId,
			},
		});

		return NextResponse.json({
			isMember: !!membership,
			// Inclure des informations supplémentaires si besoin
			role: membership?.role || null,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la vérification de l'appartenance:",
			error
		);
		return NextResponse.json(
			{
				isMember: false,
				error: "Erreur serveur",
				message: "Une erreur est survenue lors de la vérification",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
