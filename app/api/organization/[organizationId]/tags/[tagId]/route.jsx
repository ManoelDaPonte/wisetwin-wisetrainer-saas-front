//app/api/organization/[organizationId]/tags/[tagId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// Mettre à jour un tag
export async function PUT(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, tagId } = resolvedParams;
		const data = await request.json();

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

		// Valider les données
		if (!data.name || data.name.trim() === "") {
			return NextResponse.json(
				{ error: "Le nom du tag est requis" },
				{ status: 400 }
			);
		}

		// Vérifier si un autre tag avec le même nom existe déjà dans cette organisation
		const existingTag = await prisma.organizationTag.findFirst({
			where: {
				organizationId: organizationId,
				name: data.name,
				id: {
					not: tagId,
				},
			},
		});

		if (existingTag) {
			return NextResponse.json(
				{
					error: "Un tag avec ce nom existe déjà dans votre organisation",
				},
				{ status: 400 }
			);
		}

		// Mettre à jour le tag
		const updatedTag = await prisma.organizationTag.update({
			where: {
				id: tagId,
			},
			data: {
				name: data.name,
				description: data.description || null,
				color: data.color || "#3B82F6",
			},
		});

		return NextResponse.json({
			success: true,
			message: "Tag mis à jour avec succès",
			tag: updatedTag,
		});
	} catch (error) {
		console.error("Erreur lors de la mise à jour du tag:", error);
		return NextResponse.json(
			{
				error: "Échec de la mise à jour du tag",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Supprimer un tag
export async function DELETE(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId, tagId } = resolvedParams;

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

		// Supprimer le tag et toutes ses relations (UserTag et TagTraining seront supprimés automatiquement grâce à la cascade)
		await prisma.organizationTag.delete({
			where: {
				id: tagId,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Tag supprimé avec succès",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du tag:", error);
		return NextResponse.json(
			{
				error: "Échec de la suppression du tag",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
