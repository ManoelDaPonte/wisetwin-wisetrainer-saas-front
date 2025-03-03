//app/api/azure/wisetrainer/import/[userId]/[trainingId]/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

export async function POST(request, { params }) {
	try {
		const resolvedParams = await params;
		const { userId, trainingId } = resolvedParams;

		if (!userId || !trainingId) {
			return NextResponse.json(
				{ error: "Les paramètres userId et trainingId sont requis" },
				{ status: 400 }
			);
		}

		// Paramètres de configuration
		const sourceContainer = WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE;
		const destContainer = userId;
		const destPrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;

		console.log(
			`Importation de ${trainingId} depuis ${sourceContainer} vers ${destContainer}/${destPrefix}`
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

		// Vérifier que le container destination existe
		const destExists = await destContainerClient.exists();
		if (!destExists) {
			await destContainerClient.create();
			await destContainerClient.setAccessPolicy("blob"); // Accès en lecture publique
			console.log(`Container ${destContainer} créé`);
		}

		// Fichiers à rechercher et copier, en priorité les .br puis les .gz
		const possibleExtensions = [
			// D'abord essayer les extensions .br
			".data.br",
			".framework.js.br",
			".wasm.br",
			".loader.js", // Le loader est généralement non-compressé
			// Puis les extensions .gz au cas où
			".data.gz",
			".framework.js.gz",
			".wasm.gz",
		];

		// Les fichiers nécessaires pour une build Unity WebGL complète
		const requiredFileTypes = [
			".data", // Données
			".framework.js", // Framework
			".loader.js", // Loader
			".wasm", // WebAssembly
		];

		// Suivre les fichiers qui ont été copiés
		const copiedFileTypes = new Set();
		const results = [];

		// Essayer de copier chaque type de fichier en priorité le format .br
		for (const baseType of requiredFileTypes) {
			let isCopied = false;

			// Trouver le premier format disponible pour ce type (d'abord .br, puis .gz ou non compressé)
			for (const ext of possibleExtensions) {
				// Vérifier si l'extension correspond au type de base
				if (!ext.includes(baseType)) continue;

				// Si ce type a déjà été copié, passer au suivant
				if (copiedFileTypes.has(baseType)) break;

				const sourceBlobName = `${trainingId}${ext}`;
				const destBlobName = `${destPrefix}${trainingId}${ext}`;

				const sourceBlob =
					sourceContainerClient.getBlockBlobClient(sourceBlobName);

				// Vérifier si le blob source existe
				const exists = await sourceBlob.exists();
				if (!exists) {
					console.log(
						`Blob ${sourceBlobName} non trouvé, essai du format suivant...`
					);
					continue;
				}

				// Copier le blob
				try {
					const destBlob =
						destContainerClient.getBlockBlobClient(destBlobName);
					const copyResult = await destBlob.beginCopyFromURL(
						sourceBlob.url
					);
					const copyStatus = await copyResult.pollUntilDone();

					results.push({
						file: sourceBlobName,
						status: "success",
						destination: destBlobName,
					});

					console.log(
						`Copie de ${sourceBlobName} vers ${destBlobName} réussie`
					);

					// Marquer ce type comme copié pour ne pas essayer les autres formats
					copiedFileTypes.add(baseType);
					isCopied = true;
					break;
				} catch (copyError) {
					results.push({
						file: sourceBlobName,
						status: "error",
						message: `Erreur de copie: ${copyError.message}`,
					});
					console.error(
						`Erreur lors de la copie de ${sourceBlobName}:`,
						copyError
					);
				}
			}

			// Si aucun format n'a été trouvé pour ce type de fichier
			if (!isCopied) {
				console.warn(`Aucun fichier trouvé pour le type ${baseType}`);
				results.push({
					file: `${trainingId}${baseType}.*`,
					status: "error",
					message:
						"Aucun format compatible trouvé pour ce type de fichier",
				});
			}
		}

		// Vérifier si tous les types de fichiers requis ont été copiés
		const success = requiredFileTypes.every((type) =>
			copiedFileTypes.has(type)
		);

		return NextResponse.json({
			success,
			message: success
				? `Les fichiers nécessaires pour la formation ${trainingId} ont été importés`
				: `Importation partielle - certains fichiers sont manquants`,
			completedFiles: Array.from(copiedFileTypes),
			missingFiles: requiredFileTypes.filter(
				(type) => !copiedFileTypes.has(type)
			),
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
