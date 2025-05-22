/**
 * Service centralisé pour toutes les opérations liées aux formations
 * Ce service implémente une couche d'abstraction au-dessus des API
 * pour faciliter la mise en cache et réduire les appels redondants
 */

// Fonction utilitaire pour les requêtes
async function fetchAPI(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

/**
 * Récupère les formations de l'utilisateur avec tous les détails en un seul appel
 * Remplace les appels multiples à user-trainings et course-details
 */
export async function getUserCompleteTrainings(userId) {
  const trainings = await fetchAPI(`/api/db/wisetrainer/user-trainings/${userId}`);
  
  // Enrichir les formations avec les détails (à terme, ceci devrait être fait côté serveur)
  const enrichedTrainings = await Promise.all(
    trainings.map(async (training) => {
      const details = await fetchAPI(`/api/db/wisetrainer/course-details/${training.courseId}`);
      return { ...training, ...details };
    })
  );
  
  return enrichedTrainings;
}

/**
 * Récupère les formations d'une organisation avec tous les détails en un seul appel
 */
export async function getOrganizationCompleteTrainings(organizationId) {
  const builds = await fetchAPI(`/api/organization/${organizationId}/builds`);
  
  // Enrichir les formations avec les détails (à terme, ceci devrait être fait côté serveur)
  const enrichedTrainings = await Promise.all(
    builds.map(async (build) => {
      const details = await fetchAPI(`/api/db/wisetrainer/course-details/organization/${organizationId}/${build.id}`);
      return { ...build, ...details };
    })
  );
  
  return enrichedTrainings;
}

/**
 * Récupère toutes les formations disponibles pour l'utilisateur
 * (personnelles et organisationnelles) en un seul appel
 */
export async function getAllAvailableTrainings(userId, organizations = []) {
  // Récupérer les formations de l'utilisateur
  const userTrainings = await getUserCompleteTrainings(userId);
  
  // Récupérer les formations de chaque organisation
  const orgTrainingsPromises = organizations.map(org => 
    getOrganizationCompleteTrainings(org.id)
  );
  
  const orgTrainings = await Promise.all(orgTrainingsPromises);
  
  // Fusionner toutes les formations
  const allTrainings = [
    ...userTrainings.map(t => ({ ...t, source: 'user' })),
    ...orgTrainings.flat().map(t => ({ ...t, source: 'organization' }))
  ];
  
  return allTrainings;
}

/**
 * Inscrit un utilisateur à une formation
 */
export async function enrollUserToTraining(userId, courseId, orgId = null) {
  const payload = {
    userId,
    courseId,
    organizationId: orgId
  };
  
  return fetchAPI('/api/db/wisetrainer/enroll-course', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

/**
 * Désinscrit un utilisateur d'une formation
 */
export async function unenrollUserFromTraining(userId, courseId) {
  return fetchAPI(`/api/db/wisetrainer/unenroll-course/${userId}/${courseId}`, {
    method: 'DELETE'
  });
}

/**
 * Met à jour la progression d'un utilisateur dans une formation
 */
export async function updateTrainingProgress(userId, courseId, progress) {
  const payload = {
    userId,
    courseId,
    progress
  };
  
  return fetchAPI('/api/db/wisetrainer/update-progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

/**
 * Récupère les formations recommandées pour l'utilisateur
 */
export async function getRecommendedTrainings() {
  return fetchAPI('/api/db/wisetrainer/recommended-trainings');
}

/**
 * Récupère les détails d'un scénario spécifique
 */
export async function getScenarioDetails(courseId, scenarioId) {
  return fetchAPI(`/api/db/wisetrainer/scenario/${courseId}/${scenarioId}`);
}

export default {
  getUserCompleteTrainings,
  getOrganizationCompleteTrainings,
  getAllAvailableTrainings,
  enrollUserToTraining,
  unenrollUserFromTraining,
  updateTrainingProgress,
  getRecommendedTrainings,
  getScenarioDetails
};