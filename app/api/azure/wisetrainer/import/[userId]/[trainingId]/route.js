// app/api/azure/wisetrainer/import/[userId]/[trainingId]/route.js
import { NextResponse } from 'next/server';
import { BlobServiceClient } from '@azure/storage-blob';

export async function POST(request, { params }) {
  try {
    const { userId, trainingId } = params;
    
    // Connexion au service Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );
    
    // Récupération des containers source et destination
    const sourceContainerClient = blobServiceClient.getContainerClient("wisetrainer-courses");
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
        const sourceBlob = sourceContainerClient.getBlockBlobClient(`wisetrainer/${pattern}`);
        const destBlob = destContainerClient.getBlockBlobClient(`wisetrainer/${pattern}`);
        
        const copyResult = await destBlob.beginCopyFromURL(sourceBlob.url);
        const copyStatus = await copyResult.pollUntilDone();
        
        return { file: pattern, copied: true, status: copyStatus };
      })
    );
    
    return NextResponse.json({ success: true, files: copyResults });
  } catch (error) {
    console.error("Error importing training:", error);
    return NextResponse.json({ error: "Failed to import training" }, { status: 500 });
  }
}