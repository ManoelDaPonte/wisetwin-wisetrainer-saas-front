//app/api/organization/[organizationId]/tags/[tagId]/training/[trainingId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// Créer une association tag-formation
export async function POST(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, tagId, trainingId } = resolvedParams;

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

		// Vérifier si l'utilisateur est membre de l'organisation avec des droits d'administrateur
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: user.id,
				role: {
					in: ["OWNER", "ADMIN"],
				},
			},
		});

		if (!membership) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
				},
				{ status: 403 }
			);
		}

		// Vérifier si le tag existe et appartient à l'organisation
		const tag = await prisma.organizationTag.findFirst({
			where: {
				id: tagId,
				organizationId: organizationId,
			},
		});

		if (!tag) {
			return NextResponse.json(
				{ error: "Tag non trouvé" },
				{ status: 404 }
			);
		}

		// Chercher la formation par courseId ou buildId
		let course = await prisma.course.findUnique({
			where: {
				id: trainingId,
			},
		});

		// Si non trouvé par ID, essayer de chercher par courseId
		if (!course) {
			course = await prisma.course.findUnique({
				where: {
					courseId: trainingId,
				},
			});
		}

		// Si toujours pas trouvé, créer un enregistrement pour cette formation
		if (!course) {
			console.log(
				`Formation non trouvée, création d'un nouvel enregistrement pour ${trainingId}`
			);
			course = await prisma.course.create({
				data: {
					courseId: trainingId,
					name: trainingId, // Utilisé comme nom par défaut
					description: `Formation ${trainingId}`,
					category: "Formation personnalisée",
					difficulty: "Intermédiaire",
					duration: "30 min",
				},
			});
		}

		// Vérifier si l'association existe déjà
		const existingAssociation = await prisma.tagTraining.findFirst({
			where: {
				tagId: tagId,
				courseId: course.id,
			},
		});

		if (existingAssociation) {
			return NextResponse.json(
				{ error: "Cette association existe déjà" },
				{ status: 400 }
			);
		}

		// Créer l'association
		const association = await prisma.tagTraining.create({
			data: {
				tagId: tagId,
				courseId: course.id,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Association créée avec succès",
			association,
		});
	} catch (error) {
		console.error("Erreur lors de la création de l'association:", error);
		return NextResponse.json(
			{
				error: "Échec de la création de l'association",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Supprimer une association tag-formation (mise à jour similaire)
export async function DELETE(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, tagId, trainingId } = resolvedParams;

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

		// Vérifier si l'utilisateur est membre de l'organisation avec des droits d'administrateur
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: user.id,
				role: {
					in: ["OWNER", "ADMIN"],
				},
			},
		});

		if (!membership) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits nécessaires pour effectuer cette action",
				},
				{ status: 403 }
			);
		}

		// Chercher la formation par ID ou courseId
		let course = await prisma.course.findUnique({
			where: {
				id: trainingId,
			},
		});

		// Si non trouvé par ID, essayer de chercher par courseId
		if (!course) {
			course = await prisma.course.findUnique({
				where: {
					courseId: trainingId,
				},
			});
		}

		if (!course) {
			return NextResponse.json(
				{ error: "Formation non trouvée" },
				{ status: 404 }
			);
		}

		// Vérifier si l'association existe
		const association = await prisma.tagTraining.findFirst({
			where: {
				tagId: tagId,
				courseId: course.id,
			},
		});

		if (!association) {
			return NextResponse.json(
				{ error: "Association non trouvée" },
				{ status: 404 }
			);
		}

		// Supprimer l'association
		await prisma.tagTraining.delete({
			where: {
				id: association.id,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Association supprimée avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression de l'association:", error);
		return NextResponse.json(
			{
				error: "Échec de la suppression de l'association",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
