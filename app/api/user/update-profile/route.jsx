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
 * API pour mettre à jour le profil utilisateur dans la base de données
 * Permet de mettre à jour plusieurs champs en une seule requête
 *
 * @param {Object} request - Requête HTTP
 * @returns {Response} Réponse HTTP avec le statut et un message
 */
export async function POST(request) {
  try {
    // Récupérer la session Auth0 pour vérifier l'authentification
    const session = await auth0.getSession();

    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Récupérer l'identifiant Auth0 de l'utilisateur
    const auth0Id = session.user.sub;

    // Récupérer les données du corps de la requête
    const userData = await request.json();

    // Préparer les données à mettre à jour (validation des champs autorisés)
    const updateData = {};
    
    // Liste des champs autorisés à être mis à jour
    const allowedFields = ["name"];
    
    // Ne garder que les champs autorisés
    Object.keys(userData).forEach(key => {
      if (allowedFields.includes(key)) {
        // Pour les champs de type string, s'assurer qu'ils ne sont pas vides
        if (typeof userData[key] === "string") {
          updateData[key] = userData[key].trim();
        } else {
          updateData[key] = userData[key];
        }
      }
    });

    // Vérifier qu'il y a des données à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucune donnée valide à mettre à jour" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Trouver l'utilisateur dans la base de données Prisma
    const user = await prisma.user.findUnique({
      where: { auth0Id },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Utilisateur non trouvé" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Mettre à jour les données de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          createdAt: updatedUser.createdAt.toISOString(),
          updatedAt: updatedUser.updatedAt.toISOString(),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);

    return new Response(
      JSON.stringify({
        error: "Une erreur est survenue lors de la mise à jour du profil",
        details: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    // S'assurer de déconnecter Prisma pour éviter les fuites de connexion
    await prisma.$disconnect();
  }
}