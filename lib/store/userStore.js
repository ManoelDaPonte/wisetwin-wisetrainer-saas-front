"use client";
import { create } from "zustand";
import { userApi } from "../services/api/userApi";
import cacheManager from "../utils/cache";

// Durée du cache utilisateur (10 minutes)
const USER_CACHE_DURATION = 10 * 60 * 1000;

/**
 * Store Zustand pour la gestion de l'état utilisateur
 * Centralise toutes les données et opérations liées à l'utilisateur
 */
export const useUserStore = create((set, get) => ({
  // État
  user: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  stats: null,
  statsLoading: false,
  statsError: null,

  /**
   * Récupère les données de l'utilisateur avec gestion de cache
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Object|null>} - Données utilisateur ou null en cas d'erreur
   */
  fetchUser: async (force = false) => {
    // Vérifier si les données sont déjà en cache et toujours valides
    if (
      !force &&
      get().user &&
      get().lastFetched &&
      Date.now() - get().lastFetched < USER_CACHE_DURATION
    ) {
      return get().user;
    }

    // Sinon, récupérer les données depuis l'API
    set({ isLoading: true, error: null });

    try {
      const user = await userApi.getProfile();
      
      // Mettre à jour le store et le cache
      set({ 
        user, 
        isLoading: false, 
        lastFetched: Date.now(),
        error: null
      });
      
      return user;
    } catch (error) {
      set({ 
        error: error.message || "Erreur lors de la récupération des données utilisateur", 
        isLoading: false 
      });
      return null;
    }
  },

  /**
   * Met à jour localement les données de l'utilisateur (sans appel API)
   * @param {Object} data - Données partielles à mettre à jour
   */
  updateUserLocally: (data) => {
    if (get().user) {
      const updatedUser = { ...get().user, ...data };
      set({ user: updatedUser });
    }
  },

  /**
   * Met à jour le profil de l'utilisateur via l'API
   * @param {Object} data - Données du profil à mettre à jour
   * @returns {Promise<Object|null>} - Données utilisateur mises à jour ou null
   */
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await userApi.updateProfile(data);
      set({ 
        user: updatedUser, 
        isLoading: false,
        lastFetched: Date.now()
      });
      return updatedUser;
    } catch (error) {
      set({ 
        error: error.message || "Erreur lors de la mise à jour du profil", 
        isLoading: false 
      });
      return null;
    }
  },

  /**
   * Met à jour le nom de l'utilisateur
   * @param {string} name - Nouveau nom
   * @returns {Promise<Object|null>} - Données utilisateur mises à jour ou null
   */
  updateName: async (name) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await userApi.updateName(name);
      set({ 
        user: updatedUser, 
        isLoading: false,
        lastFetched: Date.now()
      });
      return updatedUser;
    } catch (error) {
      set({ 
        error: error.message || "Erreur lors de la mise à jour du nom", 
        isLoading: false 
      });
      return null;
    }
  },

  /**
   * Récupère les statistiques de l'utilisateur
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Object|null>} - Statistiques ou null en cas d'erreur
   */
  fetchUserStats: async (force = false) => {
    const userId = get().user?.id;
    if (!userId) return null;

    // Vérifier le cache
    const cacheKey = `user_stats_${userId}`;
    if (!force && cacheManager.has(cacheKey)) {
      const cachedStats = cacheManager.get(cacheKey);
      if (cachedStats && get().stats === null) {
        set({ stats: cachedStats });
      }
      return cachedStats;
    }

    set({ statsLoading: true, statsError: null });

    try {
      const stats = await userApi.getUserStats(userId);
      
      // Mettre à jour le store et le cache
      set({ stats, statsLoading: false });
      cacheManager.set(cacheKey, stats);
      
      return stats;
    } catch (error) {
      set({ 
        statsError: error.message || "Erreur lors de la récupération des statistiques", 
        statsLoading: false 
      });
      return null;
    }
  },

  /**
   * Supprime le compte utilisateur
   * @returns {Promise<boolean>} - true si réussi, false sinon
   */
  deleteAccount: async () => {
    set({ isLoading: true, error: null });

    try {
      await userApi.deleteAccount();
      
      // Réinitialiser le store
      set({ 
        user: null, 
        isLoading: false,
        lastFetched: null,
        stats: null
      });
      
      return true;
    } catch (error) {
      set({ 
        error: error.message || "Erreur lors de la suppression du compte", 
        isLoading: false 
      });
      return false;
    }
  },

  /**
   * Réinitialise l'état du store (déconnexion)
   */
  resetState: () => {
    set({
      user: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      stats: null,
      statsLoading: false,
      statsError: null
    });
  }
}));

export default useUserStore;