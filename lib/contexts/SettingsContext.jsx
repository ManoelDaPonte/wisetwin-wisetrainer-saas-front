"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { useTheme } from "@/lib/hooks/useTheme";

// Création du contexte
const SettingsContext = createContext(undefined);

/**
 * Hook personnalisé pour utiliser le contexte des paramètres
 * @returns {Object} Contexte des paramètres
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  
  if (context === undefined) {
    throw new Error("useSettings doit être utilisé à l'intérieur d'un SettingsProvider");
  }
  
  return context;
};

/**
 * Fournisseur de contexte pour les paramètres
 * Centralise la gestion de l'état des paramètres de l'application
 * 
 * @param {Object} props - Props du composant
 * @param {React.ReactNode} props.children - Composants enfants
 * @returns {JSX.Element} Fournisseur de contexte
 */
export const SettingsProvider = ({ children }) => {
  // État du contexte
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("preferences");
  const [language, setLanguage] = useState("fr");
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fonction pour rafraîchir les données des paramètres si nécessaire
  const refreshSettings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Ici, on pourrait ajouter un appel API pour récupérer les paramètres de l'utilisateur
      // Exemple : const response = await fetch('/api/user/settings');
      
      // Simulons un délai pour l'exemple
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mise à jour des données
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Erreur lors du rafraîchissement des paramètres:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Valeur du contexte à exposer
  const value = {
    // États
    activeTab,
    theme,
    language,
    notifications,
    emailAlerts,
    sidebarCompact,
    isLoading,
    lastRefresh,
    
    // Setters
    setActiveTab,
    setTheme,
    setLanguage,
    setNotifications,
    setEmailAlerts,
    setSidebarCompact,
    
    // Actions
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};