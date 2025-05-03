// app/api/formations/[formationId]/route.jsx
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	const resolvedParams = await params;
	const formationId = resolvedParams.formationId;

	// Extraire les paramètres de requête
	const { searchParams } = new URL(request.url);
	const organizationId = searchParams.get("organizationId");

	try {
		// Récupérer la session Auth0 de l'utilisateur
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await findUserByAuth0Id(session.user.sub);

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer la formation depuis la base de données
		const formation = await prisma.formation.findUnique({
			where: {
				id: formationId,
			},
			include: {
				organization: {
					select: {
						id: true,
						name: true,
					},
				},
				builds3D: true,
				courses: true,
				documentation: true,
			},
		});

		if (!formation) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Vérifier les permissions d'accès
		// Si la formation appartient à une organisation
		if (formation.organizationId) {
			// Si l'ID d'organisation est fourni, vérifier qu'il correspond
			if (organizationId && formation.organizationId !== organizationId) {
				return NextResponse.json(
					{
						error: "Cette formation n'appartient pas à l'organisation spécifiée",
					},
					{ status: 403 }
				);
			}

			// Vérifier que l'utilisateur est membre de cette organisation
			const membership = await prisma.organizationMember.findFirst({
				where: {
					userId: user.id,
					organizationId: formation.organizationId,
				},
			});

			if (!membership) {
				return NextResponse.json(
					{
						error: "Vous n'êtes pas autorisé à accéder à cette formation",
					},
					{ status: 403 }
				);
			}
		} else if (!formation.isPublic) {
			// Si la formation n'est pas publique et n'appartient pas à une organisation
			return NextResponse.json(
				{
					error: "Vous n'êtes pas autorisé à accéder à cette formation",
				},
				{ status: 403 }
			);
		}

		// Récupérer le statut d'inscription de l'utilisateur
		const enrollment = await prisma.formationEnrollment.findFirst({
			where: {
				userId: user.id,
				formationId: formation.id,
			},
		});

		// Formater les données pour le front-end
		const formattedFormation = {
			id: formation.id,
			name: formation.name,
			description: formation.description,
			imageUrl: formation.imageUrl || null,
			duration: formation.duration || "Non spécifié",
			level: formation.difficulty || "Intermédiaire",
			category: formation.category || "Formation",
			version: formation.version,
			certification: false, // À adapter selon votre schéma
			isEnrolled: !!enrollment,
			progress: enrollment ? (enrollment.completedAt ? 100 : 0) : 0, // À raffiner selon votre logique de progression
			source: formation.organizationId
				? {
						type: "organization",
						name: formation.organization.name,
						organizationId: formation.organization.id,
				  }
				: {
						type: "wisetwin",
						name: "WiseTwin",
				  },
			components: {
				hasDocumentation: formation.documentation.length > 0,
				hasCourses: formation.courses.length > 0,
				hasBuilds3D: formation.builds3D.length > 0,
			},
			// Ajout d'informations additionnelles sur l'inscription
			enrollment: enrollment
				? {
						startedAt: enrollment.startedAt,
						lastAccessedAt: enrollment.lastAccessedAt,
						completedAt: enrollment.completedAt,
						status: enrollment.currentStatus,
				  }
				: null,
		};

		return NextResponse.json({ formation: formattedFormation });
	} catch (error) {
		console.error("Erreur lors de la récupération de la formation:", error);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la récupération de la formation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
