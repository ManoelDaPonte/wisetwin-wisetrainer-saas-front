// components/common/Spinner.jsx
import React from "react";
import { motion } from "framer-motion";

/**
 * Composant de spinner animé pour les états de chargement
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.text - Le texte à afficher sous le spinner
 * @param {string} props.size - La taille du spinner (sm, md, lg)
 * @param {string} props.color - La couleur de la bordure principale du spinner
 * @param {boolean} props.centered - Si le spinner doit être centré dans son conteneur
 * @param {string} props.className - Classes CSS additionnelles
 */
export default function Spinner({ 
  text, 
  size = "md", 
  color = "wisetwin-blue", 
  centered = true,
  className = "" 
}) {
  // Définir les tailles
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-16 w-16 border-6",
  };

  // Définir la taille de la police en fonction de la taille du spinner
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  // Construction des classes CSS
  const spinnerClasses = `animate-spin ${sizes[size]} border-${color} border-t-transparent rounded-full ${className}`;
  
  // Le conteneur n'est centré que si l'option centered est true
  const containerClasses = centered 
    ? "flex flex-col items-center justify-center h-full" 
    : "flex flex-col items-center";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={containerClasses}
    >
      <div className={spinnerClasses}></div>
      {text && (
        <motion.p 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`mt-4 ${textSizes[size]} text-center`}
        >
          {text}
        </motion.p>
      )}
    </motion.div>
  );
}