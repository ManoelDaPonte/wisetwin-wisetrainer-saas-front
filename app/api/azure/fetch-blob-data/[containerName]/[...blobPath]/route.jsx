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

		// Télécharger le contenu du blob
		const downloadResponse = await blobClient.download();
		const content = await streamToBuffer(
			downloadResponse.readableStreamBody
		);

		console.log(
			`[FETCH-BLOB] Contenu téléchargé: ${content.length} octets`
		);

		// Configuration des en-têtes pour Unity WebGL
		const headers = {
			"Cache-Control": "public, max-age=3600",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Expose-Headers":
				"Content-Length,Content-Type,Content-Range,Accept-Ranges",
			"Content-Length": content.length.toString(),
		};

		// Pour les fichiers Unity WebGL, on utilise une approche simplifiée
		if (fullBlobPath.endsWith(".gz")) {
			// IMPORTANT: Pour les fichiers .gz, on laisse Unity gérer la décompression
			// en ne spécifiant PAS Content-Encoding et en utilisant le type MIME brut
			if (
				fullBlobPath.includes(".framework.js.gz") ||
				fullBlobPath.includes(".js.gz")
			) {
				headers["Content-Type"] = "application/javascript";
			} else if (fullBlobPath.includes(".wasm.gz")) {
				headers["Content-Type"] = "application/wasm";
			} else if (fullBlobPath.includes(".data.gz")) {
				headers["Content-Type"] = "application/octet-stream";
			} else {
				headers["Content-Type"] = "application/octet-stream";
			}
		} else if (fullBlobPath.endsWith(".js")) {
			headers["Content-Type"] = "application/javascript";
		} else if (fullBlobPath.endsWith(".wasm")) {
			headers["Content-Type"] = "application/wasm";
		} else {
			headers["Content-Type"] = "application/octet-stream";
		}

		console.log(`[FETCH-BLOB] En-têtes de réponse:`, headers);
		console.log(
			`[FETCH-BLOB] Envoi du fichier au client, taille: ${content.length} octets`
		);

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
