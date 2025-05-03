// scripts/export-formation.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ID de la formation à exporter
const FORMATION_ID = process.argv[2]; // Récupérer l'ID depuis les arguments de ligne de commande

if (!FORMATION_ID) {
  console.error('Veuillez spécifier un ID de formation: node export-formation.js <formationId>');
  process.exit(1);
}

async function exportFormation() {
  try {
    // Récupérer la formation avec toutes ses relations
    const formation = await prisma.formation.findUnique({
      where: {
        id: FORMATION_ID,
      },
      include: {
        organization: true,
        // Inclure les environnements 3D et leurs modules
        builds3D: {
          include: {
            modules3D: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        // Inclure les cours et leurs leçons
        courses: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        // Inclure la documentation
        documentation: true,
      },
    });

    if (!formation) {
      console.error(`Formation avec l'ID ${FORMATION_ID} non trouvée.`);
      process.exit(1);
    }

    // Préparer le dossier d'exportation
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Générer un nom de fichier basé sur le nom de la formation
    const safeFileName = formation.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeFileName}-${formation.id}.json`;
    const filePath = path.join(exportDir, fileName);

    // Écrire les données dans un fichier JSON
    fs.writeFileSync(
      filePath,
      JSON.stringify(formation, null, 2),
      'utf8'
    );

    console.log(`Formation exportée avec succès: ${filePath}`);
  } catch (error) {
    console.error('Erreur lors de l\'exportation de la formation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportFormation();