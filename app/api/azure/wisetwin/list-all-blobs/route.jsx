//app/api/azure/wisetwin/list-all-blobs/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETWIN_CONFIG from "@/lib/config/wisetwin/wisetwin";

export async function GET(request) {
	try {
		// Extraire les paramètres de la requête
		const { searchParams } = new URL(request.url);
		const container =
			searchParams.get("container") ||
			WISETWIN_CONFIG.CONTAINER_NAMES.SOURCE;

		console.log(
			`Listing de TOUS les blobs dans le container ${container} sans filtre`
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
				return NextResponse.json({
					error: `Le container ${container} n'existe pas`,
					success: false,
					blobs: [],
				});
			}

			// Récupération de tous les blobs sans aucun filtre
			const blobs = [];
			for await (const blob of containerClient.listBlobsFlat()) {
				blobs.push({
					name: blob.name,
					contentLength: blob.properties.contentLength,
					lastModified: blob.properties.lastModified,
					contentType: blob.properties.contentType,
				});
			}

			console.log(`${blobs.length} blobs trouvés dans ${container}`);

			// Analyser la structure du container
			const structure = analyzeContainerStructure(
				blobs.map((b) => b.name)
			);

			return NextResponse.json({
				success: true,
				containerName: container,
				totalBlobs: blobs.length,
				blobs,
				structure,
			});
		} catch (containerError) {
			console.error(
				`Erreur lors de l'accès au container ${container}:`,
				containerError
			);
			return NextResponse.json({
				error: `Erreur lors de l'accès au container ${container}`,
				details: containerError.message,
				success: false,
				blobs: [],
			});
		}
	} catch (error) {
		console.error("Erreur lors de la récupération des blobs:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération des blobs",
				details: error.message,
				success: false,
			},
			{ status: 500 }
		);
	}
}

// Fonction pour analyser la structure du container (dossiers, extensions, etc.)
function analyzeContainerStructure(blobNames) {
	// Analyser les préfixes/dossiers
	const folders = new Set();
	blobNames.forEach((name) => {
		const parts = name.split("/");
		if (parts.length > 1) {
			folders.add(parts[0]);
		}
	});

	// Analyser les extensions
	const extensions = new Set();
	blobNames.forEach((name) => {
		const match = name.match(/\.([^\.]+)$/);
		if (match) {
			extensions.add(match[1]);
		}
	});

	// Détecter les potentiels builds Unity
	const unityBuilds = new Set();

	// Pattern pour les fichiers Unity typiques
	const dataFiles = blobNames.filter((name) => name.includes(".data."));
	const frameworkFiles = blobNames.filter((name) =>
		name.includes(".framework.js")
	);
	const loaderFiles = blobNames.filter((name) => name.includes(".loader.js"));
	const wasmFiles = blobNames.filter((name) => name.includes(".wasm"));

	// Extraire les ID de builds pour chaque type de fichier
	dataFiles.forEach((name) => {
		// Extraire le nom de base sans le préfixe ni l'extension
		let baseName = name;
		// Supprimer le préfixe si présent
		if (name.includes("/")) {
			baseName = name.substring(name.lastIndexOf("/") + 1);
		}
		// Supprimer l'extension
		baseName = baseName.replace(/\.data\..+$/, "");
		unityBuilds.add(baseName);
	});

	return {
		folders: Array.from(folders),
		extensions: Array.from(extensions),
		potentialUnityBuilds: Array.from(unityBuilds),
		counts: {
			total: blobNames.length,
			dataFiles: dataFiles.length,
			frameworkFiles: frameworkFiles.length,
			loaderFiles: loaderFiles.length,
			wasmFiles: wasmFiles.length,
		},
	};
}
