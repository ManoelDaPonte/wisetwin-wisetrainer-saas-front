// app/api/organization/[organizationId]/check-membership/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ isMember: false, error: "Non authentifié" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ isMember: false, error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier si l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: user.id,
			},
		});

		if (!membership) {
			return NextResponse.json({ isMember: false }, { status: 200 });
		}

		// L'utilisateur est membre, récupérer des informations supplémentaires sur l'organisation
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
			select: {
				id: true,
				name: true,
				azureContainer: true,
				isActive: true,
			},
		});

		if (!organization) {
			return NextResponse.json(
				{ isMember: false, error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		if (!organization.isActive) {
			return NextResponse.json(
				{
					isMember: true,
					isActive: false,
					role: membership.role,
					message: "L'organisation n'est pas active",
				},
				{ status: 200 }
			);
		}

		// Retourner les informations sur l'appartenance
		return NextResponse.json({
			isMember: true,
			isActive: true,
			role: membership.role, // "OWNER", "ADMIN", "MEMBER"
			organization: {
				id: organization.id,
				name: organization.name,
				containerName: organization.azureContainer,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la vérification d'appartenance:", error);
		return NextResponse.json(
			{
				isMember: false,
				error: "Échec de la vérification d'appartenance",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
