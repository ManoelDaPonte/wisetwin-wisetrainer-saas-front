/**
 * Contexte centralisé pour toutes les données liées aux formations
 * Remplace GuideContext et autres contextes fragmentés
 */

import React, { createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useUserTrainings, useAllTrainings } from '../hooks/useTrainings';
import { useUser } from '../hooks/useUser';

// Créer un client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Créer le contexte
const TrainingContext = createContext(null);

export function TrainingProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TrainingProviderContent>
        {children}
      </TrainingProviderContent>
    </QueryClientProvider>
  );
}

function TrainingProviderContent({ children }) {
  const { user, isLoading: isUserLoading } = useUser();
  const userId = user?.sub;
  
  // Récupérer les formations de l'utilisateur
  const { 
    data: userTrainings = [], 
    isLoading: isUserTrainingsLoading,
    refetch: refetchUserTrainings
  } = useUserTrainings();
  
  // Récupérer toutes les organisations et leurs formations
  const { data: organizations = [] } = useQuery(
    ['organizations'],
    () => fetch('/api/organization').then(res => res.json()),
    { enabled: !!userId }
  );
  
  // Récupérer toutes les formations disponibles (personnelles + organisationnelles)
  const {
    data: allTrainings = [],
    isLoading: isAllTrainingsLoading,
    refetch: refetchAllTrainings
  } = useAllTrainings(organizations);
  
  // Valeurs exposées par le contexte
  const value = {
    // Données
    userTrainings,
    organizations,
    allTrainings,
    
    // État de chargement
    isLoading: isUserLoading || isUserTrainingsLoading || isAllTrainingsLoading,
    
    // Actions pour recharger les données
    refetchUserTrainings,
    refetchAllTrainings,
    
    // Fonctions utilitaires
    getTrainingById: (id) => allTrainings.find(t => t.id === id),
    getTrainingsByOrganization: (orgId) => 
      allTrainings.filter(t => t.source === 'organization' && t.organizationId === orgId),
    getCompletedTrainings: () => 
      userTrainings.filter(t => t.progress && t.progress >= 100),
    getInProgressTrainings: () => 
      userTrainings.filter(t => t.progress && t.progress > 0 && t.progress < 100),
  };
  
  return (
    <TrainingContext.Provider value={value}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTrainingContext() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTrainingContext must be used within a TrainingProvider');
  }
  return context;
}

export default TrainingContext;