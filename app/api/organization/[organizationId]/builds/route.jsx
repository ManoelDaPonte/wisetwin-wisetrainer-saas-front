// app/api/organization/[organizationId]/builds/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";
import {
	checkOrganizationAccess,
	withOrganizationAuth,
} from "@/middleware/organizationAuth";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	// Utiliser le middleware d'autorisation
	return withOrganizationAuth(
		request,
		params,
		() => checkOrganizationAccess({ requiredRole: "MEMBER" }),
		handleGetOrganizationBuilds
	);
}

async function handleGetOrganizationBuilds(request, params, authResult) {
	try {
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		const organization = authResult.organization;

		if (!organization.azureContainer) {
			return NextResponse.json(
				{ error: "Cette organisation n'a pas de container Azure" },
				{ status: 400 }
			);
		}

		// Récupérer les builds depuis le container Azure de l'organisation
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient = blobServiceClient.getContainerClient(
			organization.azureContainer
		);

		// Vérifier que le container existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			return NextResponse.json(
				{
					error: `Le container Azure ${organization.azureContainer} n'existe pas`,
				},
				{ status: 404 }
			);
		}

		// Prefix pour les builds WiseTrainer
		const prefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;

		// Récupérer tous les blobs avec le préfixe spécifié
		const blobs = [];
		for await (const blob of containerClient.listBlobsFlat({
			prefix,
		})) {
			blobs.push(blob.name);
		}

		console.log(
			`${blobs.length} blobs trouvés dans ${organization.azureContainer}`
		);

		// Récupérer les modules associés à l'organisation
		const organizationTrainings =
			await prisma.organizationTraining.findMany({
				where: {
					organizationId: organizationId,
					isActive: true,
				},
				include: {
					course: true,
				},
			});

		// Traiter les noms de fichiers pour en extraire des métadonnées
		const builds = await processBuilds(blobs, organizationTrainings);

		// Journaliser l'accès
		console.log(
			`Utilisateur ${authResult.user.id} accède aux builds de l'organisation ${organizationId}`
		);

		return NextResponse.json({
			blobs,
			builds,
			organizationName: organization.name,
			containerName: organization.azureContainer,
		});
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

// Fonction pour convertir les noms de blobs en métadonnées de formations
async function processBuilds(blobs, organizationTrainings = []) {
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

	// Rechercher les cours correspondants dans la base de données
	const courseIds = Array.from(buildIds);
	const coursesInDb = await prisma.course.findMany({
		where: {
			courseId: {
				in: courseIds,
			},
		},
	});

	// Créer un mapping entre les IDs externes et les objets courses
	const courseMapping = {};
	coursesInDb.forEach((course) => {
		courseMapping[course.courseId] = course;
	});

	// Créer des objets de formation à partir des IDs
	const builds = Array.from(buildIds).map((id) => {
		// Chercher si ce build correspond à une formation enregistrée
		const orgTraining = organizationTrainings.find(
			(training) => training.buildId === id
		);

		// Si oui, utiliser les informations de la base de données
		if (orgTraining) {
			return {
				id,
				dbId: orgTraining.course.id, // ID interne de la base de données
				name: orgTraining.course.name,
				description: orgTraining.course.description,
				imageUrl:
					orgTraining.course.imageUrl ||
					WISETRAINER_CONFIG.DEFAULT_IMAGE,
				difficulty: orgTraining.course.difficulty,
				duration: orgTraining.course.duration,
				category: orgTraining.course.category,
				isCustomBuild: orgTraining.isCustomBuild,
				courseId: orgTraining.course.courseId,
			};
		}

		// Si le cours existe dans la base de données (mais pas associé à cette organisation)
		const dbCourse = courseMapping[id];
		if (dbCourse) {
			return {
				id,
				dbId: dbCourse.id, // ID interne de la base de données
				name: dbCourse.name,
				description: dbCourse.description,
				imageUrl: dbCourse.imageUrl || WISETRAINER_CONFIG.DEFAULT_IMAGE,
				difficulty: dbCourse.difficulty,
				duration: dbCourse.duration,
				category: dbCourse.category,
				isCustomBuild: true,
				courseId: dbCourse.courseId,
			};
		}

		// Si aucune métadonnée n'est disponible, simplement retourner l'ID
		return {
			id,
			dbId: null, // Pas d'ID en base de données
			name: id, // Utiliser l'ID comme nom
			description: null,
			imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
			difficulty: null,
			duration: null,
			category: null,
			isCustomBuild: true,
			courseId: id,
		};
	});

	return builds;
}
