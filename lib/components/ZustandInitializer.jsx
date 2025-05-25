"use client";
import { useEffect } from "react";
import { useUserStore } from "../store/userStore";
import { useOrganizationStore } from "../store/organizationStore";
import { useCourseStore } from "../store/courseStore";

/**
 * Composant qui initialise les stores Zustand au chargement de l'application
 * Contrairement aux Context Providers, ce composant n'ajoute pas de contexte React supplémentaire
 * Il se contente de déclencher le chargement initial des données
 * 
 * @param {Object} props - Propriétés du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {React.ReactNode} Les composants enfants sans wrapper supplémentaire
 */
export function ZustandInitializer({ children }) {
  // Récupérer les fonctions de chargement des stores
  const fetchUser = useUserStore(state => state.fetchUser);
  const fetchOrganizations = useOrganizationStore(state => state.fetchOrganizations);
  
  // Charger les données utilisateur au démarrage
  useEffect(() => {
    // On charge d'abord l'utilisateur
    const loadInitialData = async () => {
      try {
        console.log("Initialisation des stores Zustand...");
        const user = await fetchUser();
        
        // Si l'utilisateur est chargé, on peut charger ses organisations
        if (user) {
          await fetchOrganizations();
        }
        
        console.log("Initialisation des stores terminée");
      } catch (error) {
        console.error("Erreur lors de l'initialisation des stores:", error);
      }
    };
    
    loadInitialData();
  }, [fetchUser, fetchOrganizations]);
  
  // Pas de wrapper supplémentaire, on retourne directement les enfants
  return children;
}

export default ZustandInitializer;