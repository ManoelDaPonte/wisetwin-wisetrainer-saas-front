// components/mon-profil/certifications/CertificationModal.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Image from "next/image";

/**
 * Formatage complet des dates avec heure
 * @param {Date|string} dateString - Date à formater
 * @returns {string} Date formatée
 */
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Composant modal pour afficher les détails d'une certification
 * @param {Object} certification - Données de la certification
 * @param {function} onClose - Callback pour fermer le modal
 * @param {function} onDownload - Callback pour télécharger la certification
 */
export default function CertificationModal({ 
  certification, 
  onClose, 
  onDownload 
}) {
  if (!certification) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              Certification: {certification.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-8 rounded-lg mb-6 flex flex-col items-center text-center">
            <div className="mb-6">
              <Image
                src="/logos/logo_parrot_dark.svg"
                alt="WiseTwin Logo"
                width={100}
                height={100}
              />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Certificat d'achèvement
            </h2>
            <p className="text-lg mb-6">
              Cette certification est décernée à
            </p>
            <p className="text-xl font-bold mb-6">
              John Doe
            </p>
            <p className="mb-4">
              Pour avoir complété avec succès la formation
            </p>
            <p className="text-xl font-bold text-wisetwin-blue mb-6">
              {certification.name}
            </p>
            <p className="mb-2">Avec un score de</p>
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-800 font-bold text-xl flex items-center justify-center mb-6">
              {certification.score || 90}
            </div>
            <p className="text-sm text-muted-foreground">
              Terminé le{" "}
              {formatDate(
                certification.completedAt || new Date()
              )}
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Fermer
            </Button>
            <Button
              className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
              onClick={() => onDownload(certification)}
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le certificat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}