//app/api/azure/wisetrainer/builds/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export async function GET(request) {
	try {
		// Extraire les paramètres de la requête
		const { searchParams } = new URL(request.url);
		const container = searchParams.get("container");
		const prefix = searchParams.get("prefix") || "";

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
			const blobs = [];
			for await (const blob of containerClient.listBlobsFlat({
				prefix,
			})) {
				blobs.push(blob.name);
			}

			console.log(`${blobs.length} blobs trouvés dans ${container}`);

			// Traiter les noms de fichiers pour en extraire des métadonnées
			const builds = processBuilds(blobs);

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

// Fonction pour convertir les noms de blobs en métadonnées de formations
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

	// Créer des objets de formation à partir des IDs
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
			id,
			name,
			description: `Formation interactive sur ${name.toLowerCase()}`,
			imageUrl: WISETRAINER_CONFIG.DEFAULT_IMAGE,
			difficulty: "Intermédiaire",
			duration: "30 min",
			category: "Sécurité industrielle",
		};
	});
}
