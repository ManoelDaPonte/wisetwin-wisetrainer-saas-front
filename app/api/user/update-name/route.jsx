import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

// Note: In a production app, you should use a singleton pattern for Prisma
// instead of creating a new client for each request
const prisma = new PrismaClient();

/**
 * API pour mettre à jour le nom de l'utilisateur dans la base de données
 * Cette API vérifie l'authentification via Auth0 et met à jour le nom de l'utilisateur dans Prisma
 *
 * @param {import('next/server').NextRequest} request - Requête HTTP Next.js
 * @returns {Promise<NextResponse>} Réponse HTTP avec le statut et un message
 */
export async function POST(request) {
  try {
    // Récupérer la session Auth0 pour vérifier l'authentification
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer l'identifiant Auth0 de l'utilisateur
    const auth0Id = session.user.sub;

    // Récupérer les données du corps de la requête
    const { name } = await request.json();

    // Valider les données
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Le nom ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur dans la base de données Prisma
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le nom de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name: name.trim() },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du nom:", error);

    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de la mise à jour du nom",
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    // S'assurer de déconnecter Prisma pour éviter les fuites de connexion
    await prisma.$disconnect();
  }
}