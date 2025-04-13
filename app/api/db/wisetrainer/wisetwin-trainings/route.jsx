//app/api/db/wisetrainer/wisetwin-trainings/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export async function GET(request) {
	try {
		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Container WiseTwin
		const containerClient = blobServiceClient.getContainerClient(
			WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE
		);

		// Vérifier que le container existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			return NextResponse.json(
				{ error: "Container WiseTwin non trouvé", trainings: [] },
				{ status: 404 }
			);
		}

		// Récupérer tous les blobs avec le préfixe wisetrainer/
		const blobs = [];
		const prefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;

		for await (const blob of containerClient.listBlobsFlat({ prefix })) {
			blobs.push(blob.name);
		}

		// Traiter les noms de fichiers pour en extraire des métadonnées
		const buildIds = new Set();

		blobs.forEach((blob) => {
			// Exemple: "wisetrainer/safety-101.data.gz" -> "safety-101"
			const match = blob.match(
				/(?:wisetrainer\/)?([^\/]+?)(?:\.data\.gz|\.framework\.js\.gz|\.loader\.js|\.wasm\.gz)$/
			);

			if (match && match[1]) {
				buildIds.add(match[1]);
			}
		});

		// Créer des objets de formation à partir des IDs
		const trainings = Array.from(buildIds).map((id) => {
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
				category: "Formation WiseTwin",
			};
		});

		return NextResponse.json({ trainings });
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des formations WiseTwin:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la récupération des formations",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
