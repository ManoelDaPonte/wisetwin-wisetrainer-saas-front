/**
 * Hook centralisé pour la gestion des formations avec mise en cache
 * Remplace useCurrentTraining, useOrganizationTrainings et useTrainingOrganization
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useUser } from './useUser';
import trainingService from '../services/api/trainingService';

export function useUserTrainings() {
  const { user } = useUser();
  const userId = user?.sub;

  return useQuery(
    ['userTrainings', userId],
    () => trainingService.getUserCompleteTrainings(userId),
    {
      enabled: !!userId,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  );
}

export function useOrganizationTrainings(organizationId) {
  return useQuery(
    ['organizationTrainings', organizationId],
    () => trainingService.getOrganizationCompleteTrainings(organizationId),
    {
      enabled: !!organizationId,
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
}

export function useAllTrainings(organizations = []) {
  const { user } = useUser();
  const userId = user?.sub;

  return useQuery(
    ['allTrainings', userId, organizations.map(org => org.id).join(',')],
    () => trainingService.getAllAvailableTrainings(userId, organizations),
    {
      enabled: !!userId && organizations.length > 0,
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );
}

export function useTrainingEnrollment() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.sub;

  return useMutation(
    ({ courseId, organizationId }) => 
      trainingService.enrollUserToTraining(userId, courseId, organizationId),
    {
      onSuccess: () => {
        // Invalider les requêtes qui dépendent des formations de l'utilisateur
        queryClient.invalidateQueries(['userTrainings', userId]);
        queryClient.invalidateQueries(['allTrainings']);
      }
    }
  );
}

export function useTrainingUnenrollment() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.sub;

  return useMutation(
    (courseId) => trainingService.unenrollUserFromTraining(userId, courseId),
    {
      onSuccess: () => {
        // Invalider les requêtes qui dépendent des formations de l'utilisateur
        queryClient.invalidateQueries(['userTrainings', userId]);
        queryClient.invalidateQueries(['allTrainings']);
      }
    }
  );
}

export function useTrainingProgress() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.sub;

  return useMutation(
    ({ courseId, progress }) => 
      trainingService.updateTrainingProgress(userId, courseId, progress),
    {
      onSuccess: () => {
        // Invalider uniquement les formations de l'utilisateur
        queryClient.invalidateQueries(['userTrainings', userId]);
      }
    }
  );
}

export function useRecommendedTrainings() {
  return useQuery(
    'recommendedTrainings',
    () => trainingService.getRecommendedTrainings(),
    {
      staleTime: 30 * 60 * 1000, // 30 minutes
      cacheTime: 60 * 60 * 1000, // 1 heure
    }
  );
}

export function useScenarioDetails(courseId, scenarioId) {
  return useQuery(
    ['scenarioDetails', courseId, scenarioId],
    () => trainingService.getScenarioDetails(courseId, scenarioId),
    {
      enabled: !!courseId && !!scenarioId,
    }
  );
}

export default {
  useUserTrainings,
  useOrganizationTrainings,
  useAllTrainings,
  useTrainingEnrollment,
  useTrainingUnenrollment,
  useTrainingProgress,
  useRecommendedTrainings,
  useScenarioDetails
};