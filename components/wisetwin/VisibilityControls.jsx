"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Settings,
  RotateCcw,
  Map,
  Factory,
  Zap,
} from "lucide-react";
import VISIBILITY_CONFIG from "@/lib/config/wisetwin/visibility-config";

const VisibilityControls = ({ sendMessage, isUnityLoaded = false }) => {
  // État de visibilité pour tous les objets
  const [visibilityState, setVisibilityState] = useState(
    VISIBILITY_CONFIG.getDefaultState()
  );

  // État d'ouverture des dropdowns
  const [openDropdowns, setOpenDropdowns] = useState({
    osm: false,
    zones: false,
    canalisation: false,
  });

  // Initialiser l'état par défaut quand Unity est chargé
  useEffect(() => {
    if (isUnityLoaded) {
      console.log(
        "🎮 Unity chargé, initialisation des états de visibilité par défaut"
      );
      initializeDefaultVisibility();
    }
  }, [isUnityLoaded]);

  // Fonction pour initialiser tous les objets comme visibles dans Unity
  const initializeDefaultVisibility = () => {
    const { unityConfig } = VISIBILITY_CONFIG;

    Object.keys(VISIBILITY_CONFIG.categories).forEach((categoryKey) => {
      const category = VISIBILITY_CONFIG.categories[categoryKey];
      const managerName = unityConfig.getManagerForCategory(categoryKey);

      category.objects.forEach((obj) => {
        if (sendMessage) {
          const message = unityConfig.formatMessage(obj.name, true);
          console.log(
            `🔧 Initialisation Unity: ${managerName}.${unityConfig.methodName}("${message}")`
          );
          sendMessage(managerName, unityConfig.methodName, message);
        }
      });
    });
  };

  // Fonction pour basculer la visibilité d'un objet
  const toggleObjectVisibility = (categoryKey, objectName) => {
    const newState = { ...visibilityState };
    const currentValue = newState[categoryKey][objectName];
    const newValue = !currentValue;

    newState[categoryKey][objectName] = newValue;
    setVisibilityState(newState);

    // Envoyer le message à Unity
    if (sendMessage && isUnityLoaded) {
      const { unityConfig } = VISIBILITY_CONFIG;
      const managerName = unityConfig.getManagerForCategory(categoryKey);
      const message = unityConfig.formatMessage(objectName, newValue);

      console.log(`🎮 Toggle visibilité: ${objectName} = ${newValue}`);
      console.log(
        `📤 Message Unity: ${managerName}.${unityConfig.methodName}("${message}")`
      );

      sendMessage(managerName, unityConfig.methodName, message);
    }
  };

  // Fonction pour afficher/masquer toute une catégorie
  const toggleCategoryVisibility = (categoryKey, visible) => {
    const newState = { ...visibilityState };
    const category = VISIBILITY_CONFIG.categories[categoryKey];
    const { unityConfig } = VISIBILITY_CONFIG;
    const managerName = unityConfig.getManagerForCategory(categoryKey);

    category.objects.forEach((obj) => {
      newState[categoryKey][obj.name] = visible;

      // Envoyer le message à Unity pour chaque objet
      if (sendMessage && isUnityLoaded) {
        const message = unityConfig.formatMessage(obj.name, visible);
        sendMessage(managerName, unityConfig.methodName, message);
      }
    });

    setVisibilityState(newState);
    console.log(
      `🎮 Toggle catégorie ${categoryKey} (${managerName}): ${
        visible ? "Tout afficher" : "Tout masquer"
      }`
    );
  };

  // Fonction pour réinitialiser tous les objets à l'état visible
  const resetAllVisibility = () => {
    const defaultState = VISIBILITY_CONFIG.getDefaultState();
    setVisibilityState(defaultState);

    // Réinitialiser dans Unity
    if (sendMessage && isUnityLoaded) {
      initializeDefaultVisibility();
    }

    console.log("🔄 Réinitialisation de tous les objets à l'état visible");
  };

  // Fonction pour obtenir l'icône de chaque catégorie
  const getCategoryIcon = (categoryKey) => {
    switch (categoryKey) {
      case "osm":
        return <Map className="w-4 h-4" />;
      case "zones":
        return <Factory className="w-4 h-4" />;
      case "canalisation":
        return <Zap className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  // Calculer le nombre d'objets visibles par catégorie
  const getVisibleCount = (categoryKey) => {
    const categoryState = visibilityState[categoryKey] || {};
    return Object.values(categoryState).filter(Boolean).length;
  };

  // Calculer le nombre total d'objets par catégorie
  const getTotalCount = (categoryKey) => {
    return VISIBILITY_CONFIG.categories[categoryKey].objects.length;
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-lg">
      {/* En-tête des contrôles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Contrôles de visibilité
          </h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetAllVisibility}
          disabled={!isUnityLoaded}
          className="text-xs"
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {/* Dropdowns des catégories */}
      <div className="space-y-2">
        {Object.keys(VISIBILITY_CONFIG.categories).map((categoryKey) => {
          const category = VISIBILITY_CONFIG.categories[categoryKey];
          const visibleCount = getVisibleCount(categoryKey);
          const totalCount = getTotalCount(categoryKey);
          const allVisible = visibleCount === totalCount;
          const noneVisible = visibleCount === 0;

          return (
            <DropdownMenu key={categoryKey}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between text-left"
                  disabled={!isUnityLoaded}
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(categoryKey)}
                    <span>{category.displayName}</span>
                    <span className="text-xs text-gray-500">
                      ({visibleCount}/{totalCount})
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-80 max-h-80 overflow-y-auto">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>{category.displayName}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleCategoryVisibility(categoryKey, true)
                      }
                      disabled={allVisible}
                      className="h-6 px-2 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Tout
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toggleCategoryVisibility(categoryKey, false)
                      }
                      disabled={noneVisible}
                      className="h-6 px-2 text-xs"
                    >
                      <EyeOff className="w-3 h-3 mr-1" />
                      Rien
                    </Button>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {category.objects.map((obj) => {
                  const isVisible =
                    visibilityState[categoryKey]?.[obj.name] ?? true;

                  return (
                    <DropdownMenuCheckboxItem
                      key={obj.name}
                      checked={isVisible}
                      onCheckedChange={() =>
                        toggleObjectVisibility(categoryKey, obj.name)
                      }
                      className="flex items-center gap-2"
                    >
                      {isVisible ? (
                        <Eye className="w-3 h-3 text-green-600" />
                      ) : (
                        <EyeOff className="w-3 h-3 text-gray-400" />
                      )}
                      <span className="flex-1">{obj.displayName}</span>
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>

      {/* Indicateur d'état Unity */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div
            className={`w-2 h-2 rounded-full ${
              isUnityLoaded ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {isUnityLoaded ? "Wisetwin connecté" : "Wisetwin non connecté"}
        </div>
      </div>
    </div>
  );
};

export default VisibilityControls;
