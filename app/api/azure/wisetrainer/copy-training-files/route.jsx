// app/api/azure/wisetrainer/copy-training-files/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";
import { PrismaClient } from "@prisma/client";
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Récupérer les données de la requête
    const requestData = await request.json();
    const { userId, courseId, organizationId } = requestData;

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Les paramètres userId et courseId sont requis" },
        { status: 400 }
      );
    }

    // Récupérer le container de l'utilisateur
    const user = await prisma.user.findFirst({
      where: {
        azureContainer: userId
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur ou container non trouvé" },
        { status: 404 }
      );
    }

    // Déterminer le container source
    let sourceContainer;
    
    if (organizationId) {
      // Si c'est une formation d'organisation, récupérer son container
      const organization = await prisma.organization.findUnique({
        where: {
          id: organizationId
        }
      });
      
      if (!organization || !organization.azureContainer) {
        return NextResponse.json(
          { error: "Container de l'organisation non trouvé" },
          { status: 404 }
        );
      }
      
      sourceContainer = organization.azureContainer;
    } else {
      // Sinon utiliser le container par défaut de WiseTrainer
      sourceContainer = WISETRAINER_CONFIG.CONTAINER_NAMES.SOURCE;
    }

    // Connexion au service Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    // Récupération des clients des containers
    const sourceContainerClient = blobServiceClient.getContainerClient(sourceContainer);
    const destContainerClient = blobServiceClient.getContainerClient(userId);
    
    // Configuration des chemins
    const destPrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;
    const sourcePrefix = WISETRAINER_CONFIG.BLOB_PREFIXES.WISETRAINER;
    
    console.log(
      `Copie de ${courseId} depuis ${sourceContainer}/${sourcePrefix} vers ${userId}/${destPrefix}`
    );

    // Vérifier que le container destination existe
    const destExists = await destContainerClient.exists();
    if (!destExists) {
      await destContainerClient.create(); // Créer le container (privé par défaut)
      console.log(`Container ${userId} créé (accès privé)`);
    }

    // Fichiers requis pour une build Unity WebGL complète
    const requiredFileTypes = [
      ".data.gz", 
      ".framework.js.gz", 
      ".loader.js",
      ".wasm.gz",
    ];

    // Suivre les fichiers qui ont été copiés
    const copiedFiles = new Set();
    const results = [];

    // Essayer différentes variations de chemins pour trouver les fichiers
    const pathPatterns = [
      `${sourcePrefix}${courseId}`, // wisetrainer/WiseTrainer_01.data.gz
      `${courseId}`, // WiseTrainer_01.data.gz
      `${courseId.toLowerCase()}` // wisetrainer_01.data.gz
    ];

    // Pour chaque type de fichier requis
    for (const fileExt of requiredFileTypes) {
      let isCopied = false;
      
      // Essayer différents modèles de chemins
      for (const pathPattern of pathPatterns) {
        if (isCopied) break;
        
        const sourceBlobName = `${pathPattern}${fileExt}`;
        const destBlobName = `${destPrefix}${courseId}${fileExt}`;
        
        console.log(`Recherche de ${sourceBlobName} dans ${sourceContainer}`);
        
        const sourceBlob = sourceContainerClient.getBlockBlobClient(sourceBlobName);
        
        // Vérifier si le blob source existe
        const exists = await sourceBlob.exists();
        if (!exists) {
          console.log(`${sourceBlobName} non trouvé, essai du format suivant...`);
          continue;
        }
        
        console.log(`Fichier trouvé: ${sourceBlobName}`);
        
        // Copier le blob en téléchargeant puis en téléversant
        try {
          // 1. Télécharger le contenu du blob source
          const downloadResponse = await sourceBlob.download();
          const content = await streamToBuffer(downloadResponse.readableStreamBody);
          
          // 2. Téléverser dans le conteneur de destination
          const destBlob = destContainerClient.getBlockBlobClient(destBlobName);
          
          // Définir les propriétés du blob (type mime, encodage, etc.)
          const blobOptions = {};
          
          // Ajouter des en-têtes de contenu pour les fichiers compressés
          if (fileExt.endsWith('.gz')) {
            blobOptions.blobHTTPHeaders = {
              blobContentEncoding: 'gzip'
            };
          }
          
          // Configurer le type MIME correct
          if (fileExt.includes('.js')) {
            blobOptions.blobHTTPHeaders = {
              ...blobOptions.blobHTTPHeaders,
              blobContentType: 'application/javascript'
            };
          } else if (fileExt.includes('.wasm')) {
            blobOptions.blobHTTPHeaders = {
              ...blobOptions.blobHTTPHeaders,
              blobContentType: 'application/wasm'
            };
          }
          
          // Téléverser le blob
          await destBlob.uploadData(content, blobOptions);

          results.push({
            file: sourceBlobName,
            status: "success",
            destination: destBlobName,
          });

          console.log(`Copie réussie: ${sourceBlobName} → ${destBlobName}`);
          copiedFiles.add(fileExt);
          isCopied = true;
        } catch (copyError) {
          results.push({
            file: sourceBlobName,
            status: "error",
            message: `Erreur de copie: ${copyError.message}`,
          });
          console.error(`Erreur lors de la copie de ${sourceBlobName}:`, copyError);
        }
      }
      
      // Si le fichier n'a pas été copié
      if (!isCopied) {
        console.warn(`Aucun fichier trouvé pour ${fileExt}`);
        results.push({
          file: `*${fileExt}`,
          status: "error",
          message: "Fichier non trouvé dans le conteneur source",
        });
      }
    }

    // Vérifier si tous les types de fichiers requis ont été copiés
    const success = requiredFileTypes.every((type) => copiedFiles.has(type));

    return NextResponse.json({
      success,
      message: success
        ? `Les fichiers nécessaires pour la formation ${courseId} ont été copiés`
        : `Copie partielle - certains fichiers sont manquants`,
      completedFiles: Array.from(copiedFiles),
      missingFiles: requiredFileTypes.filter((type) => !copiedFiles.has(type)),
      results,
    });
  } catch (error) {
    console.error("Erreur lors de la copie des fichiers de formation:", error);
    return NextResponse.json(
      {
        error: "Échec de la copie des fichiers de formation",
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