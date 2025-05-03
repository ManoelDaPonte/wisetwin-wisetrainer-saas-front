// app/api/formations/[formationId]/build3d/route.jsx (simplifié)
import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { PrismaClient } from "@prisma/client";
import { findUserByAuth0Id } from "@/lib/services/auth/userService";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	const formationId = params.formationId;

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

		// Récupérer le Build 3D principal associé à cette formation
		const build3D = await prisma.build3D.findFirst({
			where: {
				formationId: formationId,
			},
			include: {
				modules3D: {
					orderBy: {
						order: "asc",
					},
				},
			},
		});

		if (!build3D) {
			return NextResponse.json(
				{
					error: "Aucun environnement 3D disponible pour cette formation",
				},
				{ status: 404 }
			);
		}

		// Récupérer l'inscription de l'utilisateur pour trouver la progression
		const enrollment = await prisma.formationEnrollment.findFirst({
			where: {
				userId: user.id,
				formationId: formationId,
			},
		});

		// Récupérer la progression de l'utilisateur pour ce build
		let build3DProgress = null;
		if (enrollment) {
			build3DProgress = await prisma.build3DProgress.findFirst({
				where: {
					enrollmentId: enrollment.id,
					build3DId: build3D.id,
				},
				include: {
					moduleProgress: true,
				},
			});

			// Si aucune progression n'existe, en créer une
			if (!build3DProgress) {
				build3DProgress = await prisma.build3DProgress.create({
					data: {
						enrollmentId: enrollment.id,
						build3DId: build3D.id,
						startedAt: new Date(),
						lastAccessAt: new Date(),
					},
				});
			} else {
				// Mettre à jour la date de dernier accès
				await prisma.build3DProgress.update({
					where: {
						id: build3DProgress.id,
					},
					data: {
						lastAccessAt: new Date(),
					},
				});
			}

			// Mettre à jour lastAccessedAt de l'enrollment
			await prisma.formationEnrollment.update({
				where: {
					id: enrollment.id,
				},
				data: {
					lastAccessedAt: new Date(),
				},
			});
		}

		// Formater la réponse
		const responseData = {
			buildId: build3D.id,
			name: build3D.name,
			version: build3D.version,
			status: build3D.status,
			containerName: build3D.containerName,
			azureUrl: build3D.azureUrl,
			objectMapping: build3D.objectMapping,
			modules: build3D.modules3D.map((module) => {
				// Trouver la progression de ce module
				const moduleProgress = build3DProgress?.moduleProgress.find(
					(p) => p.moduleId === module.id
				);

				// Déterminer si le module est verrouillé (logique de progression)
				const moduleIndex = build3D.modules3D.findIndex(
					(m) => m.id === module.id
				);
				const previousModuleCompleted =
					moduleIndex === 0 ||
					(moduleIndex > 0 &&
						build3DProgress?.moduleProgress.some(
							(p) =>
								p.moduleId ===
									build3D.modules3D[moduleIndex - 1].id &&
								p.isCompleted
						));

				const locked = moduleIndex > 0 && !previousModuleCompleted;

				return {
					id: module.id,
					moduleId: module.moduleId,
					title: module.title,
					description: module.description,
					type: module.type,
					order: module.order,
					content: module.content,
					isCompleted: moduleProgress?.isCompleted || false,
					locked: locked,
					buildId: build3D.id,
				};
			}),
		};

		return NextResponse.json(responseData);
	} catch (error) {
		console.error("Erreur lors de la récupération du Build 3D:", error);
		return NextResponse.json(
			{
				error: "Erreur serveur lors de la récupération du Build 3D",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
