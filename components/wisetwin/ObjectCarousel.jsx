"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { X } from "lucide-react";

const ObjectCarousel = ({
  objectName,
  images = [],
  open = false,
  onOpenChange,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [api, setApi] = useState();

  // Debug logs
  console.log("🎠 ObjectCarousel rendu avec:", {
    objectName,
    imagesCount: images.length,
    open,
    images: images.slice(0, 2), // Juste les 2 premières pour éviter le spam
  });

  // Synchroniser l'index actuel avec l'API du carousel
  useEffect(() => {
    if (!api) return;

    // Écouter les changements de sélection
    api.on("select", () => {
      setCurrentImageIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Réinitialiser l'index quand on change d'objet ou qu'on ouvre la modal
  useEffect(() => {
    if (open) {
      setCurrentImageIndex(0);
      setImageLoadErrors(new Set());
      if (api) {
        api.scrollTo(0);
      }
    }
  }, [objectName, open, api]);

  // Navigation clavier et molette
  useEffect(() => {
    if (!open || !api) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          api.scrollPrev();
          break;
        case "ArrowRight":
        case "ArrowDown":
        case " ": // Espace
          event.preventDefault();
          api.scrollNext();
          break;
        case "Home":
          event.preventDefault();
          api.scrollTo(0);
          break;
        case "End":
          event.preventDefault();
          api.scrollTo(images.length - 1);
          break;
      }
    };

    const handleWheel = (event) => {
      event.preventDefault();
      if (event.deltaY > 0) {
        api.scrollNext();
      } else {
        api.scrollPrev();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("wheel", handleWheel);
    };
  }, [open, api, images.length]);

  const handleImageError = (index) => {
    setImageLoadErrors((prev) => new Set([...prev, index]));
  };

  const goToSlide = (index) => {
    if (api) {
      api.scrollTo(index);
    }
  };

  if (!images.length) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[50vw] !max-h-[95vh] !w-[98vw] !h-[95vh] p-0">
        <DialogHeader className="p-4 pb-2 shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {objectName}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {currentImageIndex + 1} / {images.length}
          </DialogDescription>
        </DialogHeader>

        {/* Carousel - Prend tout l'espace disponible */}
        <div className="flex-1 px-16 pb-4 min-h-0">
          <div className="relative h-full">
            <Carousel
              className="w-full h-full"
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
            >
              <CarouselContent className="h-full">
                {images.map((imagePath, index) => (
                  <CarouselItem key={index} className="h-full">
                    <div className="relative w-full h-[82vh] bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {!imageLoadErrors.has(index) ? (
                        <Image
                          src={imagePath}
                          alt={`${objectName} - Image ${index + 1}`}
                          fill
                          className="object-contain cursor-zoom-in hover:scale-115 transition-transform duration-200"
                          onError={() => handleImageError(index)}
                          priority={index === 0}
                          sizes="98vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-gray-500 dark:text-gray-400">
                            <div className="text-lg mb-2">
                              Image non disponible
                            </div>
                            <div className="text-sm">{imagePath}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {images.length > 1 && (
                <>
                  <CarouselPrevious className="-left-8 w-12 h-12 bg-white/95 dark:bg-black/95 hover:bg-white dark:hover:bg-black border-2 shadow-lg" />
                  <CarouselNext className="-right-8 w-12 h-12 bg-white/95 dark:bg-black/95 hover:bg-white dark:hover:bg-black border-2 shadow-lg" />
                </>
              )}
            </Carousel>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ObjectCarousel;
