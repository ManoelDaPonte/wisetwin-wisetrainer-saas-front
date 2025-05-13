// app/api/blob-fix/[...path]/route.js
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path;
    
    if (!pathSegments || pathSegments.length < 2) {
      return NextResponse.json(
        { error: "Format URL attendu: /api/blob-fix/[containerName]/[blobPath]" },
        { status: 400 }
      );
    }

    // Le premier segment est le containerName, le reste est le chemin du blob
    const containerName = pathSegments[0];
    const blobPath = pathSegments.slice(1).join("/");

    console.log(`[DEBUG] Demande de lien vers: ${containerName}/${blobPath}`);

    // Extraire le nom du fichier à partir du chemin
    let fileName = blobPath;
    if (fileName.startsWith("wisetrainer/")) {
      fileName = fileName.replace("wisetrainer/", "");
    }
    
    // Simplement construire le chemin vers le fichier statique dans /build
    const filePath = `/build/${fileName}`;
    
    console.log(`[DEBUG] Renvoi du chemin: ${filePath}`);
    
    // Renvoyer simplement le chemin du fichier
    return NextResponse.json({ url: filePath });
    
  } catch (error) {
    console.error(`[ERROR] ${error.message}`);
    return NextResponse.json(
      { error: "Échec de récupération", details: error.message },
      { status: 500 }
    );
  }
}