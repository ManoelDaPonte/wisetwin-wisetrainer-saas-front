//app/api/azure/check-blob-exists/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function GET(request) {
	try {
		// Extraire les paramètres de la requête
		const { searchParams } = new URL(request.url);
		const container = searchParams.get("container");
		const blob = searchParams.get("blob");

		if (!container || !blob) {
			return NextResponse.json(
				{ error: "Les paramètres 'container' et 'blob' sont requis" },
				{ status: 400 }
			);
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient = blobServiceClient.getContainerClient(container);

		// Récupération du client du blob
		const blobClient = containerClient.getBlobClient(blob);

		// Vérification de l'existence du blob
		const exists = await blobClient.exists();

		return NextResponse.json({ exists });
	} catch (error) {
		console.error(
			"Erreur lors de la vérification de l'existence du blob:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la vérification de l'existence du blob",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
