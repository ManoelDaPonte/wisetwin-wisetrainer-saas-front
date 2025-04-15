//app/api/organization/[organizationId]/tags/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// Récupérer tous les tags d'une organisation
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

		// Récupérer tous les tags de l'organisation
		const tags = await prisma.organizationTag.findMany({
			where: {
				organizationId: organizationId,
			},
			orderBy: {
				name: "asc",
			},
		});

		// Pour chaque tag, compter le nombre d'utilisateurs et de formations associés
		const tagsWithCounts = await Promise.all(
			tags.map(async (tag) => {
				const userCount = await prisma.userTag.count({
					where: {
						tagId: tag.id,
					},
				});

				const trainingCount = await prisma.tagTraining.count({
					where: {
						tagId: tag.id,
					},
				});

				return {
					...tag,
					userCount,
					trainingCount,
				};
			})
		);

		return NextResponse.json({ tags: tagsWithCounts });
	} catch (error) {
		console.error("Erreur lors de la récupération des tags:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération des tags",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Créer un nouveau tag dans l'organisation
export async function POST(request, { params }) {
	try {
		const session = await auth0.getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;
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

		// Valider les données
		if (!data.name || data.name.trim() === "") {
			return NextResponse.json(
				{ error: "Le nom du tag est requis" },
				{ status: 400 }
			);
		}

		// Vérifier si un tag avec le même nom existe déjà dans cette organisation
		const existingTag = await prisma.organizationTag.findFirst({
			where: {
				organizationId: organizationId,
				name: data.name,
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

		// Créer le tag
		const tag = await prisma.organizationTag.create({
			data: {
				organizationId: organizationId,
				name: data.name,
				description: data.description || null,
				color: data.color || "#3B82F6",
			},
		});

		return NextResponse.json({
			success: true,
			message: "Tag créé avec succès",
			tag,
		});
	} catch (error) {
		console.error("Erreur lors de la création du tag:", error);
		return NextResponse.json(
			{
				error: "Échec de la création du tag",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
