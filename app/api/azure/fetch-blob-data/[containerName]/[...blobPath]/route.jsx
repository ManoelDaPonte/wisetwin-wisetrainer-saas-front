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

		// Récupération du client du blob
		const blobClient = containerClient.getBlobClient(fullBlobPath);

		// Vérifier si le blob existe
		const exists = await blobClient.exists();
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
			`[FETCH-BLOB] Le fichier existe: ${containerName}/${fullBlobPath}`
		);

		// Récupérer les propriétés du blob
		const properties = await blobClient.getProperties();

		// Extraire le nom du fichier
		const filename = fullBlobPath.split("/").pop();

		// Télécharger le contenu du blob
		const downloadResponse = await blobClient.download();
		const content = await streamToBuffer(
			downloadResponse.readableStreamBody
		);

		console.log(
			`[FETCH-BLOB] Contenu téléchargé: ${content.length} octets`
		);

		// Déterminer les en-têtes pour Unity WebGL en suivant les recommandations Unity
		const { contentType, contentEncoding } = getUnityWebGLHeaders(filename);

		// Préparer les en-têtes de réponse
		const headers = {
			"Content-Type": contentType,
			"Cache-Control": "public, max-age=3600",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Expose-Headers":
				"Content-Length,Content-Type,Content-Encoding",
			"Content-Length": content.length.toString(),
		};

		// IMPORTANT: Ajouter l'en-tête Content-Encoding pour les fichiers compressés
		if (contentEncoding) {
			headers["Content-Encoding"] = contentEncoding;
		}

		console.log(`[FETCH-BLOB] En-têtes de réponse:`, headers);
		console.log(`[FETCH-BLOB] Envoi du fichier au client`);

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

// Configuration spécifique pour Unity WebGL
function getUnityWebGLHeaders(filename) {
	let contentType = "application/octet-stream";
	let contentEncoding = null;

	// Pour les fichiers compressés avec gzip
	if (filename.endsWith(".gz")) {
		contentEncoding = "gzip";

		// Déterminer le type MIME en fonction du nom de base
		const baseFilename = filename.slice(0, -3);

		if (
			baseFilename.endsWith(".framework.js") ||
			baseFilename.endsWith(".js")
		) {
			contentType = "application/javascript";
		} else if (baseFilename.endsWith(".wasm")) {
			contentType = "application/wasm";
		} else if (baseFilename.endsWith(".data")) {
			contentType = "application/octet-stream";
		}
	}
	// Pour les fichiers compressés avec brotli
	else if (filename.endsWith(".br")) {
		contentEncoding = "br";

		// Déterminer le type MIME en fonction du nom de base
		const baseFilename = filename.slice(0, -3);

		if (
			baseFilename.endsWith(".framework.js") ||
			baseFilename.endsWith(".js")
		) {
			contentType = "application/javascript";
		} else if (baseFilename.endsWith(".wasm")) {
			contentType = "application/wasm";
		} else if (baseFilename.endsWith(".data")) {
			contentType = "application/octet-stream";
		}
	}
	// Pour les fichiers non compressés
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

	console.log(
		`[FETCH-BLOB] Type de contenu détecté pour ${filename}: ${contentType}${
			contentEncoding ? ", encodage: " + contentEncoding : ""
		}`
	);

	return { contentType, contentEncoding };
}
