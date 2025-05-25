"use client";
import React, { useState } from "react";
import { Check, ChevronDown, Building, User, Plus } from "lucide-react";
import { useActiveContext, useOrganization } from "@/newlib/hooks";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Composant pour changer de contexte entre Personnel et Organisation
 * Affiche le contexte actif et permet de basculer facilement
 */
export default function ContextSwitcher({ className, showLabel = true }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const {
    activeContext,
    isPersonalMode,
    isOrganizationMode,
    user,
    organizations,
    switchToPersonal,
    switchToOrganization,
    isLoading
  } = useActiveContext();
  
  const { loadOrganizations } = useOrganization({ autoLoad: false });
  
  /**
   * Gère le changement de contexte
   */
  const handleContextChange = async (type, organization = null) => {
    if (type === 'personal') {
      await switchToPersonal();
    } else if (type === 'organization' && organization) {
      await switchToOrganization(organization);
    }
    
    setIsOpen(false);
    
    // Optionnel : Recharger la page pour forcer la mise à jour
    // window.location.reload();
  };
  
  /**
   * Navigue vers la page de création d'organisation
   */
  const handleCreateOrganization = () => {
    setIsOpen(false);
    router.push('/organizations?action=create');
  };
  
  /**
   * Charge les organisations si nécessaire
   */
  const handleOpenChange = async (open) => {
    setIsOpen(open);
    
    // Charger les organisations à l'ouverture si pas déjà chargées
    if (open && organizations.length === 0) {
      await loadOrganizations();
    }
  };
  
  /**
   * Obtient l'icône et les initiales pour l'avatar
   */
  const getAvatarContent = () => {
    if (isPersonalMode) {
      const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'U';
      
      return {
        icon: <User className="h-4 w-4" />,
        initials,
        image: user?.profileImage
      };
    } else {
      const initials = activeContext.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ORG';
      
      return {
        icon: <Building className="h-4 w-4" />,
        initials,
        image: activeContext.logoUrl
      };
    }
  };
  
  const avatarContent = getAvatarContent();
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800",
            className
          )}
          disabled={isLoading}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarContent.image} />
            <AvatarFallback className="bg-primary/10">
              {avatarContent.initials}
            </AvatarFallback>
          </Avatar>
          
          {showLabel && (
            <div className="flex flex-col items-start text-left">
              <span className="text-xs text-muted-foreground">
                {isPersonalMode ? "Mode Personnel" : "Organisation"}
              </span>
              <span className="text-sm font-medium truncate max-w-[150px]">
                {activeContext.name}
              </span>
            </div>
          )}
          
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        {/* Mode Personnel */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Mode Personnel
        </DropdownMenuLabel>
        
        <DropdownMenuItem
          onClick={() => handleContextChange('personal')}
          className="flex items-center gap-3 py-3"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.profileImage} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="font-medium">{user?.name || "Utilisateur"}</div>
            <div className="text-xs text-muted-foreground">Personnel</div>
          </div>
          
          {isPersonalMode && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </DropdownMenuItem>
        
        {/* Organisations */}
        {organizations.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organisations
            </DropdownMenuLabel>
            
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.id}
                onClick={() => handleContextChange('organization', org)}
                className="flex items-center gap-3 py-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={org.logoUrl} />
                  <AvatarFallback className="bg-purple-100 dark:bg-purple-900">
                    {org.name
                      ?.split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || 'ORG'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="font-medium truncate">{org.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {org.role || 'Membre'}
                  </div>
                </div>
                
                {isOrganizationMode && activeContext.organizationId === org.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {/* Créer une organisation */}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateOrganization}
          className="flex items-center gap-3 py-3 text-primary"
        >
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-4 w-4" />
          </div>
          <span className="font-medium">Créer une organisation</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}