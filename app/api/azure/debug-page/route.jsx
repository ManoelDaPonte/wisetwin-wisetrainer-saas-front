//app/api/azure/debug-page/route.jsx
import { NextResponse } from "next/server";
import { BlobServiceClient } from "@azure/storage-blob";

export async function GET(request) {
  try {
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const container = searchParams.get("container");
    const prefix = searchParams.get("prefix") || "";

    if (!container) {
      return NextResponse.json(
        { error: "Le paramètre 'container' est requis" },
        { status: 400 }
      );
    }

    console.log(`[DEBUG-PAGE] Affichage des blobs du conteneur: ${container} avec préfixe: ${prefix}`);

    // Connexion au service Azure Blob Storage
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    );

    // Récupération du client du container
    const containerClient = blobServiceClient.getContainerClient(container);

    // Lister les blobs dans le conteneur avec le préfixe donné
    const blobItems = [];
    for await (const blob of containerClient.listBlobsFlat({
      prefix: prefix
    })) {
      blobItems.push({
        name: blob.name,
        size: blob.properties.contentLength,
        lastModified: blob.properties.lastModified
      });
    }

    // Générer le HTML pour afficher les liens de téléchargement
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Debugger Azure Blobs - ${container}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            h1, h2 {
              color: #0078d4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              padding: 10px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .link-container {
              display: flex;
              gap: 10px;
            }
            a {
              color: #0078d4;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
            .search-container {
              margin: 20px 0;
              display: flex;
              gap: 10px;
            }
            input, button {
              padding: 8px;
            }
            button {
              background-color: #0078d4;
              color: white;
              border: none;
              cursor: pointer;
            }
            button:hover {
              background-color: #106ebe;
            }
          </style>
        </head>
        <body>
          <h1>Debugger Azure Blobs - Conteneur: ${container}</h1>
          
          <div class="search-container">
            <form>
              <input type="hidden" name="container" value="${container}">
              <input type="text" name="prefix" placeholder="Préfixe (ex: wisetrainer/)" value="${prefix}" style="width: 300px;">
              <button type="submit">Filtrer</button>
            </form>
          </div>

          <p><b>Nombre total de fichiers trouvés:</b> ${blobItems.length}</p>
          
          ${blobItems.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Nom du fichier</th>
                  <th>Taille</th>
                  <th>Dernière modification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${blobItems.map(blob => `
                  <tr>
                    <td>${blob.name}</td>
                    <td>${formatBytes(blob.size)}</td>
                    <td>${new Date(blob.lastModified).toLocaleString()}</td>
                    <td class="link-container">
                      <a href="/api/azure/debug-download/${container}/${blob.name}" target="_blank">Télécharger</a>
                      <a href="/api/azure/direct-download/${container}/${blob.name}" target="_blank">Direct</a>
                      <a href="/api/azure/fetch-blob-data/${container}/${blob.name}" target="_blank">API fetch-blob-data</a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>Aucun fichier trouvé avec ce préfixe.</p>'}
          
          <h2>Tester le chargement Unity</h2>
          <p>Accédez aux fichiers Unity spécifiques:</p>
          <ul>
            <li><a href="/api/azure/fetch-blob-data/${container}/${prefix}WiseTrainer_01.loader.js" target="_blank">WiseTrainer_01.loader.js</a></li>
            <li><a href="/api/azure/fetch-blob-data/${container}/${prefix}WiseTrainer_01.data.gz" target="_blank">WiseTrainer_01.data.gz</a></li>
            <li><a href="/api/azure/fetch-blob-data/${container}/${prefix}WiseTrainer_01.framework.js.gz" target="_blank">WiseTrainer_01.framework.js.gz</a></li>
            <li><a href="/api/azure/fetch-blob-data/${container}/${prefix}WiseTrainer_01.wasm.gz" target="_blank">WiseTrainer_01.wasm.gz</a></li>
          </ul>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  } catch (error) {
    console.error("[DEBUG-PAGE] Erreur:", error);
    return NextResponse.json(
      {
        error: "Échec de la récupération des blobs",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Fonction pour formater les tailles de fichiers
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}