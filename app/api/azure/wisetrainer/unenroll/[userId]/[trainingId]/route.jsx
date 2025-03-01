import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer";

export async function DELETE(request, { params }) {
	try {
		const resolvedParams = await params;
		const { userId, trainingId } = resolvedParams;

		if (!userId || !trainingId) {
			return NextResponse.json(
				{ error: "Les paramètres userId et trainingId sont requis" },
				{ status: 400 }
			);
		}

		console.log(
			`Suppression de la formation ${trainingId} pour l'utilisateur ${userId}`
		);

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient = blobServiceClient.getContainerClient(userId);

		// Vérifier que le container existe
		const containerExists = await containerClient.exists();
		if (!containerExists) {
			return NextResponse.json(
				{ error: `Le container ${userId} n'existe pas` },
				{ status: 404 }
			);
		}

		// Extensions de fichiers à supprimer
		const extensions = [
			".data.gz",
			".framework.js.gz",
			".loader.js",
			".wasm.gz",
		];

		// Supprimer chaque fichier
		const results = [];
		for (const ext of extensions) {
			const blobName = `${WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER}${trainingId}${ext}`;
			const blobClient = containerClient.getBlockBlobClient(blobName);

			// Vérifier si le blob existe
			const exists = await blobClient.exists();
			if (!exists) {
				results.push({
					file: blobName,
					status: "skip",
					message: "Blob non trouvé",
				});
				continue;
			}

			// Supprimer le blob
			try {
				await blobClient.delete();
				results.push({
					file: blobName,
					status: "success",
				});
			} catch (deleteError) {
				results.push({
					file: blobName,
					status: "error",
					message: deleteError.message,
				});
			}
		}

		return NextResponse.json({
			success: true,
			message: `${
				results.filter((r) => r.status === "success").length
			} fichiers supprimés pour la formation ${trainingId}`,
			results,
		});
	} catch (error) {
		console.error(
			"Erreur lors de la désinscription de la formation:",
			error
		);
		return NextResponse.json(
			{ error: "Échec de la désinscription", details: error.message },
			{ status: 500 }
		);
	}
}
