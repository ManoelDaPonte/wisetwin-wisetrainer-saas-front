// components/mon-profil/statistiques/FormationsTerminees.jsx
import React from "react";
import { ArrowUpRight, ArrowDownRight, GraduationCap } from "lucide-react";
import StatCard from "./StatCard";

/**
 * Composant affichant le nombre de formations terminées
 * @param {number} nombreFormations - Nombre de formations terminées
 * @param {number} tendance - Tendance en pourcentage (positif ou négatif)
 * @param {boolean} isLoading - État de chargement
 */
export default function FormationsTerminees({
  nombreFormations,
  tendance = 0,
  isLoading = false,
}) {
  return (
    <StatCard
      title="Formations terminées"
      icon={<GraduationCap className="h-5 w-5 text-wisetwin-blue" />}
    >
      <div className="flex items-center">
        <div className="text-3xl font-bold text-wisetwin-darkblue">
          {isLoading ? (
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          ) : (
            nombreFormations
          )}
        </div>
        {!isLoading && tendance !== 0 && (
          <div
            className={`flex items-center ml-2 ${
              tendance > 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {tendance > 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">{Math.abs(tendance)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Formations complétées à 100%
      </p>
    </StatCard>
  );
}