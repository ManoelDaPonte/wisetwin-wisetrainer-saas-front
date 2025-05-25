"use client";
import { create } from "zustand";
import { organizationApi } from "../services/api/organizationApi";
import cacheManager from "../utils/cache";

// Durée du cache pour les organisations (5 minutes)
const ORGANIZATIONS_CACHE_DURATION = 5 * 60 * 1000;

// Durée du cache pour les membres et tags (2 minutes)
const MEMBERS_CACHE_DURATION = 2 * 60 * 1000;

/**
 * Store Zustand pour la gestion de l'état des organisations
 * Centralise toutes les données et opérations liées aux organisations
 */
export const useOrganizationStore = create((set, get) => ({
  // État global
  organizations: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  
  // État pour l'organisation active
  currentOrganization: null,
  currentOrganizationId: null,
  organizationLoading: false,
  organizationError: null,
  
  // État pour les membres
  members: [],
  membersLoading: false,
  membersError: null,
  membersWithTags: [],
  
  // État pour les tags
  tags: [],
  tagsLoading: false,
  tagsError: null,
  
  // État pour les invitations
  invitations: [],
  invitationsLoading: false,
  invitationsError: null,
  
  // État pour les builds
  builds: [],
  buildsLoading: false,
  buildsError: null,
  
  /**
   * Récupère toutes les organisations de l'utilisateur
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des organisations
   */
  fetchOrganizations: async (force = false) => {
    // Vérifier le cache
    if (
      !force &&
      get().organizations.length > 0 &&
      get().lastFetched &&
      Date.now() - get().lastFetched < ORGANIZATIONS_CACHE_DURATION
    ) {
      console.log("Utilisation du cache pour les organisations");
      return get().organizations;
    }
    
    set({ isLoading: true, error: null });
    console.log("Chargement des organisations...");
    
    try {
      // Ajouter un gestionnaire de timeout pour éviter les requêtes bloquantes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Délai d'attente dépassé")), 10000);
      });
      
      // Course entre la requête API et le timeout
      const organizations = await Promise.race([
        organizationApi.getUserOrganizations(),
        timeoutPromise
      ]);
      
      console.log(`${organizations.length} organisations récupérées avec succès`);
      
      set({ 
        organizations, 
        isLoading: false, 
        lastFetched: Date.now(),
        error: null
      });
      
      return organizations;
    } catch (error) {
      console.error("Erreur lors du chargement des organisations:", error);
      
      // Si nous avons des organisations en cache, les utiliser malgré l'erreur
      if (get().organizations.length > 0) {
        console.log("Utilisation du cache existant malgré l'erreur");
        set({ isLoading: false });
        return get().organizations;
      }
      
      set({ 
        error: error.message || "Erreur lors de la récupération des organisations", 
        isLoading: false,
        // Par défaut, initialiser avec un tableau vide
        organizations: []
      });
      return [];
    }
  },
  
  /**
   * Définit l'organisation active
   * @param {string} organizationId - ID de l'organisation à définir comme active
   */
  setCurrentOrganizationId: (organizationId) => {
    // Mettre à jour uniquement l'ID
    set({ currentOrganizationId: organizationId });
    
    // Si l'organisation est déjà en cache dans la liste, la définir comme actuelle
    const cachedOrg = get().organizations.find(org => org.id === organizationId);
    if (cachedOrg) {
      set({ currentOrganization: cachedOrg });
    } else {
      // Sinon réinitialiser l'organisation active
      set({ currentOrganization: null });
    }
  },
  
  /**
   * Récupère les détails d'une organisation spécifique
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Object>} - Détails de l'organisation
   */
  fetchOrganizationDetails: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return null;
    
    // Vérifier d'abord si l'utilisateur est membre de l'organisation
    try {
      const membershipCheck = await organizationApi.checkMembership(orgId);
      if (!membershipCheck.isMember) {
        set({ 
          organizationError: "Vous n'êtes pas membre de cette organisation",
          organizationLoading: false,
          currentOrganization: null,
          currentOrganizationId: null
        });
        
        // Retirer l'organisation de la liste si elle existe
        const orgs = get().organizations.filter(org => org.id !== orgId);
        set({ organizations: orgs });
        
        return null;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du membership:", error);
      // Continuer même si la vérification échoue (pour compatibilité)
    }
    
    // Vérifier le cache
    const cacheKey = `organization_${orgId}`;
    if (!force && cacheManager.has(cacheKey)) {
      const cachedOrg = cacheManager.get(cacheKey);
      set({ currentOrganization: cachedOrg, currentOrganizationId: orgId });
      return cachedOrg;
    }
    
    set({ organizationLoading: true, organizationError: null });
    
    try {
      const organization = await organizationApi.getOrganizationDetails(orgId);
      
      set({ 
        currentOrganization: organization, 
        currentOrganizationId: orgId,
        organizationLoading: false,
        organizationError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, organization);
      
      // Mettre à jour la liste des organisations si celle-ci est en cache
      if (get().organizations.length > 0) {
        const updatedOrgs = get().organizations.map(org => 
          org.id === orgId ? { ...org, ...organization } : org
        );
        set({ organizations: updatedOrgs });
      }
      
      return organization;
    } catch (error) {
      set({ 
        organizationError: error.message || "Erreur lors de la récupération des détails de l'organisation", 
        organizationLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Crée une nouvelle organisation
   * @param {Object} data - Données de l'organisation
   * @returns {Promise<Object>} - Organisation créée
   */
  createOrganization: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const newOrganization = await organizationApi.createOrganization(data);
      
      // Ajouter la nouvelle organisation à la liste
      set(state => ({ 
        organizations: [...state.organizations, newOrganization],
        isLoading: false,
        error: null,
        lastFetched: Date.now()
      }));
      
      return newOrganization;
    } catch (error) {
      set({ 
        error: error.message || "Erreur lors de la création de l'organisation", 
        isLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Récupère les membres d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des membres
   */
  fetchMembers: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return [];
    
    // Vérifier le cache
    const cacheKey = `organization_members_${orgId}`;
    if (!force && cacheManager.has(cacheKey, MEMBERS_CACHE_DURATION)) {
      const cachedMembers = cacheManager.get(cacheKey);
      set({ members: cachedMembers });
      return cachedMembers;
    }
    
    set({ membersLoading: true, membersError: null });
    
    try {
      const members = await organizationApi.getOrganizationMembers(orgId);
      
      set({ 
        members, 
        membersLoading: false,
        membersError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, members);
      
      return members;
    } catch (error) {
      set({ 
        membersError: error.message || "Erreur lors de la récupération des membres", 
        membersLoading: false 
      });
      return [];
    }
  },
  
  /**
   * Récupère les membres avec leurs tags
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des membres avec leurs tags
   */
  fetchMembersWithTags: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return [];
    
    // Vérifier le cache
    const cacheKey = `organization_members_tags_${orgId}`;
    if (!force && cacheManager.has(cacheKey, MEMBERS_CACHE_DURATION)) {
      const cachedMembers = cacheManager.get(cacheKey);
      set({ membersWithTags: cachedMembers });
      return cachedMembers;
    }
    
    set({ membersLoading: true, membersError: null });
    
    try {
      const members = await organizationApi.getMembersWithTags(orgId);
      
      set({ 
        membersWithTags: members, 
        membersLoading: false,
        membersError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, members);
      
      return members;
    } catch (error) {
      set({ 
        membersError: error.message || "Erreur lors de la récupération des membres avec tags", 
        membersLoading: false 
      });
      return [];
    }
  },
  
  /**
   * Ajoute un membre à l'organisation
   * @param {Object} data - Données du membre (email, role)
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  addMember: async (data) => {
    const orgId = get().currentOrganizationId;
    if (!orgId) return null;
    
    set({ membersLoading: true, membersError: null });
    
    try {
      const result = await organizationApi.addMember(orgId, data);
      
      // Actualiser la liste des membres
      get().fetchMembers(orgId, true);
      
      set({ membersLoading: false });
      return result;
    } catch (error) {
      set({ 
        membersError: error.message || "Erreur lors de l'ajout du membre", 
        membersLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Supprime un membre de l'organisation
   * @param {string} memberId - ID du membre
   * @returns {Promise<Object>} - Résultat de l'opération
   */
  removeMember: async (memberId) => {
    const orgId = get().currentOrganizationId;
    if (!orgId) return null;
    
    set({ membersLoading: true, membersError: null });
    
    try {
      const result = await organizationApi.removeMember(orgId, memberId);
      
      // Mettre à jour l'état local
      set(state => ({
        members: state.members.filter(member => member.id !== memberId),
        membersWithTags: state.membersWithTags.filter(member => member.id !== memberId),
        membersLoading: false
      }));
      
      // Invalider le cache
      cacheManager.invalidate(`organization_members_${orgId}`);
      cacheManager.invalidate(`organization_members_tags_${orgId}`);
      
      return result;
    } catch (error) {
      set({ 
        membersError: error.message || "Erreur lors de la suppression du membre", 
        membersLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Récupère les tags d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des tags
   */
  fetchTags: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return [];
    
    // Vérifier le cache
    const cacheKey = `organization_tags_${orgId}`;
    if (!force && cacheManager.has(cacheKey, MEMBERS_CACHE_DURATION)) {
      const cachedTags = cacheManager.get(cacheKey);
      set({ tags: cachedTags });
      return cachedTags;
    }
    
    set({ tagsLoading: true, tagsError: null });
    
    try {
      const tags = await organizationApi.getOrganizationTags(orgId);
      
      set({ 
        tags, 
        tagsLoading: false,
        tagsError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, tags);
      
      return tags;
    } catch (error) {
      set({ 
        tagsError: error.message || "Erreur lors de la récupération des tags", 
        tagsLoading: false 
      });
      return [];
    }
  },
  
  /**
   * Crée un nouveau tag
   * @param {Object} data - Données du tag (name, color, description)
   * @returns {Promise<Object>} - Tag créé
   */
  createTag: async (data) => {
    const orgId = get().currentOrganizationId;
    if (!orgId) return null;
    
    set({ tagsLoading: true, tagsError: null });
    
    try {
      const newTag = await organizationApi.createTag(orgId, data);
      
      // Mettre à jour l'état local
      set(state => ({
        tags: [...state.tags, newTag],
        tagsLoading: false
      }));
      
      // Invalider le cache
      cacheManager.invalidate(`organization_tags_${orgId}`);
      
      return newTag;
    } catch (error) {
      set({ 
        tagsError: error.message || "Erreur lors de la création du tag", 
        tagsLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Récupère les invitations d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des invitations
   */
  fetchInvitations: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return [];
    
    // Vérifier le cache
    const cacheKey = `organization_invitations_${orgId}`;
    if (!force && cacheManager.has(cacheKey)) {
      const cachedInvitations = cacheManager.get(cacheKey);
      set({ invitations: cachedInvitations });
      return cachedInvitations;
    }
    
    set({ invitationsLoading: true, invitationsError: null });
    
    try {
      const invitations = await organizationApi.getInvitations(orgId);
      
      set({ 
        invitations, 
        invitationsLoading: false,
        invitationsError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, invitations);
      
      return invitations;
    } catch (error) {
      set({ 
        invitationsError: error.message || "Erreur lors de la récupération des invitations", 
        invitationsLoading: false 
      });
      return [];
    }
  },
  
  /**
   * Crée une invitation pour rejoindre l'organisation
   * @param {Object} data - Données de l'invitation (email, role)
   * @returns {Promise<Object>} - Invitation créée
   */
  createInvitation: async (data) => {
    const orgId = get().currentOrganizationId;
    if (!orgId) return null;
    
    set({ invitationsLoading: true, invitationsError: null });
    
    try {
      const newInvitation = await organizationApi.createInvitation(orgId, data);
      
      // Mettre à jour l'état local
      set(state => ({
        invitations: [...state.invitations, newInvitation],
        invitationsLoading: false
      }));
      
      // Invalider le cache
      cacheManager.invalidate(`organization_invitations_${orgId}`);
      
      return newInvitation;
    } catch (error) {
      set({ 
        invitationsError: error.message || "Erreur lors de la création de l'invitation", 
        invitationsLoading: false 
      });
      return null;
    }
  },
  
  /**
   * Récupère les builds/formations d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des builds
   */
  fetchBuilds: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return [];
    
    // Vérifier le cache
    const cacheKey = `organization_builds_${orgId}`;
    if (!force && cacheManager.has(cacheKey)) {
      const cachedBuilds = cacheManager.get(cacheKey);
      set({ builds: cachedBuilds });
      return cachedBuilds;
    }
    
    set({ buildsLoading: true, buildsError: null });
    
    try {
      const builds = await organizationApi.getOrganizationBuilds(orgId);
      
      set({ 
        builds, 
        buildsLoading: false,
        buildsError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, builds);
      
      return builds;
    } catch (error) {
      set({ 
        buildsError: error.message || "Erreur lors de la récupération des builds", 
        buildsLoading: false 
      });
      return [];
    }
  },

  /**
   * Récupère les builds WiseTrainer d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des builds WiseTrainer
   */
  getWiseTrainerBuilds: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return [];
    
    // Vérifier le cache
    const cacheKey = `organization_wisetrainer_builds_${orgId}`;
    if (!force && cacheManager.has(cacheKey)) {
      const cachedBuilds = cacheManager.get(cacheKey);
      set({ builds: cachedBuilds });
      return cachedBuilds;
    }
    
    set({ buildsLoading: true, buildsError: null });
    
    try {
      const builds = await organizationApi.getWiseTrainerBuilds(orgId);
      
      set({ 
        builds, 
        buildsLoading: false,
        buildsError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, builds);
      
      return builds;
    } catch (error) {
      set({ 
        buildsError: error.message || "Erreur lors de la récupération des builds WiseTrainer", 
        buildsLoading: false 
      });
      return [];
    }
  },

  /**
   * Récupère les builds WiseTwin d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @param {boolean} force - Force le rechargement même si le cache est valide
   * @returns {Promise<Array>} - Liste des builds WiseTwin
   */
  getWiseTwinBuilds: async (organizationId, force = false) => {
    // Si aucun ID n'est fourni, utiliser l'ID courant
    const orgId = organizationId || get().currentOrganizationId;
    if (!orgId) return [];
    
    // Vérifier le cache
    const cacheKey = `organization_wisetwin_builds_${orgId}`;
    if (!force && cacheManager.has(cacheKey)) {
      const cachedBuilds = cacheManager.get(cacheKey);
      set({ builds: cachedBuilds });
      return cachedBuilds;
    }
    
    set({ buildsLoading: true, buildsError: null });
    
    try {
      const builds = await organizationApi.getWiseTwinBuilds(orgId);
      
      set({ 
        builds, 
        buildsLoading: false,
        buildsError: null
      });
      
      // Mettre à jour le cache
      cacheManager.set(cacheKey, builds);
      
      return builds;
    } catch (error) {
      set({ 
        buildsError: error.message || "Erreur lors de la récupération des builds WiseTwin", 
        buildsLoading: false 
      });
      return [];
    }
  },
  
  /**
   * Vérifie si l'utilisateur est membre d'une organisation
   * @param {string} organizationId - ID de l'organisation
   * @returns {Promise<Object>} - Résultat de la vérification
   */
  checkMembership: async (organizationId) => {
    try {
      return await organizationApi.checkMembership(organizationId);
    } catch (error) {
      return { isMember: false, role: null };
    }
  },
  
  /**
   * Réinitialise l'état du store
   */
  resetState: () => {
    set({
      organizations: [],
      isLoading: false,
      error: null,
      lastFetched: null,
      currentOrganization: null,
      currentOrganizationId: null,
      organizationLoading: false,
      organizationError: null,
      members: [],
      membersLoading: false,
      membersError: null,
      membersWithTags: [],
      tags: [],
      tagsLoading: false,
      tagsError: null,
      invitations: [],
      invitationsLoading: false,
      invitationsError: null,
      builds: [],
      buildsLoading: false,
      buildsError: null
    });
  }
}));

export default useOrganizationStore;