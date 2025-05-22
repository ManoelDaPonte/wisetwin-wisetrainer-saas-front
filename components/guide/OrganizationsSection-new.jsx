"use client";
import React from "react";
import OrganizationTrainingPanel from "./OrganizationTrainingPanel-new";

/**
 * Composant pour afficher la section des organisations
 * Adapter pour utiliser la nouvelle architecture
 * 
 * @param {Object} props - Propriétés du composant
 * @param {Array} props.organizationsData - Données formatées des organisations
 * @returns {JSX.Element} Section des organisations
 */
export default function OrganizationsSection({ organizationsData = [] }) {
  if (!organizationsData || organizationsData.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {organizationsData.map((orgData) => (
        <OrganizationTrainingPanel
          key={orgData.organization.id}
          organization={orgData.organization}
          taggedTrainings={orgData.taggedTrainings}
          organizationTrainings={orgData.orgTrainings}
          hasCompletedTaggedTrainings={
            orgData.hasCompletedTaggedTrainings
          }
        />
      ))}
    </div>
  );
}