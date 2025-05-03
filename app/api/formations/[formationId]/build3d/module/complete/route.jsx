// app/api/formations/[formationId]/build3d/module/complete/route.jsx (simplifié)
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
	const formationId = params.formationId;
	const data = await request.json();
	const { moduleId, score } = data;

	if (!moduleId) {
		return NextResponse.json(
			{ error: "ID du module requis" },
			{ status: 400 }
		);
	}

	try {
		// Authentification de base
		const session = await auth0.getSession();
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const user = await findUserByAuth0Id(session.user.sub);
		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer l'inscription et la progression
		const enrollment = await prisma.formationEnrollment.findFirst({
			where: {
				userId: user.id,
				formationId: formationId,
			},
		});

		if (!enrollment) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas inscrit à cette formation" },
				{ status: 403 }
			);
		}

		// Récupérer le module
		const module3D = await prisma.module3D.findUnique({
			where: { id: moduleId },
			include: { build3D: true },
		});

		if (!module3D || module3D.build3D.formationId !== formationId) {
			return NextResponse.json(
				{ error: "Module non trouvé" },
				{ status: 404 }
			);
		}

		// Récupérer ou créer le progrès du Build 3D
		let build3DProgress = await prisma.build3DProgress.findFirst({
			where: {
				enrollmentId: enrollment.id,
				build3DId: module3D.build3DId,
			},
		});

		if (!build3DProgress) {
			build3DProgress = await prisma.build3DProgress.create({
				data: {
					enrollmentId: enrollment.id,
					build3DId: module3D.build3DId,
					startedAt: new Date(),
					lastAccessAt: new Date(),
				},
			});
		}

		// Gérer la progression du module
		let moduleProgress = await prisma.module3DProgress.findFirst({
			where: {
				progressId: build3DProgress.id,
				moduleId: moduleId,
			},
		});

		if (moduleProgress) {
			// Mettre à jour le progrès existant
			moduleProgress = await prisma.module3DProgress.update({
				where: { id: moduleProgress.id },
				data: {
					isCompleted: true,
					score: score || moduleProgress.score,
					completedAt: new Date(),
				},
			});
		} else {
			// Créer un nouveau progrès
			moduleProgress = await prisma.module3DProgress.create({
				data: {
					progressId: build3DProgress.id,
					moduleId: moduleId,
					isCompleted: true,
					score: score || null,
					startedAt: new Date(),
					completedAt: new Date(),
				},
			});
		}

		// Vérifier si tous les modules sont complétés pour marquer le build comme terminé
		const allModules = await prisma.module3D.findMany({
			where: {
				build3DId: module3D.build3DId,
				isActive: true,
			},
		});

		const completedModules = await prisma.module3DProgress.findMany({
			where: {
				progressId: build3DProgress.id,
				isCompleted: true,
			},
		});

		if (allModules.length === completedModules.length) {
			await prisma.build3DProgress.update({
				where: { id: build3DProgress.id },
				data: { completedAt: new Date() },
			});
		}

		return NextResponse.json({
			success: true,
			moduleProgress: {
				id: moduleProgress.id,
				isCompleted: moduleProgress.isCompleted,
				score: moduleProgress.score,
				completedAt: moduleProgress.completedAt,
			},
		});
	} catch (error) {
		console.error(
			"Erreur lors de la mise à jour du progrès du module:",
			error
		);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la mise à jour du progrès",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
