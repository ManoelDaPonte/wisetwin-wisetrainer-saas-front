import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function GET(request) {
	try {
		// Extraire les paramètres de la requête
		const { searchParams } = new URL(request.url);
		const container = searchParams.get("container");

		if (!container) {
			return NextResponse.json(
				{ error: "Le paramètre 'container' est requis" },
				{ status: 400 }
			);
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient = blobServiceClient.getContainerClient(container);

		// Vérifier si le container existe
		const exists = await containerClient.exists();

		return NextResponse.json({ exists });
	} catch (error) {
		console.error(
			"Erreur lors de la vérification de l'existence du container:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de la vérification du container",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
