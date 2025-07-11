"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Minimize2,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import Image from "next/image";

export default function AIInsideNotice({ isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 64 });

  // Initialiser la position après le montage du composant
  React.useEffect(() => {
    setPosition({ x: window.innerWidth - 400, y: 64 });
  }, []);

  // Liste des images d'instructions pour AI Inside (dans l'ordre chronologique)
  const instructionImages = [
    {
      filename: "1-posez les pièces.png",
      title: "1. Posez les pièces",
      description: "Positionnez les pièces principales selon le plan",
    },
    {
      filename: "2-posez les inserts.png",
      title: "2. Posez les inserts",
      description: "Placez les inserts dans leurs emplacements respectifs",
    },
    {
      filename: "3-posez les pièces et les inserts.png",
      title: "3. Posez les pièces et les inserts",
      description: "Assemblage complet des pièces avec leurs inserts",
    },
    {
      filename: "3.1-inspectez visuellement.png",
      title: "3.1. Inspectez visuellement",
      description: "Effectuez une inspection visuelle complète de l'assemblage",
    },
    {
      filename: "4-appuyez sur le bouton.png",
      title: "4. Appuyez sur le bouton",
      description: "Localisez et appuyez sur le bouton pour continuer",
    },
    {
      filename: "4.1-detection conformité 1.png",
      title: "4.1. Détection conformité 1",
      description: "Vérifiez la conformité de l'assemblage étape 1",
    },
    {
      filename: "4.2-détection conformités recto verso.png",
      title: "4.2. Détection conformités recto verso",
      description: "Contrôlez la conformité des deux côtés de la pièce",
    },
    {
      filename: "5-retournez les pieces.png",
      title: "5. Retournez les pièces",
      description: "Effectuez un retournement des pièces pour la suite de l'assemblage",
    },
    {
      filename: "6-vissez l'insert de droite.png",
      title: "6. Vissez l'insert de droite",
      description: "Fixez l'insert du côté droit avec le vissage approprié",
    },
    {
      filename: "7-collez l'étiquette de droite.png",
      title: "7. Collez l'étiquette de droite",
      description: "Positionnez l'étiquette du côté droit selon les instructions",
    },
    {
      filename: "8-appuyez sur le bouton.png",
      title: "8. Appuyez sur le bouton",
      description: "Appuyez sur le bouton pour valider l'étape",
    },
    {
      filename: "9-vissez l'insert de gauche.png",
      title: "9. Vissez l'insert de gauche",
      description: "Fixez l'insert du côté gauche avec le vissage approprié",
    },
    {
      filename: "10-collez l'étiquette de gauche.png",
      title: "10. Collez l'étiquette de gauche",
      description: "Positionnez l'étiquette du côté gauche selon les instructions",
    },
    {
      filename: "11-enlevez vos mains du cadre pour la photo.png",
      title: "11. Enlevez vos mains du cadre",
      description: "Retirez vos mains de la zone de capture pour la validation",
    },
    {
      filename: "12-appuyez sur le bouton.png",
      title: "12. Appuyez sur le bouton final",
      description: "Appuyez sur le bouton pour finaliser la procédure",
    },
  ];

  // Fonction pour naviguer dans les images
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < instructionImages.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : instructionImages.length - 1
    );
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Fonctions pour le drag and drop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Limiter aux bordures de l'écran
    const maxX = window.innerWidth - (isMinimized ? 256 : 384);
    const maxY = window.innerHeight - (isMinimized ? 64 : 600);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Ajouter les event listeners
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, position]);

  if (!isOpen) return null;

  // Affichage minimisé
  if (isMinimized) {
    return (
      <div 
        className="fixed z-40 w-64 h-16 bg-blue-600 dark:bg-blue-800 text-white p-4 rounded-lg shadow-xl flex items-center justify-between cursor-move"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <h3 className="">Notice AI Inside</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            toggleMinimize();
          }}
          className="text-white hover:bg-blue-500"
        >
          <Maximize2 size={18} />
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="fixed z-40 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col border border-gray-200 dark:border-gray-700"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        userSelect: 'none'
      }}
    >
      {/* En-tête */}
      <div 
        className="bg-blue-600 dark:bg-blue-800 text-white p-4 flex items-center justify-between rounded-t-lg cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-sm">Notice AI Inside</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-500 px-2 py-1 rounded">
            {currentImageIndex + 1}/{instructionImages.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimize();
            }}
            className="text-white hover:bg-blue-500"
          >
            <Minimize2 size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-white hover:bg-blue-500"
          >
            <X size={18} />
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col p-4">
        {/* Zone d'image */}
        <div className="relative h-64 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <Image
            src={`/images/wisetrainer/aiinside/${instructionImages[currentImageIndex].filename}`}
            alt={instructionImages[currentImageIndex].title}
            fill
            className="object-contain"
            onError={(e) => {
              e.target.src = "/images/png/placeholder.png";
            }}
          />
        </div>

        {/* Navigation des images */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prevImage}
            className="flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextImage}
            className="flex items-center gap-1"
          >
            Suivant
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Titre et description */}
        <div className="text-center">
          <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
            {instructionImages[currentImageIndex].title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {instructionImages[currentImageIndex].description}
          </p>
        </div>

        {/* Indicateurs de pages */}
        <div className="flex justify-center gap-1 mt-4">
          {instructionImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex
                  ? "bg-blue-500"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Pied de page */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Consultez cette notice pendant votre formation pour connaître les
          différentes étapes
        </p>
      </div>
    </div>
  );
}
