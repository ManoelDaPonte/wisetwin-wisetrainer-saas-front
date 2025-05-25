"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/lib/hooks/useTheme";
import { useActiveContext, usePermissions } from "@/lib/hooks";
import ContextSwitcher from "@/components/common/ContextSwitcher";
import CreateOrganizationModal from "@/components/organizations/CreateOrganizationModal";

import {
	ChevronsUpDown,
	Plus,
	Building2,
	LogOut,
	Settings,
	User,
	Home,
	Compass,
	GraduationCap,
	Box,
	Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

/**
 * Sidebar principale de l'application
 * Utilise les nouveaux hooks contextuels
 */
export function AppSidebar({ ...props }) {
	const pathname = usePathname();
	const { theme } = useTheme();
	const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

	// Hook pour le contexte actif
	const {
		activeContext,
		isPersonalMode,
		isOrganizationMode,
		user,
		currentOrganization,
		organizations,
		switchToOrganization,
	} = useActiveContext();

	// Hook pour les permissions
	const { can } = usePermissions();

	// Gérer la création d'organisation
	const handleCreateOrganization = async (orgData) => {
		try {
			const { createOrganization } = await import(
				"@/lib/hooks/useOrganization"
			);
			const newOrg = await createOrganization(orgData);

			if (newOrg) {
				// Basculer vers la nouvelle organisation
				await switchToOrganization(newOrg);
				setIsCreateModalOpen(false);

				// Optionnel : Recharger la page
				window.location.reload();
			}
		} catch (error) {
			console.error(
				"Erreur lors de la création de l'organisation:",
				error
			);
			throw error;
		}
	};

	// Fonction pour déterminer si un item est actif
	const isItemActive = (itemId) => {
		if (itemId === "/") {
			return pathname === "/";
		}
		if (itemId === "guide") {
			return pathname === "/guide" || pathname.startsWith("/guide");
		}
		return pathname.startsWith(`/${itemId}`);
	};

	// Navigation items principaux
	const navMain = [
		{
			title: "Navigation principale",
			items: [
				{
					id: "/",
					title: "Accueil",
					url: "/",
					icon: Home,
					isActive: isItemActive("/"),
				},
				{
					id: "guide",
					title: "Guide",
					url: "/guide",
					icon: Compass,
					isActive: isItemActive("guide"),
				},
				{
					id: "mon-profil",
					title: "Mon profil",
					url: "/mon-profil",
					icon: User,
					isActive: isItemActive("mon-profil"),
				},
			],
		},
		{
			title: "Applications",
			items: [
				{
					id: "wisetrainer",
					title: "WiseTrainer",
					url: "/wisetrainer",
					icon: GraduationCap,
					isActive: isItemActive("wisetrainer"),
				},
				{
					id: "wisetwin",
					title: "WiseTwin",
					url: "/wisetwin",
					icon: Box,
					isActive: isItemActive("wisetwin"),
				},
			],
		},
	];

	// Items contextuels (seulement en mode organisation)
	const contextualItems =
		isOrganizationMode && can("canViewOrganization")
			? [
					{
						title: "Organisation",
						items: [
							{
								id: "organization",
								title:
									currentOrganization?.name || "Organisation",
								url: "/organization",
								icon: Building2,
								isActive: isItemActive("organization"),
							},
							{
								id: "organizations",
								title: "Toutes les organisations",
								url: "/organizations",
								icon: Users,
								isActive: isItemActive("organizations"),
							},
						],
					},
			  ]
			: [];

	// Logo selon le thème
	const logoSrc =
		theme === "dark"
			? "/logos/logo_wisetwin_white.svg"
			: "/logos/logo_wisetwin_dark.svg";

	return (
		<>
			<Sidebar {...props}>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton size="lg" asChild>
								<Link href="/">
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg">
										<Image
											src={logoSrc}
											alt="WiseTwin Logo"
											width={32}
											height={32}
											className="size-8"
										/>
									</div>
									<div className="flex flex-col gap-0.5 leading-none">
										<span className="font-semibold">
											WiseTwin
										</span>
										<span className="text-xs">
											Formation VR
										</span>
									</div>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>

				<SidebarContent>
					{/* Navigation principale */}
					{navMain.map((group) => (
						<SidebarGroup key={group.title}>
							<SidebarGroupLabel>{group.title}</SidebarGroupLabel>
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											asChild
											isActive={item.isActive}
										>
											<Link href={item.url}>
												<item.icon className="size-4" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroup>
					))}

					{/* Navigation contextuelle */}
					{contextualItems.map((group) => (
						<SidebarGroup key={group.title}>
							<SidebarGroupLabel>{group.title}</SidebarGroupLabel>
							<SidebarMenu>
								{group.items.map((item) => (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											asChild
											isActive={item.isActive}
										>
											<Link href={item.url}>
												<item.icon className="size-4" />
												<span>{item.title}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</SidebarGroup>
					))}
				</SidebarContent>

				<SidebarFooter>
					<SidebarMenu>
						<SidebarMenuItem>
							{/* Context Switcher */}
							<ContextSwitcher className="w-full" />
						</SidebarMenuItem>

						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
									>
										<Avatar className="h-8 w-8 rounded-lg">
											<AvatarImage
												src={user?.profileImage}
												alt={user?.name}
											/>
											<AvatarFallback className="rounded-lg">
												{user?.name
													?.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{user?.name || "Utilisateur"}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{user?.email}
											</span>
										</div>
										<ChevronsUpDown className="ml-auto size-4" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
									side="bottom"
									align="end"
									sideOffset={4}
								>
									<DropdownMenuLabel className="p-0 font-normal">
										<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
											<Avatar className="h-8 w-8 rounded-lg">
												<AvatarImage
													src={user?.profileImage}
													alt={user?.name}
												/>
												<AvatarFallback className="rounded-lg">
													{user?.name
														?.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase() || "U"}
												</AvatarFallback>
											</Avatar>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold">
													{user?.name}
												</span>
												<span className="truncate text-xs text-muted-foreground">
													{user?.email}
												</span>
											</div>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuGroup>
										<DropdownMenuItem asChild>
											<Link href="/mon-profil">
												<User className="mr-2 h-4 w-4" />
												Mon profil
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link href="/settings">
												<Settings className="mr-2 h-4 w-4" />
												Paramètres
											</Link>
										</DropdownMenuItem>
									</DropdownMenuGroup>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild>
										<a href="/api/auth/logout">
											<LogOut className="mr-2 h-4 w-4" />
											Se déconnecter
										</a>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>

			{/* Modale de création d'organisation */}
			<CreateOrganizationModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSuccess={handleCreateOrganization}
			/>
		</>
	);
}
