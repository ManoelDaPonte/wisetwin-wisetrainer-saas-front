"use client";
import { useEffect, useCallback } from "react";
import { useCourseStore } from "../store/courseStore";

/**
 * Hook composable pour gérer un scénario de cours
 * 
 * @param {Object} options - Options du hook
 * @param {string} options.courseId - ID du cours
 * @param {string} options.scenarioId - ID du scénario
 * @param {boolean} options.autoLoad - Charge automatiquement les données au montage
 * @returns {Object} Données et fonctions pour interagir avec un scénario
 */
export function useScenario({
  courseId = null,
  scenarioId = null,
  autoLoad = true
} = {}) {
  // Récupérer l'état et les actions du store
  const {
    currentScenario,
    currentScenarioId,
    scenarioLoading,
    scenarioError,
    fetchScenario,
    saveQuestionnaire
  } = useCourseStore(state => ({
    currentScenario: state.currentScenario,
    currentScenarioId: state.currentScenarioId,
    scenarioLoading: state.scenarioLoading,
    scenarioError: state.scenarioError,
    fetchScenario: state.fetchScenario,
    saveQuestionnaire: state.saveQuestionnaire
  }));
  
  // Charger le scénario au montage si nécessaire
  useEffect(() => {
    if (autoLoad && courseId && scenarioId) {
      fetchScenario(courseId, scenarioId);
    }
  }, [autoLoad, courseId, scenarioId, fetchScenario]);
  
  /**
   * Soumet les réponses de l'utilisateur au questionnaire
   * @param {Object} data - Données de réponses
   * @returns {Promise<Object>} Résultat de l'opération
   */
  const submitAnswers = useCallback(async (data) => {
    if (!courseId || !scenarioId) return null;
    
    const submissionData = {
      courseId,
      scenarioId,
      ...data
    };
    
    try {
      return await saveQuestionnaire(submissionData);
    } catch (error) {
      console.error("Erreur lors de la soumission des réponses:", error);
      return { success: false, error: error.message };
    }
  }, [courseId, scenarioId, saveQuestionnaire]);
  
  /**
   * Formatage d'une question pour l'interface utilisateur
   * @param {Object} question - Question à formater
   * @returns {Object} Question formatée
   */
  const formatQuestion = useCallback((question) => {
    if (!question) return null;
    
    return {
      ...question,
      // Détermine si c'est une question à choix multiple
      isMultipleChoice: question.type === "MULTIPLE",
      // Trie les options par ordre (si disponible)
      options: question.options?.sort((a, b) => a.order - b.order) || []
    };
  }, []);
  
  /**
   * Récupère les questions formatées du scénario
   * @returns {Array} Questions formatées
   */
  const getFormattedQuestions = useCallback(() => {
    if (!currentScenario || !currentScenario.questions) return [];
    
    return currentScenario.questions
      .sort((a, b) => a.order - b.order)
      .map(formatQuestion);
  }, [currentScenario, formatQuestion]);
  
  return {
    // Scénario actuel
    scenario: currentScenario,
    scenarioId: currentScenarioId,
    isLoading: scenarioLoading,
    error: scenarioError,
    
    // Données formatées
    title: currentScenario?.title || "",
    description: currentScenario?.description || "",
    questions: getFormattedQuestions(),
    
    // Actions
    loadScenario: (force = false) => fetchScenario(courseId, scenarioId, force),
    submitAnswers,
    formatQuestion
  };
}

export default useScenario;