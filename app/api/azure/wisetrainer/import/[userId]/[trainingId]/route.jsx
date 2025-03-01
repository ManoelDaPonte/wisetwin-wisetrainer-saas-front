// app/api/azure/wisetrainer/import/[userId]/[trainingId]/route.jsx
import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

export async function POST(request, context) {
  try {
    // Récupérer les paramètres de manière asynchrone
    const params = await context.params;
    const { userId, trainingId } = params;
    
    // Connexion au service Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    
    // Récupération des containers source et destination
    const sourceContainerClient = blobServiceClient.getContainerClient("webglbuilds");
    const destContainerClient = blobServiceClient.getContainerClient(userId);
    
    // Vérification de l'existence du container destination, création si nécessaire
    const containerExists = await destContainerClient.exists();
    if (!containerExists) {
      await destContainerClient.create();
      await destContainerClient.setAccessPolicy("blob"); // Rendre public en lecture
    }
    
    // Liste des fichiers à copier (pattern de nommage Unity WebGL)
    const filePatterns = [
      `${trainingId}.loader.js`,
      `${trainingId}.data.gz`,
      `${trainingId}.framework.js.gz`,
      `${trainingId}.wasm.gz`,
    ];
    
    // Copie des fichiers
    const copyResults = await Promise.all(
      filePatterns.map(async (pattern) => {
        try {
          const sourceBlob = sourceContainerClient.getBlockBlobClient(`wisetrainer/${pattern}`);
          const destBlob = destContainerClient.getBlockBlobClient(`wisetrainer/${pattern}`);
          
          // Vérifier si le blob source existe
          const sourceBlobExists = await sourceBlob.exists();
          if (!sourceBlobExists) {
            return { file: pattern, copied: false, status: "Source blob not found" };
          }
          
          const copyResult = await destBlob.beginCopyFromURL(sourceBlob.url);
          const copyStatus = await copyResult.pollUntilDone();
          
          return { file: pattern, copied: true, status: copyStatus };
        } catch (error) {
          console.error(`Error copying file ${pattern}:`, error);
          return { file: pattern, copied: false, error: error.message };
        }
      })
    );
    
    return NextResponse.json({ success: true, files: copyResults });
  } catch (error) {
    console.error("Error importing training:", error);
    return NextResponse.json({ 
      error: "Failed to import training", 
      details: error.message,
      code: error.code || "UNKNOWN_ERROR"
    }, { status: 500 });
  }
}