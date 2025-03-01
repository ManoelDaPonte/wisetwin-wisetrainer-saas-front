// app/api/azure/import-build/route.js
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function POST(request) {
	try {
		const {
			sourceContainer,
			destContainer,
			buildName,
			destPrefix = "",
		} = await request.json();

		if (!sourceContainer || !destContainer || !buildName) {
			return NextResponse.json(
				{
					error: "sourceContainer, destContainer, and buildName are required",
				},
				{ status: 400 }
			);
		}

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
			const sourceBlobName = buildName + ext;
			const destBlobName = `${
				destPrefix ? destPrefix + "/" : ""
			}${buildName}${ext}`;

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
					message: "Source blob not found",
				});
				continue;
			}

			// Copier le blob
			const copyResult = await destBlob.beginCopyFromURL(sourceBlob.url);
			const copyStatus = await copyResult.pollUntilDone();

			results.push({
				file: sourceBlobName,
				status: "success",
				destination: destBlobName,
			});
		}

		return NextResponse.json({
			success: true,
			message: `Imported ${
				results.filter((r) => r.status === "success").length
			} files for build ${buildName}`,
			results,
		});
	} catch (error) {
		console.error("Error importing build:", error);
		return NextResponse.json(
			{ error: "Failed to import build", details: error.message },
			{ status: 500 }
		);
	}
}
