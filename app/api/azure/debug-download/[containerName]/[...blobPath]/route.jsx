//app/api/azure/debug-download/[containerName]/[...blobPath]/route.jsx
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

        console.log(`[DEBUG-DOWNLOAD] Tentative d'accès au fichier: ${containerName}/${fullBlobPath}`);

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
            console.log(`[DEBUG-DOWNLOAD] Le fichier n'existe pas: ${containerName}/${fullBlobPath}`);
            return NextResponse.json(
                { error: `Le fichier demandé n'existe pas: ${fullBlobPath}` },
                { status: 404 }
            );
        }

        console.log(`[DEBUG-DOWNLOAD] Le fichier existe: ${containerName}/${fullBlobPath}`);
        
        // Récupérer les propriétés du blob pour le logging
        const properties = await blobClient.getProperties();
        console.log(`[DEBUG-DOWNLOAD] Propriétés du fichier:`, {
            size: properties.contentLength,
            type: properties.contentType,
            lastModified: properties.lastModified
        });

        // Extraire le nom du fichier pour Content-Disposition
        const filename = fullBlobPath.split('/').pop();

        // Télécharger le contenu du blob
        const downloadResponse = await blobClient.download();
        const content = await streamToBuffer(downloadResponse.readableStreamBody);
        
        console.log(`[DEBUG-DOWNLOAD] Contenu téléchargé: ${content.length} octets`);

        // Configuration pour forcer le téléchargement
        const headers = {
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': 'application/octet-stream',
            'Content-Length': content.length.toString()
        };

        console.log(`[DEBUG-DOWNLOAD] Envoi du fichier au navigateur pour téléchargement`);
        
        // Retourner le contenu en forçant le téléchargement
        return new NextResponse(content, { headers });
        
    } catch (error) {
        console.error(`[DEBUG-DOWNLOAD] Erreur:`, error);
        return NextResponse.json(
            {
                error: "Échec de la récupération du fichier",
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