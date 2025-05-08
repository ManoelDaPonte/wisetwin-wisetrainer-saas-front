// components/mon-profil/formations/FormationsCompletes.jsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { CheckCircle, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * Calcule le score moyen d'une formation
 * @param {Object} formation - Objet formation
 * @returns {number} Score moyen calculé
 */
const calculerScoreFormation = (formation) => {
  if (!formation.modules || formation.modules.length === 0) {
    return formation.score || 0;
  }

  const modulesCompletes = formation.modules.filter((m) => m.completed);
  if (modulesCompletes.length === 0) {
    return formation.score || 0;
  }

  const scoreTotal = modulesCompletes.reduce(
    (sum, module) => sum + (module.score || 0),
    0
  );
  return Math.round(scoreTotal / modulesCompletes.length);
};

/**
 * Composant affichant la liste des formations complétées
 * @param {Array} formations - Liste des formations terminées
 * @param {boolean} isLoading - État de chargement
 */
export default function FormationsCompletes({ 
  formations = [], 
  isLoading = false 
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-wisetwin-blue" />
          Dernières formations terminées
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                </div>
              </div>
            ))}
          </div>
        ) : formations.length > 0 ? (
          <div className="space-y-4">
            {formations.map((formation) => {
              // Calculer le score moyen de cette formation
              const scoreMoyen = calculerScoreFormation(formation);

              return (
                <div
                  key={formation.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium line-clamp-1">
                        {formation.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Terminé le{" "}
                        {formatDate(
                          formation.completedAt ||
                            formation.lastAccessed
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-800 font-bold dark:bg-green-900/30 dark:text-green-300">
                    {scoreMoyen}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Aucune formation terminée
          </div>
        )}
      </CardContent>
    </Card>
  );
}