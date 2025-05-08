// components/mon-profil/statistiques/StatCard.jsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

/**
 * Composant de carte statistique réutilisable
 * @param {string} title - Le titre de la statistique
 * @param {React.ReactNode} icon - L'icône à afficher
 * @param {React.ReactNode} children - Le contenu de la carte
 * @param {string} className - Classes CSS supplémentaires
 */
export default function StatCard({ title, icon, children, className = "" }) {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}