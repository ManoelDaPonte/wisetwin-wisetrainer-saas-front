"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Minimize2, Maximize2, XCircle, Info } from "lucide-react";
import Image from "next/image";

const InformationModal = ({
  isOpen,
  onClose,
  title,
  description,
  imageUrl,
  keyToPress,
  unityRef
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  const handleContinue = () => {
    // Simuler l'appui sur la touche spécifiée
    if (unityRef && unityRef.current) {
      console.log(`Simulation de l'appui sur la touche '${keyToPress}'`);
      
      // Envoi du message à Unity pour simuler l'appui sur une touche
      unityRef.current.sendMessage("MANAGERS/InputManager", "SimulateKeyPress", keyToPress);
      
      // Création d'événements clavier
      const keydownEvent = new KeyboardEvent("keydown", {
        key: keyToPress,
        code: `Digit${keyToPress}`,
        keyCode: 48 + parseInt(keyToPress), // Codes ASCII: 1 = 49, 2 = 50, etc.
        which: 48 + parseInt(keyToPress),
        bubbles: true,
        cancelable: true,
      });

      const keyupEvent = new KeyboardEvent("keyup", {
        key: keyToPress,
        code: `Digit${keyToPress}`,
        keyCode: 48 + parseInt(keyToPress),
        which: 48 + parseInt(keyToPress),
        bubbles: true,
        cancelable: true,
      });

      // Dispatcher les événements sur l'élément Unity ou sur le document
      const unityCanvas = document.querySelector("canvas");
      if (unityCanvas) {
        unityCanvas.dispatchEvent(keydownEvent);
        // Petit délai pour que ça semble naturel
        setTimeout(() => {
          unityCanvas.dispatchEvent(keyupEvent);
        }, 100);
      } else {
        document.dispatchEvent(keydownEvent);
        setTimeout(() => {
          document.dispatchEvent(keyupEvent);
        }, 100);
      }
    }
    
    // Fermer la modale
    onClose();
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div 
        className={`bg-white dark:bg-gray-900 rounded-lg w-full max-w-2xl shadow-lg overflow-hidden transition-all duration-300 ${
          isMinimized ? 'h-auto max-h-16' : 'max-h-[90vh]'
        }`}
      >
        {/* En-tête de la modale */}
        <div className="flex items-center justify-between px-6 py-4 bg-wisetwin-blue text-white">
          <div className="flex items-center">
            <Info className="w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMinimize}
              className="p-1 rounded-full hover:bg-blue-600 focus:outline-none"
            >
              {isMinimized ? <Maximize2 className="w-5 h-5" /> : <Minimize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-blue-600 focus:outline-none"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu de la modale */}
        {!isMinimized && (
          <div className="p-6">
            {description && (
              <div className="mb-6 text-gray-700 dark:text-gray-300">
                {description}
              </div>
            )}
            
            {imageUrl && (
              <div className="flex justify-center my-6 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <div className="relative w-full h-64">
                  <Image
                    src={imageUrl}
                    alt={title}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={handleContinue} 
                className="bg-wisetwin-blue hover:bg-blue-700 text-white flex items-center"
              >
                Continuer
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InformationModal;