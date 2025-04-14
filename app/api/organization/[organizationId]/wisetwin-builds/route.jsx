//app/api/organization/[organizationId]/wisetwin-builds/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

const prisma = new PrismaClient();

export async function GET(request, { params }) {
	try {
		const { organizationId } = params;

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
				builds: [],
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

		// Récupérer les blobs dans le container de l'organisation avec le préfixe wisetwin/
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Vérifier si le container existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			return NextResponse.json({
				builds: [],
				containerName,
				message: `Le container ${containerName} n'existe pas`,
				success: true,
			});
		}

		// Prefix pour les blobs WiseTwin - assurons-nous d'utiliser le préfixe wisetwin/ et non wisetrainer/
		const prefix = WISETWIN_CONFIG.BLOB_PREFIXES.WISETWIN; // Doit être "wisetwin/"

		console.log(
			`Recherche des blobs avec préfixe spécifique wisetwin/ : '${prefix}'`
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

		// Analyser les blobs pour extraire les IDs de builds
		const buildIds = extractBuildIds(blobs, prefix);
		console.log(
			`${buildIds.size} builds identifiés: ${Array.from(buildIds).join(
				", "
			)}`
		);

		// Convertir les IDs en objets build
		const builds = Array.from(buildIds).map((id) => {
			const name = id
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");

			return {
				id,
				name,
				description: `Environnement 3D interactif de ${name.toLowerCase()} fourni par ${
					organization.name
				}`,
				imageUrl: "/images/png/wisetwin-placeholder.png",
				category: "Environnement industriel",
				features: [
					"Visite virtuelle interactive",
					"Navigation intuitive",
					"Familiarisation avec les équipements",
				],
				source: {
					type: "organization",
					organizationId,
					organizationName: organization.name,
				},
				// Important: nous identifions le container source pour le chargement direct
				sourceContainer: containerName,
			};
		});

		return NextResponse.json({
			builds,
			containerName,
			success: true,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des builds de l'organisation:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des builds de l'organisation",
				details: error.message,
				success: false,
			},
			{ status: 500 }
		);
	}
}

// Fonction pour extraire les IDs de builds à partir des noms de blobs
function extractBuildIds(blobs, prefix = "") {
	const buildIds = new Set();

	// Patterns pour détecter les différents fichiers de build Unity
	const knownExtensions = [
		/\.data\.(?:gz|br)$/, // données
		/\.framework\.js\.(?:gz|br)$/, // framework
		/\.loader\.js$/, // loader
		/\.wasm\.(?:gz|br)$/, // webassembly
	];

	// Vérifier chaque blob pour voir s'il correspond à un fichier de build Unity
	blobs.forEach((blob) => {
		// IMPORTANT: Ignorer explicitement les fichiers du dossier wisetrainer/
		if (blob.startsWith("wisetrainer/")) {
			console.log(`Ignoré car dans dossier wisetrainer: ${blob}`);
			return;
		}

		// S'assurer que nous traitons uniquement les fichiers du dossier wisetwin/
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

		// Supprimer le préfixe du chemin pour l'analyse (wisetwin/ ou autre)
		let blobPath = blob;
		if (prefix && blob.startsWith(prefix)) {
			blobPath = blob.substring(prefix.length);
		}

		// Extraire le nom de base (sans l'extension)
		// Si le fichier est par exemple "factory-01.data.gz", on veut obtenir "factory-01"
		const baseNameMatch = blobPath.match(/^([^\.]+)/);

		if (baseNameMatch && baseNameMatch[1]) {
			const baseName = baseNameMatch[1];
			console.log(
				`ID de build wisetwin identifié: ${baseName} à partir de ${blob}`
			);
			buildIds.add(baseName);
		} else {
			console.log(`Aucun ID de build identifié pour ${blob}`);
		}
	});

	return buildIds;
}
