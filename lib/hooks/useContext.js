"use client";
import { useEffect } from 'react';
import { useContextStore } from '../store/contextStore';

/**
 * Hook pour gérer le contexte actif de l'application
 * @returns {Object} Contexte actif et fonctions utilitaires
 */
export function useContext() {
  const {
    activeContext,
    isInitialized,
    initializeContext,
    setContext,
    resetToPersonal,
    setOrganizationContext,
    isPersonalMode,
    isOrganizationMode,
    getActiveOrganizationId
  } = useContextStore();
  
  // Initialiser le contexte au montage
  useEffect(() => {
    if (!isInitialized) {
      initializeContext();
    }
  }, [isInitialized, initializeContext]);
  
  // Écouter les changements de contexte depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'wisetwin-active-context' && e.newValue) {
        try {
          const newContext = JSON.parse(e.newValue);
          setContext(newContext);
        } catch {
          // Ignorer les erreurs de parsing
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [setContext]);
  
  return {
    activeContext,
    isInitialized,
    setContext,
    resetToPersonal,
    setOrganizationContext,
    isPersonalMode: isPersonalMode(),
    isOrganizationMode: isOrganizationMode(),
    activeOrganizationId: getActiveOrganizationId()
  };
}