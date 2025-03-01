// app/api/azure/check-blob-exists/route.js
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
				{ error: "Container and blob parameters are required" },
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
		console.error("Error checking blob existence:", error);
		return NextResponse.json(
			{ error: "Failed to check blob existence", details: error.message },
			{ status: 500 }
		);
	}
}
