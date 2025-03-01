import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function POST(request) {
	try {
		const { containerName } = await request.json();

		if (!containerName) {
			return NextResponse.json(
				{ error: "Le paramètre containerName est requis" },
				{ status: 400 }
			);
		}

		// Connexion au service Azure Blob Storage
		const blobServiceClient = BlobServiceClient.fromConnectionString(
			process.env.AZURE_STORAGE_CONNECTION_STRING
		);

		// Récupération du client du container
		const containerClient =
			blobServiceClient.getContainerClient(containerName);

		// Créer le container s'il n'existe pas
		const createContainerResponse = await containerClient.createIfNotExists(
			{
				access: "blob", // Accès en lecture publique pour les blobs
			}
		);

		return NextResponse.json({
			success: true,
			created: createContainerResponse.succeeded,
			containerName,
		});
	} catch (error) {
		console.error("Erreur lors de la création du container:", error);
		return NextResponse.json(
			{
				error: "Échec de la création du container",
				details: error.message,
				success: false,
			},
			{ status: 500 }
		);
	}
}
