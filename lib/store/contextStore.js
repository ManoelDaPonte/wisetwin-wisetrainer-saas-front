import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cacheManager } from '../utils/cache';

/**
 * Store pour gérer le contexte actif de l'application (personnel ou organisation)
 * Ce store centralise la gestion du contexte et synchronise avec localStorage
 */
export const useContextStore = create(
  persist(
    (set, get) => ({
  // État initial
  activeContext: { type: 'personal', name: 'Mode Personnel' },
  isInitialized: false,
  
  /**
   * Initialise le contexte depuis localStorage
   * À appeler une fois au démarrage de l'application
   */
  initializeContext: () => {
    if (get().isInitialized) return;
    
    const storedContext = localStorage.getItem('wisetwin-active-context');
    if (storedContext) {
      try {
        const context = JSON.parse(storedContext);
        set({ 
          activeContext: context,
          isInitialized: true 
        });
      } catch {
        // En cas d'erreur, utiliser le contexte par défaut
        set({ 
          activeContext: { type: 'personal', name: 'Mode Personnel' },
          isInitialized: true 
        });
      }
    } else {
      set({ isInitialized: true });
    }
  },
  
  /**
   * Change le contexte actif
   * @param {Object} context - Nouveau contexte { type: 'personal'|'organization', name: string, organizationId?: string }
   */
  setContext: (context) => {
    const currentContext = get().activeContext;
    
    // Si le contexte n'a pas changé, ne rien faire
    if (currentContext.type === context.type && 
        currentContext.organizationId === context.organizationId) {
      return;
    }
    
    // Invalider le cache lors du changement de contexte
    // Ceci forcera le rechargement des données pour le nouveau contexte
    cacheManager.clear();
    
    // Mettre à jour le store
    set({ activeContext: context });
    
    // Synchroniser avec localStorage
    localStorage.setItem('wisetwin-active-context', JSON.stringify(context));
    
    // Émettre un événement personnalisé pour notifier les composants
    window.dispatchEvent(new CustomEvent('context-changed', { detail: context }));
  },
  
  /**
   * Réinitialise au contexte personnel
   */
  resetToPersonal: () => {
    // Importer dynamiquement pour éviter les dépendances circulaires
    const userStore = require('./userStore').useUserStore;
    const user = userStore.getState().user;
    
    get().setContext({ 
      type: 'personal', 
      name: 'Mode Personnel',
      azureContainer: user?.azureContainer 
    });
  },
  
  /**
   * Change vers un contexte organisation
   * @param {Object} organization - L'organisation { id, name, azureContainer }
   */
  setOrganizationContext: (organization) => {
    get().setContext({
      type: 'organization',
      name: organization.name,
      organizationId: organization.id,
      azureContainer: organization.azureContainer
    });
  },
  
  /**
   * Vérifie si on est en mode personnel
   */
  isPersonalMode: () => {
    return get().activeContext.type === 'personal';
  },
  
  /**
   * Vérifie si on est en mode organisation
   */
  isOrganizationMode: () => {
    return get().activeContext.type === 'organization';
  },
  
  /**
   * Récupère l'ID de l'organisation active (null si en mode personnel)
   */
  getActiveOrganizationId: () => {
    const context = get().activeContext;
    return context.type === 'organization' ? context.organizationId : null;
  },
  
  /**
   * Récupère le container Azure actif selon le contexte
   */
  getActiveContainer: () => {
    const context = get().activeContext;
    return context.azureContainer || null;
  }
}),
    {
      name: 'wisetwin-active-context',
      // Ne persister que le contexte actif
      partialize: (state) => ({ 
        activeContext: state.activeContext 
      })
    }
  )
);