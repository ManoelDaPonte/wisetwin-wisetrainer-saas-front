//app/api/organization/[organizationId]/wisetrainer-builds/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;

		// Vérifier si l'organisation existe
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Obtenir le container Azure de l'organisation
		const containerName = organization.azureContainer;

		if (!containerName) {
			return NextResponse.json({
				courses: [],
				containerName: null,
				message:
					"Cette organisation n'a pas de container Azure configuré",
				success: true,
			});
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupérer les blobs dans le container de l'organisation avec le préfixe wisetrainer/
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Vérifier si le container existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			return NextResponse.json({
				courses: [],
				containerName,
				message: `Le container ${containerName} n'existe pas`,
				success: true,
			});
		}

		// Prefix pour les blobs WiseTrainer - Important: utiliser le préfixe wisetrainer/ et non wisetwin/
		const prefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER; // Doit être "wisetrainer/"

		console.log(
			`Recherche des blobs avec préfixe spécifique wisetrainer/ : '${prefix}'`
		);

		// Récupérer tous les blobs avec le préfixe spécifié
		const blobs = [];
		for await (const blob of containerClient.listBlobsFlat({
			prefix,
		})) {
			blobs.push(blob.name);
		}

		console.log(
			`${blobs.length} blobs trouvés dans ${containerName} avec préfixe '${prefix}'`
		);

		// Si aucun blob n'est trouvé avec le préfixe, essayer sans préfixe
		if (blobs.length === 0) {
			console.log(
				"Aucun blob trouvé avec le préfixe. Essai sans préfixe..."
			);
			for await (const blob of containerClient.listBlobsFlat()) {
				blobs.push(blob.name);
			}
			console.log(
				`${blobs.length} blobs trouvés au total sans filtre de préfixe`
			);
		}

		// Analyser les blobs pour extraire les IDs de formations
		const courseIds = extractCourseIds(blobs, prefix);
		console.log(
			`${courseIds.size} formations identifiées: ${Array.from(
				courseIds
			).join(", ")}`
		);

		// Convertir les IDs en objets formation
		const courses = Array.from(courseIds).map((id) => {
			const name = id
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			return {
				id,
				name,
				description: `Formation interactive ${name.toLowerCase()} fournie par ${
					organization.name
				}`,
				imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
				category: "Formation professionnelle",
				difficulty: "Intermédiaire",
				duration: "30 min",
				features: [
					"Formation interactive",
					"Supports pédagogiques",
					"Évaluation intégrée",
				],
				source: {
					type: "organization",
					organizationId,
					name: organization.name,
					containerName,
				},
			};
		});

		return NextResponse.json({
			courses,
			containerName,
			success: true,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations de l'organisation:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des formations de l'organisation",
				details: error.message,
				success: false,
			},
			{ status: 500 }
		);
	}
}

// Fonction pour extraire les IDs de formations à partir des noms de blobs
function extractCourseIds(blobs, prefix = "") {
	const courseIds = new Set();

	// Patterns pour détecter les différents fichiers de build Unity
	const knownExtensions = [
		/\.data\.(?:gz|br)$/, // données
		/\.framework\.js\.(?:gz|br)$/, // framework
		/\.loader\.js$/, // loader
		/\.wasm\.(?:gz|br)$/, // webassembly
	];

	// Vérifier chaque blob pour voir s'il correspond à un fichier de build Unity
	blobs.forEach((blob) => {
		// IMPORTANT: Ignorer explicitement les fichiers du dossier wisetwin/
		if (blob.startsWith("wisetwin/")) {
			console.log(`Ignoré car dans dossier wisetwin: ${blob}`);
			return;
		}

		// S'assurer que nous traitons uniquement les fichiers du dossier wisetrainer/
		// si le préfixe n'est pas vide et que le blob ne commence pas par ce préfixe, l'ignorer
		if (prefix && !blob.startsWith(prefix)) {
			console.log(`Ignoré car ne commence pas par ${prefix}: ${blob}`);
			return;
		}

		// Vérifier si c'est un fichier de build Unity
		const isUnityBuildFile = knownExtensions.some((pattern) =>
			pattern.test(blob)
		);

		if (!isUnityBuildFile) {
			console.log(`Ignoré car pas un fichier de build Unity: ${blob}`);
			return;
		}

		// Supprimer le préfixe du chemin pour l'analyse (wisetrainer/ ou autre)
		let blobPath = blob;
		if (prefix && blob.startsWith(prefix)) {
			blobPath = blob.substring(prefix.length);
		}

		// Extraire le nom de base (sans l'extension)
		// Si le fichier est par exemple "safety-101.data.gz", on veut obtenir "safety-101"
		const baseNameMatch = blobPath.match(/^([^\.]+)/);

		if (baseNameMatch && baseNameMatch[1]) {
			const baseName = baseNameMatch[1];
			console.log(
				`ID de formation wisetrainer identifié: ${baseName} à partir de ${blob}`
			);
			courseIds.add(baseName);
		} else {
			console.log(`Aucun ID de formation identifié pour ${blob}`);
		}
	});

	return courseIds;
}
