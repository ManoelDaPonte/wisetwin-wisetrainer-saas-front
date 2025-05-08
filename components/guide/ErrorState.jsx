// components/guide/ErrorState.jsx
import React from "react";
import { motion } from "framer-motion";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Composant pour afficher un état d'erreur dans la page Guide
 * @param {Object} props - Props du composant
 * @param {string} props.message - Message d'erreur à afficher
 * @param {Function} props.onRetry - Fonction à appeler pour réessayer
 * @param {boolean} props.isRetrying - Indique si une tentative de récupération est en cours
 * @returns {JSX.Element} - Composant ErrorState
 */
export default function ErrorState({
  message = "Une erreur est survenue lors du chargement des données",
  onRetry,
  isRetrying = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-6"
    >
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span>{message}</span>
          {onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              disabled={isRetrying}
              className="whitespace-nowrap ml-auto"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRetrying ? "animate-spin" : ""}`}
              />
              {isRetrying ? "Chargement..." : "Réessayer"}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}