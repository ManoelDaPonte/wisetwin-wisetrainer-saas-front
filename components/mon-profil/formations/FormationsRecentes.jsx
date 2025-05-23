// components/mon-profil/formations/FormationsRecentes.jsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

/**
 * Composant affichant les formations récemment accédées
 * @param {Array} formations - Liste des formations
 * @param {boolean} isLoading - État de chargement
 * @param {function} onViewAll - Callback pour le bouton "Voir tout"
 */
export default function FormationsRecentes({ 
  formations = [], 
  isLoading = false, 
  onViewAll 
}) {
  // Triez et limitez les formations récentes
  const formationsRecentes = React.useMemo(() => {
    if (!formations || formations.length === 0) return [];
    
    return [...formations]
      .sort((a, b) => new Date(b.lastAccessed || 0) - new Date(a.lastAccessed || 0))
      .slice(0, 3);
  }, [formations]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="w-5 h-5 mr-2 text-wisetwin-blue" />
          Formations récentes
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          className="text-wisetwin-blue"
        >
          Voir tout
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2"></div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : formationsRecentes.length > 0 ? (
          <div className="space-y-6">
            {formationsRecentes.map((formation) => (
              <div key={formation.id}>
                <div className="mb-1">
                  <div className="flex justify-between font-medium mb-1">
                    <div className="line-clamp-1">
                      {formation.name}
                    </div>
                    <span className="ml-2 text-sm">
                      {formation.progress || 0}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Dernier accès:{" "}
                    {formatDate(
                      formation.lastAccessed || new Date()
                    )}
                  </div>
                  <Progress
                    value={formation.progress || 0}
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Aucune formation récente
          </div>
        )}
      </CardContent>
    </Card>
  );
}