import environmentsData from "./environments-metadata.json";

/**
 * Récupère les métadonnées d'un environnement par son ID
 * @param {string} environmentId - ID de l'environnement
 * @returns {Object} - Métadonnées de l'environnement ou données par défaut
 */
export function getEnvironmentMetadata(environmentId) {
  if (!environmentId) {
    return environmentsData.defaultEnvironment;
  }

  // Normaliser l'ID pour la recherche (enlever les tirets, mettre en minuscules)
  const normalizedId = environmentId.toLowerCase().replace(/[-_\s]/g, "-");

  // Chercher dans les environnements configurés
  const environment =
    environmentsData.environments[normalizedId] ||
    environmentsData.environments[environmentId] ||
    Object.values(environmentsData.environments).find(
      (env) =>
        env.id === environmentId ||
        env.name.toLowerCase().replace(/[-_\s]/g, "-") === normalizedId
    );

  return environment || environmentsData.defaultEnvironment;
}

/**
 * Enrichit un objet build avec les métadonnées d'environnement
 * @param {Object} build - Objet build de base
 * @returns {Object} - Build enrichi avec les métadonnées
 */
export function enrichBuildWithMetadata(build) {
  if (!build) return null;

  const metadata = getEnvironmentMetadata(build.id);

  return {
    ...build,
    // Utiliser les données de métadonnées en priorité, puis les données du build, puis les valeurs par défaut
    name: metadata.displayName || build.name || metadata.name,
    category: metadata.category || build.category || "Environnement industriel",
    description:
      metadata.description ||
      build.description ||
      "Environnement 3D interactif",
    features:
      metadata.features ||
      build.features ||
      environmentsData.defaultEnvironment.features,
    tags: metadata.tags || build.tags || [],
    highlights: metadata.highlights || build.highlights || [],
    provider: metadata.provider || "WiseTwin",
    imageUrl:
      metadata.imageUrl ||
      build.imageUrl ||
      environmentsData.defaultEnvironment.imageUrl,
    // Conserver les données originales du build
    originalData: {
      id: build.id,
      originalName: build.name,
      originalDescription: build.description,
      source: build.source,
    },
  };
}

/**
 * Récupère tous les environnements disponibles
 * @returns {Array} - Liste de tous les environnements
 */
export function getAllEnvironments() {
  return Object.values(environmentsData.environments);
}

/**
 * Recherche des environnements par tag
 * @param {string} tag - Tag à rechercher
 * @returns {Array} - Liste des environnements correspondants
 */
export function getEnvironmentsByTag(tag) {
  return Object.values(environmentsData.environments).filter(
    (env) => env.tags && env.tags.includes(tag)
  );
}

/**
 * Récupère les environnements par difficulté
 * @param {string} difficulty - Niveau de difficulté
 * @returns {Array} - Liste des environnements correspondants
 */
export function getEnvironmentsByDifficulty(difficulty) {
  return Object.values(environmentsData.environments).filter(
    (env) => env.difficulty === difficulty
  );
}

export default {
  getEnvironmentMetadata,
  enrichBuildWithMetadata,
  getAllEnvironments,
  getEnvironmentsByTag,
  getEnvironmentsByDifficulty,
};
