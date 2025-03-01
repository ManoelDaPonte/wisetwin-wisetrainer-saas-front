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

		// Fichiers à copier basés sur le nom du build
		const extensions = [
			".data.gz",
			".framework.js.gz",
			".loader.js",
			".wasm.gz",
		];

		// Copier chaque fichier
		const results = [];
		for (const ext of extensions) {
			const sourceBlobName = `${trainingId}${ext}`;
			const destBlobName = `${destPrefix}${trainingId}${ext}`;

			const sourceBlob =
				sourceContainerClient.getBlockBlobClient(sourceBlobName);
			const destBlob =
				destContainerClient.getBlockBlobClient(destBlobName);

			// Vérifier si le blob source existe
			const exists = await sourceBlob.exists();
			if (!exists) {
				results.push({
					file: sourceBlobName,
					status: "error",
					message: "Blob source introuvable",
				});
				console.error(
					`Blob ${sourceBlobName} introuvable dans ${sourceContainer}`
				);
				continue;
			}

			// Copier le blob
			try {
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

		return NextResponse.json({
			success: true,
			message: `${
				results.filter((r) => r.status === "success").length
			} fichiers importés pour la formation ${trainingId}`,
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
