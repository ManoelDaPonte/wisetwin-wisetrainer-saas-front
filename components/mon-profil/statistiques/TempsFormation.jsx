// components/mon-profil/statistiques/TempsFormation.jsx
import React from "react";
import { Clock } from "lucide-react";
import StatCard from "./StatCard";

/**
 * Composant affichant le temps total de formation
 * @param {number} tempsTotal - Temps total en heures
 * @param {number} nombreSessions - Nombre de sessions terminées
 * @param {boolean} isLoading - État de chargement
 */
export default function TempsFormation({
  tempsTotal,
  nombreSessions = 0,
  isLoading = false,
}) {
  return (
    <StatCard
      title="Temps de formation"
      icon={<Clock className="h-5 w-5 text-wisetwin-blue" />}
    >
      <div className="flex items-center">
        <div className="text-3xl font-bold text-wisetwin-darkblue">
          {isLoading ? (
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
          ) : (
            `${tempsTotal}h`
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        {!isLoading && nombreSessions > 0 && `${nombreSessions} sessions terminées`}
        {!isLoading && nombreSessions === 0 && "Aucune session terminée"}
        {isLoading && "Temps total de formation"}
      </p>
    </StatCard>
  );
}