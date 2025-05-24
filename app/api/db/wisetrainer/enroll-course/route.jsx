// app/api/db/wisetrainer/enroll-course/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const session = await auth0.getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer les données de la requête
		const {
			userId,
			courseId,
			sourceType,
			sourceOrganizationId,
			sourceContainerName,
		} = await request.json();

		if (!userId || !courseId) {
			return NextResponse.json(
				{
					error: "Les identifiants d'utilisateur et de cours sont requis",
				},
				{ status: 400 }
			);
		}

		// Vérifier que l'userId est un UUID valide
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(userId)) {
			return NextResponse.json(
				{ error: "ID utilisateur invalide" },
				{ status: 400 }
			);
		}

		// Vérifier que l'utilisateur existe
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier si l'utilisateur a accès à ce cours si c'est une formation d'organisation
		if (sourceType === "organization" && sourceOrganizationId) {
			// Vérifier si l'utilisateur est membre de l'organisation
			const isMember = await prisma.organizationMember.findFirst({
				where: {
					organizationId: sourceOrganizationId,
					userId: user.id,
				},
			});

			if (!isMember) {
				return NextResponse.json(
					{
						error: "Vous n'avez pas accès à cette formation d'organisation",
					},
					{ status: 403 }
				);
			}
		}

		// Normaliser le type de source et l'ID d'organisation
		const normalizedSourceType = sourceType || "wisetwin";
		const normalizedOrgId =
			sourceType === "organization" ? sourceOrganizationId : null;

		// Vérifier si le cours existe déjà dans la base de données avec cette source spécifique
		let course = await prisma.course.findFirst({
			where: {
				courseId: courseId,
				sourceType: normalizedSourceType,
				sourceOrganizationId: normalizedOrgId,
			},
		});

		// Si le cours n'existe pas, le créer avec la source spécifiée
		if (!course) {
			course = await prisma.course.create({
				data: {
					courseId: courseId,
					name: courseId, // Nom par défaut, sera mis à jour par la suite
					description: "Formation interactive",
					category: "Formation",
					difficulty: "Intermédiaire",
					duration: "30 min",
					sourceType: normalizedSourceType,
					sourceOrganizationId: normalizedOrgId,
				},
			});
		}

		// Vérifier si l'utilisateur est déjà inscrit à ce cours spécifique
		const existingUserCourse = await prisma.userCourse.findFirst({
			where: {
				userId: user.id,
				courseId: course.id,
			},
		});

		if (existingUserCourse) {
			// L'utilisateur est déjà inscrit, mettre à jour la date d'accès
			await prisma.userCourse.update({
				where: {
					id: existingUserCourse.id,
				},
				data: {
					lastAccessed: new Date(),
				},
			});

			return NextResponse.json({
				success: true,
				message: "Inscription déjà existante mise à jour",
				userCourse: existingUserCourse,
				source: {
					type: normalizedSourceType,
					organizationId: normalizedOrgId,
					containerName: sourceContainerName,
				},
			});
		}

		// Créer une nouvelle inscription
		const userCourse = await prisma.userCourse.create({
			data: {
				userId: user.id,
				courseId: course.id,
				progress: 0, // Commencer à 0%
				lastAccessed: new Date(),
				startedAt: new Date(),
			},
		});

		// Journaliser
		console.log(
			`Utilisateur ${
				user.id
			} inscrit au cours ${courseId} (source: ${normalizedSourceType}, org: ${
				normalizedOrgId || "none"
			})`
		);

		return NextResponse.json({
			success: true,
			message: "Inscription réussie",
			userCourse,
			source: {
				type: normalizedSourceType,
				organizationId: normalizedOrgId,
				containerName: sourceContainerName,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'inscription au cours:", error);
		return NextResponse.json(
			{
				error: "Échec de l'inscription au cours",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
