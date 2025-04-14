//app/api/azure/wisetwin/builds/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

export async function GET(request) {
	try {
		// Extraire les paramètres de la requête
		const { searchParams } = new URL(request.url);
		const container = searchParams.get("container");
		const prefix =
			searchParams.get("prefix") ||
			WISETWIN_CONFIG.BLOB_PREFIXES.WISETWIN;

		if (!container) {
			return NextResponse.json(
				{ error: "Le paramètre 'container' est requis" },
				{ status: 400 }
			);
		}

		console.log(
			`Listing des blobs dans le container ${container} avec préfixe '${prefix}'`
		);

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		try {
			// Récupération du client du container
			const containerClient =
				blobServiceClient.getContainerClient(container);

			// Vérifier que le container existe
			const containerExists = await containerClient.exists();
			if (!containerExists) {
				console.log(`Le container ${container} n'existe pas`);
				return NextResponse.json({ blobs: [], builds: [] });
			}

			// Récupération de tous les blobs avec le préfixe spécifié
			let blobs = [];
			console.log(`Recherche des blobs avec préfixe: '${prefix}'`);
			for await (const blob of containerClient.listBlobsFlat({
				prefix,
			})) {
				blobs.push(blob.name);
			}

			// Si aucun blob n'est trouvé avec le préfixe, essayer sans préfixe
			if (blobs.length === 0 && prefix !== "") {
				console.log(
					"Aucun blob trouvé avec le préfixe. Essai sans préfixe..."
				);
				for await (const blob of containerClient.listBlobsFlat()) {
					blobs.push(blob.name);
				}
			}

			console.log(
				`${blobs.length} blobs trouvés dans ${container} avec préfixe '${prefix}'`
			);

			// Afficher les premiers blobs pour le débogage
			if (blobs.length > 0) {
				console.log("Premiers blobs trouvés:", blobs.slice(0, 5));
			}

			// Traiter les noms de fichiers pour en extraire des métadonnées
			const builds = processBuilds(blobs, prefix);

			return NextResponse.json({ blobs, builds });
		} catch (containerError) {
			console.error(
				`Erreur lors de l'accès au container ${container}:`,
				containerError
			);
			// Si le container n'existe pas ou erreur d'accès, retourner un tableau vide
			return NextResponse.json({ blobs: [], builds: [] });
		}
	} catch (error) {
		console.error("Erreur lors de la récupération des blobs:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération des blobs",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// Fonction pour convertir les noms de blobs en métadonnées d'environnements 3D
function processBuilds(blobs, prefix = "") {
	// Extraire les noms uniques de builds (sans extension)
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
		// Log pour le débogage
		console.log(`Traitement du blob: ${blob}`);

		// Vérifier si c'est un fichier de build Unity
		const isUnityBuildFile = knownExtensions.some((pattern) =>
			pattern.test(blob)
		);

		if (!isUnityBuildFile) {
			console.log(
				`Ignoré: ${blob} n'est pas un fichier de build Unity reconnu`
			);
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
				`ID de build identifié: ${baseName} à partir de ${blob}`
			);
			buildIds.add(baseName);
		} else {
			console.log(`Aucun ID de build identifié pour ${blob}`);
		}
	});

	console.log(`IDs de builds extraits: ${Array.from(buildIds).join(", ")}`);

	// Créer des objets à partir des IDs
	return Array.from(buildIds).map((id) => {
		const name = id
			.split("-")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");

		return {
			id,
			name,
			description: `Environnement 3D interactif de ${name.toLowerCase()}. Explorez cet espace industriel en détail pour vous familiariser avec les équipements et les installations.`,
			imageUrl: WISETWIN_CONFIG.DEFAULT_IMAGE,
			category: "Environnement industriel",
			features: [
				"Visite virtuelle interactive",
				"Navigation intuitive",
				"Familiarisation avec les équipements",
			],
		};
	});
}
