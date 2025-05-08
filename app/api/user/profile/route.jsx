import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

// Utiliser une instance unique de PrismaClient pour éviter de multiples connexions
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En développement, réutiliser la connexion pour éviter trop de connexions pendant HMR
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

/**
 * API pour récupérer le profil complet de l'utilisateur depuis Prisma
 * Combine les données Auth0 avec les données de la base de données
 *
 * @param {Object} request - Requête HTTP
 * @returns {Response} Réponse HTTP avec les données utilisateur
 */
export async function GET() {
  try {
    // Récupérer la session Auth0
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Récupérer l'identifiant Auth0 de l'utilisateur
    const auth0Id = session.user.sub;

    // Récupérer les données utilisateur depuis Prisma
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      select: {
        id: true,
        name: true,
        email: true,
        azureContainer: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non trouvé dans la base de données" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        user: {
          ...user,
          // Convertir les dates en chaînes pour JSON
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);

    return new Response(
      JSON.stringify({
        error: "Une erreur est survenue lors de la récupération du profil",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await prisma.$disconnect();
  }
}