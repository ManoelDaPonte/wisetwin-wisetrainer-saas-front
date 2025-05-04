// app/api/azure/fetch-blob-data/[containerName]/[...blobPath]/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function GET(request, { params }) {
	try {
		// S'assurer que params est correctement attendu
		const resolvedParams = await params;
		const containerName = resolvedParams.containerName;
		const blobPath = resolvedParams.blobPath;

		// Joindre tous les segments du chemin pour reconstituer le chemin complet du blob
		const fullBlobPath = Array.isArray(blobPath)
			? blobPath.join("/")
			: blobPath;

		if (!containerName || !fullBlobPath) {
			return NextResponse.json(
				{
					error: "Le nom du container et le chemin du blob sont requis",
				},
				{ status: 400 }
			);
		}

		// Log pour debug
		console.log(
			`[FETCH-BLOB] Tentative d'accès au fichier: ${containerName}/${fullBlobPath}`
		);

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// ⚠️ IMPORTANT : Adaptation pour Unity WebGL
		// Si le fichier demandé correspond à un des types Unity WebGL (.data, .framework.js, .wasm)
		// et qu'il n'existe pas, essayer avec l'extension .gz
		let blobClient = containerClient.getBlobClient(fullBlobPath);
		let exists = await blobClient.exists();
		let actualBlobPath = fullBlobPath;
		let isCompressed = false;

		// Si le fichier n'existe pas et qu'il semble être un fichier Unity WebGL
		if (!exists && (
			fullBlobPath.endsWith(".data") ||
			fullBlobPath.endsWith(".framework.js") ||
			fullBlobPath.endsWith(".wasm")
		)) {
			// Essayer avec l'extension .gz
			const compressedPath = `${fullBlobPath}.gz`;
			console.log(`[FETCH-BLOB] Fichier non trouvé, essai avec: ${containerName}/${compressedPath}`);
			
			const compressedBlobClient = containerClient.getBlobClient(compressedPath);
			const compressedExists = await compressedBlobClient.exists();
			
			if (compressedExists) {
				console.log(`[FETCH-BLOB] Fichier compressé trouvé: ${containerName}/${compressedPath}`);
				blobClient = compressedBlobClient;
				exists = true;
				actualBlobPath = compressedPath;
				isCompressed = true;
			}
		}

		// Vérifier si le blob existe après les tentatives
		if (!exists) {
			console.log(
				`[FETCH-BLOB] Le fichier n'existe pas: ${containerName}/${fullBlobPath}`
			);
			return NextResponse.json(
				{ error: `Le fichier demandé n'existe pas: ${fullBlobPath}` },
				{ status: 404 }
			);
		}

		console.log(
			`[FETCH-BLOB] Le fichier existe: ${containerName}/${actualBlobPath}`
		);

		// Télécharger le contenu du blob
		const downloadResponse = await blobClient.download();
		const content = await streamToBuffer(
			downloadResponse.readableStreamBody
		);

		console.log(
			`[FETCH-BLOB] Contenu téléchargé: ${content.length} octets`
		);

		// Configuration des en-têtes de base
		const headers = {
			"Cache-Control": "no-cache, no-store, must-revalidate", // Désactiver le cache
			"Pragma": "no-cache",
			"Expires": "0",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Expose-Headers": "Content-Length, Content-Type, Content-Encoding, Accept-Ranges",
			"Content-Length": content.length.toString(),
		};

		// Ajouter le Content-Range pour permettre le téléchargement partiel
		headers["Accept-Ranges"] = "bytes";

		// Déterminer le type MIME basé sur le nom du fichier original demandé, pas sur le chemin réel
		let contentType = "application/octet-stream"; // Type par défaut
		
		if (fullBlobPath.endsWith(".framework.js") || fullBlobPath.endsWith(".js")) {
			contentType = "application/javascript";
		} else if (fullBlobPath.endsWith(".wasm")) {
			contentType = "application/wasm";
		} else if (fullBlobPath.endsWith(".data")) {
			contentType = "application/octet-stream";
		} else if (fullBlobPath.endsWith(".json")) {
			contentType = "application/json";
		} else if (fullBlobPath.endsWith(".png")) {
			contentType = "image/png";
		} else if (fullBlobPath.endsWith(".jpg") || fullBlobPath.endsWith(".jpeg")) {
			contentType = "image/jpeg";
		}
		
		headers["Content-Type"] = contentType;

		// Pour les fichiers compressés, ajouter l'en-tête Content-Encoding
		if (isCompressed) {
			headers["Content-Encoding"] = "gzip";
			console.log(`[FETCH-BLOB] Fichier compressé: Ajout de Content-Encoding: gzip`);
		}

		console.log(`[FETCH-BLOB] En-têtes de réponse:`, headers);
		console.log(`[FETCH-BLOB] Envoi du fichier au client, taille: ${content.length} octets, type: ${contentType}`);

		// Retourner les données avec les en-têtes appropriés
		return new NextResponse(content, { headers });
	} catch (error) {
		console.error(`[FETCH-BLOB] Erreur:`, error);
		return NextResponse.json(
			{
				error: "Échec de la récupération du fichier",
				details: error.message,
				stack: error.stack,
			},
			{ status: 500 }
		);
	}
}

// Utilitaire pour convertir un flux en buffer
async function streamToBuffer(readableStream) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		readableStream.on("data", (data) => {
			chunks.push(data instanceof Buffer ? data : Buffer.from(data));
		});
		readableStream.on("end", () => {
			resolve(Buffer.concat(chunks));
		});
		readableStream.on("error", reject);
	});
}