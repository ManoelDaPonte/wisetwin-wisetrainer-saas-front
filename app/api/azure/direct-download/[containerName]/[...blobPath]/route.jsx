//app/api/azure/direct-download/[containerName]/[...blobPath]/route.jsx
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
            return NextResponse.json(
                { error: `Le fichier demandé n'existe pas: ${fullBlobPath}` },
                { status: 404 }
            );
        }

        // Générer une URL SAS temporaire (valable 10 minutes)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 10);
        
        const sasUrl = await blobClient.generateSasUrl({
            expiresOn: expiryTime,
            permissions: { read: true },
        });

        // Rediriger vers l'URL SAS générée
        return NextResponse.redirect(sasUrl);
        
    } catch (error) {
        console.error(`[DIRECT-DOWNLOAD] Erreur:`, error);
        return NextResponse.json(
            {
                error: "Échec de la récupération du fichier",
                details: error.message,
            },
            { status: 500 }
        );
    }
}