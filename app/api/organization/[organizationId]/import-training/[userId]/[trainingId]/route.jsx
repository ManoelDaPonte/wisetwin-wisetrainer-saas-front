// app/api/organization/[organizationId]/import-training/[userId]/[trainingId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId, userId, trainingId } = params;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur actuel
		const currentUser = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!currentUser) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: currentUser.id,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Vérifier que le container utilisateur spécifié correspond bien à l'utilisateur courant
		const targetUser = await prisma.user.findFirst({
			where: {
				azureContainer: userId,
			},
		});

		if (!targetUser || targetUser.id !== currentUser.id) {
			return NextResponse.json(
				{ error: "Container utilisateur non autorisé" },
				{ status: 403 }
			);
		}

		// Récupérer l'organisation
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		if (!organization || !organization.azureContainer) {
			return NextResponse.json(
				{ error: "Container de l'organisation non disponible" },
				{ status: 404 }
			);
		}

		// Configuration pour la copie de blobs
		const sourceContainer = organization.azureContainer;
		const destContainer = userId;
		const destPrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;
		const sourcePrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;

		console.log(
			`Importation de ${trainingId} depuis ${sourceContainer} vers ${destContainer}/${destPrefix}`
		);

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération des clients des containers
		const sourceContainerClient =
			blobServiceClient.getContainerClient(sourceContainer);
		const destContainerClient =
			blobServiceClient.getContainerClient(destContainer);

		// Vérifier que le container destination existe
		const destExists = await destContainerClient.exists();
		if (!destExists) {
			await destContainerClient.create();
			await destContainerClient.setAccessPolicy("blob"); // Accès en lecture publique
			console.log(`Container ${destContainer} créé`);
		}

		// Vérifier que le container source existe
		const sourceExists = await sourceContainerClient.exists();
		if (!sourceExists) {
			return NextResponse.json(
				{ error: "Le container source n'existe pas" },
				{ status: 404 }
			);
		}

		// Fichiers à rechercher et copier, en priorité les .br puis les .gz
		const possibleExtensions = [
			// D'abord essayer les extensions .br
			".data.br",
			".framework.js.br",
			".wasm.br",
			".loader.js", // Le loader est généralement non-compressé
			// Puis les extensions .gz au cas où
			".data.gz",
			".framework.js.gz",
			".wasm.gz",
		];

		// Les fichiers nécessaires pour une build Unity WebGL complète
		const requiredFileTypes = [
			".data", // Données
			".framework.js", // Framework
			".loader.js", // Loader
			".wasm", // WebAssembly
		];

		// Suivre les fichiers qui ont été copiés
		const copiedFileTypes = new Set();
		const results = [];

		// Essayer de copier chaque type de fichier en priorité le format .br
		for (const baseType of requiredFileTypes) {
			let isCopied = false;

			// Trouver le premier format disponible pour ce type (d'abord .br, puis .gz ou non compressé)
			for (const ext of possibleExtensions) {
				// Vérifier si l'extension correspond au type de base
				if (!ext.includes(baseType)) continue;

				// Si ce type a déjà été copié, passer au suivant
				if (copiedFileTypes.has(baseType)) break;

				const sourceBlobName = `${sourcePrefix}${trainingId}${ext}`;
				const destBlobName = `${destPrefix}${trainingId}${ext}`;

				const sourceBlob =
					sourceContainerClient.getBlockBlobClient(sourceBlobName);

				// Vérifier si le blob source existe
				const exists = await sourceBlob.exists();
				if (!exists) {
					console.log(
						`Blob ${sourceBlobName} non trouvé, essai du format suivant...`
					);
					continue;
				}

				// Copier le blob
				try {
					const destBlob =
						destContainerClient.getBlockBlobClient(destBlobName);
					const copyResult = await destBlob.beginCopyFromURL(
						sourceBlob.url
					);
					const copyStatus = await copyResult.pollUntilDone();

					results.push({
						file: sourceBlobName,
						status: "success",
						destination: destBlobName,
					});

					console.log(
						`Copie de ${sourceBlobName} vers ${destBlobName} réussie`
					);

					// Marquer ce type comme copié pour ne pas essayer les autres formats
					copiedFileTypes.add(baseType);
					isCopied = true;
					break;
				} catch (copyError) {
					results.push({
						file: sourceBlobName,
						status: "error",
						message: `Erreur de copie: ${copyError.message}`,
					});
					console.error(
						`Erreur lors de la copie de ${sourceBlobName}:`,
						copyError
					);
				}
			}

			// Si aucun format n'a été trouvé pour ce type de fichier
			if (!isCopied) {
				console.warn(`Aucun fichier trouvé pour le type ${baseType}`);
				results.push({
					file: `${trainingId}${baseType}.*`,
					status: "error",
					message:
						"Aucun format compatible trouvé pour ce type de fichier",
				});
			}
		}

		// Vérifier si tous les types de fichiers requis ont été copiés
		const success = requiredFileTypes.every((type) =>
			copiedFileTypes.has(type)
		);

		// Si la formation a été importée avec succès, enregistrer la progression dans la base de données
		if (success) {
			try {
				// Vérifier si une formation avec cet ID existe déjà dans la base de données
				let course = await prisma.course.findUnique({
					where: { courseId: trainingId },
				});

				// Si la formation n'existe pas encore, la créer
				if (!course) {
					// Vérifier si cette formation est enregistrée comme OrganizationTraining
					const orgTraining =
						await prisma.organizationTraining.findFirst({
							where: {
								organizationId: organizationId,
								buildId: trainingId,
							},
							include: {
								course: true,
							},
						});

					if (orgTraining) {
						// La formation existe déjà comme OrganizationTraining, utiliser les mêmes détails
						course = orgTraining.course;
					} else {
						// Créer une nouvelle entrée avec des détails génériques
						const formattedName = trainingId
							.split("-")
							.map(
								(word) =>
									word.charAt(0).toUpperCase() + word.slice(1)
							)
							.join(" ");

						course = await prisma.course.create({
							data: {
								courseId: trainingId,
								name: formattedName,
								description: `Formation interactive sur ${formattedName.toLowerCase()}`,
								imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
								category: "Formation organisation",
								difficulty: "Intermédiaire",
								duration: "30 min",
							},
						});
					}
				}

				// Initialiser la progression de l'utilisateur pour cette formation
				const userCourse = await prisma.userCourse.create({
					data: {
						userId: currentUser.id,
						courseId: course.id,
						progress: 0,
						startedAt: new Date(),
						lastAccessed: new Date(),
					},
				});

				console.log(
					`Progression initialisée pour l'utilisateur ${currentUser.id} et la formation ${course.id}`
				);
			} catch (error) {
				// Si une erreur survient lors de l'enregistrement en base, ne pas bloquer l'import
				console.error(
					"Erreur lors de l'initialisation de la progression:",
					error
				);
			}
		}

		return NextResponse.json({
			success,
			message: success
				? `Les fichiers nécessaires pour la formation ${trainingId} ont été importés`
				: `Importation partielle - certains fichiers sont manquants`,
			completedFiles: Array.from(copiedFileTypes),
			missingFiles: requiredFileTypes.filter(
				(type) => !copiedFileTypes.has(type)
			),
			results,
		});
	} catch (error) {
		console.error(
			"Erreur lors de l'importation de la formation depuis l'organisation:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de l'importation de la formation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
