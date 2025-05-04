//app/api/organization/[organizationId]/tags/training-associations/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// Récupérer toutes les associations tag-formation
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
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
				{ error: "Utilisateur non trouvé" },
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
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer les formations actives pour l'organisation
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		// Récupérer les IDs des formations actives de l'organisation
		const organizationTrainings = await prisma.organizationTraining.findMany({
			where: {
				organizationId: organizationId,
				isActive: true,
			},
			select: {
				courseId: true
			},
		});
		
		const activeTrainingIds = organizationTrainings.map(training => training.courseId);
		
		// Récupérer toutes les associations tag-formation pour cette organisation
		const associations = await prisma.tagTraining.findMany({
			where: {
				tag: {
					organizationId: organizationId,
				},
			},
			include: {
				tag: true,
				course: true,
			},
		});

		// Identifier les associations obsolètes (formations qui n'existent plus)
		const validAssociations = [];
		const obsoleteAssociationIds = [];
		
		associations.forEach(assoc => {
			// Vérifier si la formation associée existe encore dans l'organisation
			if (activeTrainingIds.includes(assoc.courseId)) {
				validAssociations.push(assoc);
			} else {
				obsoleteAssociationIds.push(assoc.id);
			}
		});
		
		// Nettoyer automatiquement les associations obsolètes si l'utilisateur est admin ou owner
		let cleanupPerformed = false;
		if (obsoleteAssociationIds.length > 0 && 
			(membership.role === "ADMIN" || membership.role === "OWNER")) {
			try {
				// Supprimer toutes les associations obsolètes en une seule opération
				await prisma.tagTraining.deleteMany({
					where: {
						id: {
							in: obsoleteAssociationIds
						}
					}
				});
				
				console.log(`Nettoyage automatique: ${obsoleteAssociationIds.length} associations obsolètes supprimées`);
				cleanupPerformed = true;
			} catch (error) {
				console.error("Erreur lors du nettoyage automatique des associations:", error);
				// Continuer malgré l'erreur
			}
		}

		// Transformer les données pour les renvoyer (simplifiées)
		const formattedAssociations = validAssociations.map((assoc) => ({
			id: assoc.id,
			tagId: assoc.tagId,
			courseId: assoc.courseId,
			tagName: assoc.tag.name,
			courseName:
				assoc.course?.name ||
				assoc.course?.courseId ||
				"Formation inconnue"
		}));

		return NextResponse.json({
			associations: formattedAssociations,
			cleanupPerformed,
			cleanupCount: obsoleteAssociationIds.length
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des associations:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des associations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
