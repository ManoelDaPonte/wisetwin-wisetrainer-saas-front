// components/mon-profil/certifications/CertificationCard.jsx
import React from "react";
import { Award, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Formatage simple des dates (jour/mois/année)
 * @param {Date|string} dateString - Date à formater
 * @returns {string} Date formatée
 */
const formatSimpleDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/**
 * Composant d'affichage d'une carte de certification
 * @param {Object} certification - Données de la certification
 * @param {function} onClick - Callback pour le clic sur la carte
 * @param {function} onDownload - Callback pour le téléchargement
 */
export default function CertificationCard({ 
  certification, 
  onClick, 
  onDownload 
}) {
  if (!certification) return null;

  return (
    <div
      className="overflow-hidden rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-800"
      onClick={() => onClick(certification)}
    >
      <div className="relative h-32 bg-gradient-to-r from-wisetwin-darkblue to-wisetwin-blue">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-full">
            <Award className="h-10 w-10 text-white" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm p-1 text-white text-center">
          <Badge className="bg-green-600 hover:bg-green-700">
            Complété
          </Badge>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold mb-1 line-clamp-1">
          {certification.name}
        </h3>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <Calendar className="w-3 h-3 mr-1" />
          <span>
            Terminé le{" "}
            {formatSimpleDate(
              certification.completedAt || new Date()
            )}
          </span>
        </div>
        <Button
          className="w-full bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(certification);
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </Button>
      </div>
    </div>
  );
}