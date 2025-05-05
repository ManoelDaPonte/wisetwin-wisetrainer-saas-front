"use client";

import { useState, useCallback } from 'react';
import axios from 'axios';
import WISETRAINER_CONFIG from "@/lib/config/wisetrainer/wisetrainer";

export const useInformationModal = (courseId) => {
  const [showInformation, setShowInformation] = useState(false);
  const [currentInformation, setCurrentInformation] = useState(null);

  // Fonction pour demander l'affichage d'une modale d'information
  const requestInformation = useCallback(async (moduleId) => {
    try {
      // Récupérer les détails du module depuis l'API
      const response = await axios.get(
        `${WISETRAINER_CONFIG.API_ROUTES.FETCH_SCENARIO}/${moduleId}`
      );

      // Vérifier si c'est bien de type information
      if (response.data.type === "information") {
        setCurrentInformation(response.data);
        setShowInformation(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la récupération des informations:", error);
      return false;
    }
  }, []);

  // Fonction pour fermer la modale
  const closeInformation = useCallback(() => {
    setShowInformation(false);
    setCurrentInformation(null);
  }, []);

  return {
    showInformation,
    currentInformation,
    requestInformation,
    closeInformation,
    setShowInformation
  };
};

export default useInformationModal;