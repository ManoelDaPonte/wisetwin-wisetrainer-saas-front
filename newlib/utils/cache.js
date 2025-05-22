"use client";

/**
 * Système de cache unifié pour l'application
 * Permet de stocker et récupérer des données avec des durées de validité personnalisables
 */
class CacheManager {
  constructor() {
    this.cache = {};
    this.timestamps = {};
  }

  /**
   * Récupère une donnée du cache si elle est valide
   * @param {string} key - Clé d'identification
   * @param {number} ttl - Durée de validité en millisecondes (par défaut 5 minutes)
   * @returns {any|null} - La donnée en cache ou null si invalide/expirée
   */
  get(key, ttl = 5 * 60 * 1000) {
    // Vérifier si la donnée existe et est encore valide
    if (
      this.cache[key] !== undefined &&
      this.timestamps[key] &&
      Date.now() - this.timestamps[key] < ttl
    ) {
      return this.cache[key];
    }
    return null;
  }

  /**
   * Stocke une donnée dans le cache
   * @param {string} key - Clé d'identification
   * @param {any} data - Donnée à stocker
   */
  set(key, data) {
    this.cache[key] = data;
    this.timestamps[key] = Date.now();
  }

  /**
   * Invalide une entrée du cache
   * @param {string} key - Clé à invalider
   */
  invalidate(key) {
    delete this.cache[key];
    delete this.timestamps[key];
  }

  /**
   * Vérifie si une clé existe dans le cache et est valide
   * @param {string} key - Clé à vérifier
   * @param {number} ttl - Durée de validité en millisecondes
   * @returns {boolean} - true si la clé existe et est valide
   */
  has(key, ttl = 5 * 60 * 1000) {
    return (
      this.cache[key] !== undefined &&
      this.timestamps[key] &&
      Date.now() - this.timestamps[key] < ttl
    );
  }

  /**
   * Invalide toutes les entrées du cache
   */
  clear() {
    this.cache = {};
    this.timestamps = {};
  }

  /**
   * Invalide toutes les entrées commençant par un préfixe
   * @param {string} prefix - Préfixe des clés à invalider
   */
  invalidateByPrefix(prefix) {
    Object.keys(this.cache).forEach((key) => {
      if (key.startsWith(prefix)) {
        this.invalidate(key);
      }
    });
  }
}

// Singleton pour partager le même cache dans toute l'application
export const cacheManager = new CacheManager();

export default cacheManager;