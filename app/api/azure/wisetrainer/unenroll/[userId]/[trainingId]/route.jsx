//app/api/azure/wisetrainer/unenroll/[userId]/[trainingId]/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import { PrismaClient } from "@prisma/client";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
	try {
		const resolvedParams = await params;
		const { userId, trainingId } = resolvedParams;

		if (!userId || !trainingId) {
			return NextResponse.json(
				{ error: "Les paramètres userId et trainingId sont requis" },
				{ status: 400 }
			);
		}

		console.log(
			`Suppression de la formation ${trainingId} pour l'utilisateur ${userId}`
		);

		// 1. Supprimer les données de progression de la base de données
		let dbCleanupResults = {
			success: false,
			message: "Base de données non nettoyée",
		};

		try {
			// Trouver l'utilisateur par son container Azure
			const user = await prisma.user.findFirst({
				where: {
					azureContainer: userId,
				},
			});

			if (user) {
				// Trouver le cours
				const course = await prisma.course.findUnique({
					where: {
						courseId: trainingId,
					},
				});

				if (course) {
					// Trouver l'entrée UserCourse correspondante
					const userCourse = await prisma.userCourse.findFirst({
						where: {
							userId: user.id,
							courseId: course.id,
						},
						include: {
							userModules: true,
						},
					});

					if (userCourse) {
						// Supprimer d'abord les modules liés
						if (userCourse.userModules.length > 0) {
							await prisma.userModule.deleteMany({
								where: {
									userCourseId: userCourse.id,
								},
							});
						}

						// Supprimer les réponses liées à ce cours
						await prisma.userResponse.deleteMany({
							where: {
								userId: user.id,
								scenario: {
									module: {
										courseId: course.id,
									},
								},
							},
						});

						// Supprimer l'enregistrement du cours de l'utilisateur
						await prisma.userCourse.delete({
							where: {
								id: userCourse.id,
							},
						});

						dbCleanupResults = {
							success: true,
							message:
								"Données de progression supprimées avec succès",
						};
					} else {
						dbCleanupResults = {
							success: true,
							message:
								"Aucune donnée de progression trouvée pour ce cours",
						};
					}
				} else {
					dbCleanupResults = {
						success: false,
						message: "Cours non trouvé dans la base de données",
					};
				}
			} else {
				dbCleanupResults = {
					success: false,
					message: "Utilisateur non trouvé dans la base de données",
				};
			}
		} catch (dbError) {
			console.error(
				"Erreur lors du nettoyage de la base de données:",
				dbError
			);
			dbCleanupResults = {
				success: false,
				message: `Erreur lors du nettoyage de la base de données: ${dbError.message}`,
				error: dbError,
			};
		}

		// 2. Supprimer les fichiers du blob storage comme avant
		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient = blobServiceClient.getContainerClient(userId);

		// Vérifier que le container existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			return NextResponse.json(
				{
					error: `Le container ${userId} n'existe pas`,
					dbCleanup: dbCleanupResults,
				},
				{ status: 404 }
			);
		}

		// Extensions de fichiers à supprimer - incluant les deux formats de compression
		const extensions = [
			".data.br",
			".data.gz",
			".framework.js.br",
			".framework.js.gz",
			".loader.js",
			".wasm.br",
			".wasm.gz",
		];

		// Liste pour stocker tous les blobs correspondant au préfixe
		const blobsToDelete = [];

		// Récupérer tous les blobs correspondant au préfixe et au training ID
		const prefix = `${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${trainingId}`;

		// Lister tous les blobs qui commencent par ce préfixe
		for await (const blob of containerClient.listBlobsFlat({ prefix })) {
			blobsToDelete.push(blob.name);
		}

		// Supprimer chaque blob trouvé
		const results = [];
		for (const blobName of blobsToDelete) {
			const blobClient = containerClient.getBlockBlobClient(blobName);

			try {
				await blobClient.delete();
				results.push({
					file: blobName,
					status: "success",
				});
				console.log(`Suppression de ${blobName} réussie`);
			} catch (deleteError) {
				results.push({
					file: blobName,
					status: "error",
					message: deleteError.message,
				});
				console.error(
					`Erreur lors de la suppression de ${blobName}:`,
					deleteError
				);
			}
		}

		// Si aucun blob n'a été trouvé, vérifier manuellement chaque extension possible
		if (blobsToDelete.length === 0) {
			for (const ext of extensions) {
				const blobName = `${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${trainingId}${ext}`;
				const blobClient = containerClient.getBlockBlobClient(blobName);

				// Vérifier si le blob existe
				const exists = await blobClient.exists();
				if (!exists) {
					results.push({
						file: blobName,
						status: "skip",
						message: "Blob non trouvé",
					});
					continue;
				}

				// Supprimer le blob
				try {
					await blobClient.delete();
					results.push({
						file: blobName,
						status: "success",
					});
					console.log(`Suppression de ${blobName} réussie`);
				} catch (deleteError) {
					results.push({
						file: blobName,
						status: "error",
						message: deleteError.message,
					});
					console.error(
						`Erreur lors de la suppression de ${blobName}:`,
						deleteError
					);
				}
			}
		}

		return NextResponse.json({
			success: true,
			message: `${
				results.filter((r) => r.status === "success").length
			} fichiers supprimés pour la formation ${trainingId}`,
			dbCleanup: dbCleanupResults,
			results,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la désinscription de la formation:",
			error
		);
		return NextResponse.json(
			{ error: "Échec de la désinscription", details: error.message },
			{ status: 500 }
		);
	}
}
