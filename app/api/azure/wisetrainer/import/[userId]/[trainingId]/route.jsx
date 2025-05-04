//app/api/azure/wisetrainer/import/[userId]/[trainingId]/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export async function POST(request, { params }) {
	try {
		const resolvedParams = await params;
		const { userId, trainingId } = resolvedParams;

		// Récupérer les données supplémentaires du corps de la requête
		let requestData = { metadata: null, sourceContainer: null };
		try {
			requestData = await request.json();
		} catch (e) {
			// Pas de corps de requête, utiliser les valeurs par défaut
			console.log(
				"Pas de corps de requête, utilisation des valeurs par défaut"
			);
		}

		if (!userId || !trainingId) {
			return NextResponse.json(
				{ error: "Les paramètres userId et trainingId sont requis" },
				{ status: 400 }
			);
		}

		// Paramètres de configuration - UTILISEZ LE CONTENEUR SOURCE SPÉCIFIÉ OU CONTENEUR PAR DÉFAUT
		const sourceContainer = requestData.sourceContainer || WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE;
		
		console.log(`Conteneur source utilisé pour l'importation: ${sourceContainer}`);
		
		const destContainer = userId;
		const destPrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;
		const sourcePrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;
		
		console.log(
			`Importation de ${trainingId} depuis ${sourceContainer}/${sourcePrefix} vers ${destContainer}/${destPrefix}`
		);

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération des clients des containers
		const sourceContainerClient =
			blobServiceClient.getContainerClient(sourceContainer);
		const destContainerClient =
			blobServiceClient.getContainerClient(destContainer);
			
		// Lister les blobs dans le conteneur source pour déboguer
		console.log(`Recherche des blobs dans ${sourceContainer}...`);
		let foundBlobs = [];
		try {
			for await (const blob of sourceContainerClient.listBlobsFlat()) {
				foundBlobs.push(blob.name);
			}
			console.log(`${foundBlobs.length} blobs trouvés dans ${sourceContainer}`);
			const targetBlobs = foundBlobs.filter(blob => blob.includes(trainingId));
			console.log(`Fichiers pertinents pour ${trainingId}:`);
			targetBlobs.forEach(blob => console.log(` - ${blob}`));
		} catch (listError) {
			console.error(`Erreur lors de la liste des blobs: ${listError.message}`);
		}

		// Vérifier que le container destination existe
		const destExists = await destContainerClient.exists();
		if (!destExists) {
			await destContainerClient.create(); // Créer le container sans définir de politique d'accès (privé par défaut)
			console.log(`Container ${destContainer} créé (accès privé)`);
		}

		// Fichiers à rechercher, simplifiés pour des fichiers .gz et .js (loader)
		const fileExtensions = [
			".data.gz",
			".framework.js.gz",
			".wasm.gz",
			".loader.js", // Le loader est généralement non-compressé
		];

		// Les fichiers nécessaires pour une build Unity WebGL complète
		const requiredFileTypes = [
			".data.gz", 
			".framework.js.gz", 
			".loader.js",
			".wasm.gz",
		];

		// Suivre les fichiers qui ont été copiés
		const copiedFiles = new Set();
		const results = [];

		// Essayer différentes variations de chemins pour trouver les fichiers
		const pathPatterns = [
			`${sourcePrefix}${trainingId}`, // wisetrainer/WiseTrainer_01.data.gz
			`${trainingId}`, // WiseTrainer_01.data.gz
			`${trainingId.toLowerCase()}` // wisetrainer_01.data.gz
		];

		// Pour chaque type de fichier requis
		for (const fileExt of requiredFileTypes) {
			let isCopied = false;
			
			// Essayer différents modèles de chemins
			for (const pathPattern of pathPatterns) {
				if (isCopied) break;
				
				const sourceBlobName = `${pathPattern}${fileExt}`;
				const destBlobName = `${destPrefix}${trainingId}${fileExt}`;
				
				console.log(`Recherche de ${sourceBlobName} dans ${sourceContainer}`);
				
				const sourceBlob = sourceContainerClient.getBlockBlobClient(sourceBlobName);
				
				// Vérifier si le blob source existe
				const exists = await sourceBlob.exists();
				if (!exists) {
					console.log(`${sourceBlobName} non trouvé, essai du format suivant...`);
					continue;
				}
				
				console.log(`Fichier trouvé: ${sourceBlobName}`);
				
				// Copier le blob en téléchargeant puis en téléversant
				try {
					// 1. Télécharger le contenu du blob source
					const downloadResponse = await sourceBlob.download();
					const content = await streamToBuffer(downloadResponse.readableStreamBody);
					
					// 2. Téléverser dans le conteneur de destination
					const destBlob = destContainerClient.getBlockBlobClient(destBlobName);
					
					// Définir les propriétés du blob (type mime, encodage, etc.)
					const blobOptions = {};
					
					// Ajouter des en-têtes de contenu pour les fichiers compressés
					if (fileExt.endsWith('.gz')) {
						blobOptions.blobHTTPHeaders = {
							blobContentEncoding: 'gzip'
						};
					}
					
					// Configurer le type MIME correct
					if (fileExt.includes('.js')) {
						blobOptions.blobHTTPHeaders = {
							...blobOptions.blobHTTPHeaders,
							blobContentType: 'application/javascript'
						};
					} else if (fileExt.includes('.wasm')) {
						blobOptions.blobHTTPHeaders = {
							...blobOptions.blobHTTPHeaders,
							blobContentType: 'application/wasm'
						};
					}
					
					// Téléverser le blob
					await destBlob.uploadData(content, blobOptions);

					results.push({
						file: sourceBlobName,
						status: "success",
						destination: destBlobName,
					});

					console.log(`Copie réussie: ${sourceBlobName} → ${destBlobName}`);
					copiedFiles.add(fileExt);
					isCopied = true;
				} catch (copyError) {
					results.push({
						file: sourceBlobName,
						status: "error",
						message: `Erreur de copie: ${copyError.message}`,
					});
					console.error(`Erreur lors de la copie de ${sourceBlobName}:`, copyError);
				}
			}
			
			// Si le fichier n'a pas été copié
			if (!isCopied) {
				console.warn(`Aucun fichier trouvé pour ${fileExt}`);
				results.push({
					file: `*${fileExt}`,
					status: "error",
					message: "Fichier non trouvé dans le conteneur source",
				});
			}
		}

		// Vérifier si tous les types de fichiers requis ont été copiés
		const success = requiredFileTypes.every((type) => copiedFiles.has(type));

		return NextResponse.json({
			success,
			message: success
				? `Les fichiers nécessaires pour la formation ${trainingId} ont été importés`
				: `Importation partielle - certains fichiers sont manquants`,
			completedFiles: Array.from(copiedFiles),
			missingFiles: requiredFileTypes.filter((type) => !copiedFiles.has(type)),
			results,
		});
	} catch (error) {
		console.error("Erreur lors de l'importation de la formation:", error);
		return NextResponse.json(
			{
				error: "Échec de l'importation de la formation",
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