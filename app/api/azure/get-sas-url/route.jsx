//app/api/azure/get-sas-url/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } from "@azure/storage-blob";

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
    
    // Extraction des informations d'identification Azure depuis les variables d'environnement
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    
    if (!accountName || !accountKey) {
      return NextResponse.json(
        { error: "Les informations d'accès Azure ne sont pas configurées correctement" },
        { status: 500 }
      );
    }
    
    // Créer les informations d'identification
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    
    // Créer l'URL de base pour le blob
    const blobUrl = `https://${accountName}.blob.core.windows.net/${container}/${blob}`;
    
    // Définir les permissions et la durée d'expiration (30 minutes)
    const permissions = new BlobSASPermissions();
    permissions.read = true;  // Autoriser uniquement la lecture
    
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 30);
    
    // Générer le token SAS
    const sasToken = generateBlobSASQueryParameters({
      containerName: container,
      blobName: blob,
      permissions: permissions,
      expiresOn: expiryTime,
    }, sharedKeyCredential).toString();
    
    // Construire l'URL complète avec le token SAS
    const sasUrl = `${blobUrl}?${sasToken}`;
    
    return NextResponse.json({ url: sasUrl });
  } catch (error) {
    console.error("Erreur lors de la génération de l'URL SAS:", error);
    return NextResponse.json(
      { error: "Échec de la génération de l'URL SAS", details: error.message },
      { status: 500 }
    );
  }
}