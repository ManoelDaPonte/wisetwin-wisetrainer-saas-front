//app/api/azure/fetch-blob-data/[containerName]/[...blobPath]/route.jsx
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

		console.log(`Récupération du blob: ${containerName}/${fullBlobPath}`);

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Récupération du client du blob
		const blobClient = containerClient.getBlobClient(fullBlobPath);

		// Vérifier si le blob existe
		const exists = await blobClient.exists();
		if (!exists) {
			console.error(
				`Blob ${fullBlobPath} introuvable dans le container ${containerName}`
			);
			return NextResponse.json(
				{ error: `Le fichier demandé n'existe pas: ${fullBlobPath}` },
				{ status: 404 }
			);
		}

		// Télécharger le contenu du blob
		const downloadResponse = await blobClient.download();
		const downloaded = await streamToBuffer(
			downloadResponse.readableStreamBody
		);

		// Déterminer le type MIME et les en-têtes en fonction de l'extension du fichier
		const { contentType, contentEncoding } =
			getContentHeaders(fullBlobPath);

		// Préparer les en-têtes de réponse
		const headers = {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=3600",
		};

		// Ajouter l'en-tête Content-Encoding pour les fichiers compressés
		if (contentEncoding) {
			headers["Content-Encoding"] = contentEncoding;
		}

		// Retourner les données avec les bons en-têtes
		return new NextResponse(downloaded, { headers });
	} catch (error) {
		console.error("Erreur lors de la récupération du blob:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération du fichier",
				details: error.message,
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

// Déterminer le type MIME et l'encodage en fonction de l'extension du fichier
function getContentHeaders(filename) {
	let contentType = "application/octet-stream";
	let contentEncoding = null;

	// Traiter d'abord le cas du loader.js qui est généralement non-compressé
	if (filename.endsWith(".loader.js")) {
		return { contentType: "application/javascript", contentEncoding: null };
	}

	// Déterminer le type de compression
	if (filename.endsWith(".br")) {
		contentEncoding = "br";

		// Enlever l'extension .br pour déterminer le type MIME
		const baseFilename = filename.slice(0, -3);

		if (baseFilename.endsWith(".framework.js")) {
			contentType = "application/javascript";
		} else if (baseFilename.endsWith(".data")) {
			contentType = "application/octet-stream";
		} else if (baseFilename.endsWith(".wasm")) {
			contentType = "application/wasm";
		}
	} else if (filename.endsWith(".gz")) {
		contentEncoding = "gzip";

		// Enlever l'extension .gz pour déterminer le type MIME
		const baseFilename = filename.slice(0, -3);

		if (baseFilename.endsWith(".js")) {
			contentType = "application/javascript";
		} else if (baseFilename.endsWith(".data")) {
			contentType = "application/octet-stream";
		} else if (baseFilename.endsWith(".wasm")) {
			contentType = "application/wasm";
		}
	}
	// Si le fichier n'est pas compressé
	else {
		if (filename.endsWith(".js")) {
			contentType = "application/javascript";
		} else if (filename.endsWith(".wasm")) {
			contentType = "application/wasm";
		} else if (filename.endsWith(".data")) {
			contentType = "application/octet-stream";
		} else if (filename.endsWith(".json")) {
			contentType = "application/json";
		} else if (filename.endsWith(".html")) {
			contentType = "text/html";
		} else if (filename.endsWith(".css")) {
			contentType = "text/css";
		}
	}

	return { contentType, contentEncoding };
}
