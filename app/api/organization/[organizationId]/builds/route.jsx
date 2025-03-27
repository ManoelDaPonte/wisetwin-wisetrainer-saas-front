// app/api/organization/[organizationId]/builds/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

const prisma = new PrismaClient();

// GET - Récupérer les builds disponibles pour une organisation
export async function GET(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;
		const { searchParams } = new URL(request.url);
		const prefix =
			searchParams.get("prefix") ||
			WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;

		// Vérifier l'authentification
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur
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

		// Vérifier que l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
				userId: user.id,
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer l'organisation
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Si l'organisation n'a pas de container, retourner une liste vide
		if (!organization.azureContainer) {
			return NextResponse.json({
				blobs: [],
				builds: [],
				message:
					"Aucun container Azure n'est associé à cette organisation",
			});
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		try {
			// Récupération du client du container
			const containerClient = blobServiceClient.getContainerClient(
				organization.azureContainer
			);

			// Vérifier si le container existe
			const containerExists = await containerClient.exists();
			if (!containerExists) {
				return NextResponse.json({
					blobs: [],
					builds: [],
					message: `Le container ${organization.azureContainer} n'existe pas`,
				});
			}

			// Récupérer tous les blobs du container avec le préfixe spécifié
			const blobs = [];
			for await (const blob of containerClient.listBlobsFlat({
				prefix,
			})) {
				blobs.push(blob.name);
			}

			console.log(
				`${blobs.length} blobs trouvés dans ${organization.azureContainer}`
			);

			// Traiter les blobs pour en extraire les builds
			const builds = processBuilds(blobs);

			// Récupérer également les formations assignées à l'organisation depuis la base de données
			const assignedTrainings =
				await prisma.organizationTraining.findMany({
					where: {
						organizationId,
						isActive: true,
					},
					include: {
						course: true,
						assignedGroups: {
							include: {
								group: true,
							},
						},
					},
				});

			// Enrichir les builds avec les informations de la base de données
			const enrichedBuilds = builds.map((build) => {
				const assignedTraining = assignedTrainings.find(
					(t) => t.buildId === build.id
				);
				if (assignedTraining) {
					return {
						...build,
						isAssigned: true,
						assignedGroups: assignedTraining.assignedGroups.map(
							(ag) => ({
								id: ag.group.id,
								name: ag.group.name,
							})
						),
					};
				}
				return {
					...build,
					isAssigned: false,
					assignedGroups: [],
				};
			});

			return NextResponse.json({
				blobs,
				builds: enrichedBuilds,
				assignedTrainings,
			});
		} catch (error) {
			console.error(
				`Erreur lors de l'accès au container ${organization.azureContainer}:`,
				error
			);
			return NextResponse.json({
				blobs: [],
				builds: [],
				error: `Erreur lors de l'accès au container: ${error.message}`,
			});
		}
	} catch (error) {
		console.error("Erreur lors de la récupération des builds:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération des builds",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Fonction utilitaire pour traiter les noms de blobs et extraire les métadonnées de builds
function processBuilds(blobs) {
	// Extraire les noms uniques de builds (sans extension)
	const buildIds = new Set();

	blobs.forEach((blob) => {
		// Exemple: "safety-101.data.gz" ou "wisetrainer/safety-101.data.gz" -> "safety-101"
		const match = blob.match(
			/(?:wisetrainer\/)?([^\/]+?)(?:\.data\.gz|\.framework\.js\.gz|\.loader\.js|\.wasm\.gz)$/
		);
		if (match && match[1]) {
			buildIds.add(match[1]);
		}
	});

	// Créer des objets de build à partir des IDs
	return Array.from(buildIds).map((id) => {
		const name = id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			id,
			name,
			description: `Formation interactive sur ${name.toLowerCase()}`,
			imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
			difficulty: "Intermédiaire",
			duration: "30 min",
			category: "Formation d'entreprise",
			isCustomBuild: true,
		};
	});
}

// POST - Uploader un build pour l'organisation
export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;
		const formData = await request.formData();
		const file = formData.get("file");
		const buildId = formData.get("buildId");
		const buildName = formData.get("buildName");
		const buildDescription = formData.get("buildDescription");

		if (!file || !buildId) {
			return NextResponse.json(
				{ error: "Fichier et identifiant de build requis" },
				{ status: 400 }
			);
		}

		// Vérifier l'authentification
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur
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

		// Vérifier que l'utilisateur est admin ou propriétaire de l'organisation
		const membership = await prisma.organizationMember.findFirst({
			where: {
				organizationId,
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

		// Récupérer l'organisation
		const organization = await prisma.organization.findUnique({
			where: { id: organizationId },
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Si l'organisation n'a pas de container, en créer un
		if (!organization.azureContainer) {
			// Générer un nom de container unique
			const containerName = `org-${organizationId.substring(0, 8)}`;

			// Connexion au service Azure Blob Storage
			const blobServiceClient = BlobServiceClient.fromConnectionString(
				process.env.AZURE_STORAGE_CONNECTION_STRING
			);

			// Récupération du client du container
			const containerClient =
				blobServiceClient.getContainerClient(containerName);

			// Créer le container
			await containerClient.createIfNotExists({
				access: "blob", // Accès en lecture publique pour les blobs
			});

			// Mettre à jour l'organisation avec le nom du container
			await prisma.organization.update({
				where: { id: organizationId },
				data: { azureContainer: containerName },
			});

			organization.azureContainer = containerName;
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient = blobServiceClient.getContainerClient(
			organization.azureContainer
		);

		// Chemin du blob
		const blobPath = `${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${buildId}`;

		// Récupération du client du blob
		const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

		// Conversion du fichier en arrayBuffer
		const arrayBuffer = await file.arrayBuffer();

		// Upload du fichier
		await blockBlobClient.uploadData(arrayBuffer);

		// Créer ou mettre à jour l'enregistrement de la formation dans la base de données
		const courseData = {
			courseId: buildId,
			name: buildName || `Formation ${buildId}`,
			description: buildDescription || `Formation interactive ${buildId}`,
			imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
			category: "Formation d'entreprise",
			difficulty: "Intermédiaire",
			duration: "30 min",
		};

		// Vérifier si le cours existe déjà
		let course = await prisma.course.findUnique({
			where: { courseId: buildId },
		});

		// Si le cours n'existe pas, le créer
		if (!course) {
			course = await prisma.course.create({
				data: courseData,
			});
		} else {
			// Sinon, mettre à jour le cours existant
			course = await prisma.course.update({
				where: { courseId: buildId },
				data: courseData,
			});
		}

		// Créer ou mettre à jour l'enregistrement de la formation pour l'organisation
		let organizationTraining = await prisma.organizationTraining.findFirst({
			where: {
				organizationId,
				courseId: course.id,
			},
		});

		if (!organizationTraining) {
			organizationTraining = await prisma.organizationTraining.create({
				data: {
					organizationId,
					courseId: course.id,
					buildId,
					isCustomBuild: true,
				},
			});
		} else {
			organizationTraining = await prisma.organizationTraining.update({
				where: { id: organizationTraining.id },
				data: {
					buildId,
					isCustomBuild: true,
					isActive: true,
				},
			});
		}

		return NextResponse.json({
			success: true,
			message: "Build uploadé avec succès",
			buildId,
			organizationTraining,
		});
	} catch (error) {
		console.error("Erreur lors de l'upload du build:", error);
		return NextResponse.json(
			{
				error: "Échec de l'upload du build",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
