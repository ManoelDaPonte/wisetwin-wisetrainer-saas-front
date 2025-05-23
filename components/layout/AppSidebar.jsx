"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useUser as useAuth0User } from "@auth0/nextjs-auth0";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/lib/hooks/useTheme";
import { useUser } from "@/newlib/hooks/useUser";
import { useOrganization } from "@/newlib/hooks/useOrganization";
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

export function AppSidebar({ ...props }) {
	const pathname = usePathname();
	const { user: auth0User } = useAuth0User();
	const { theme } = useTheme();

	// Hooks newlib
	const { user, azureContainer } = useUser();
	const {
		organizations,
		isLoading: orgsLoading,
		hasOrganizations,
		createOrganization,
	} = useOrganization();

	// État pour l'organisation/mode actuel
	const [activeContext, setActiveContext] = React.useState(null);

	// État pour la modale de création
	const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

	// Fonction pour charger le contexte depuis localStorage
	const loadContextFromStorage = React.useCallback(() => {
		const lastSelection = localStorage.getItem("wisetwin-active-context");
		if (lastSelection) {
			try {
				const parsed = JSON.parse(lastSelection);
				setActiveContext(parsed);
			} catch {
				// Si erreur de parsing, utiliser le mode personnel par défaut
				setActiveContext({
					type: "personal",
					name: "Mode Personnel",
					azureContainer: azureContainer,
				});
			}
		} else {
			// Mode personnel par défaut
			setActiveContext({
				type: "personal",
				name: "Mode Personnel",
				azureContainer: azureContainer,
			});
		}
	}, [azureContainer]);

	// Initialiser le contexte au chargement
	React.useEffect(() => {
		if (!activeContext) {
			loadContextFromStorage();
		}
	}, [activeContext, loadContextFromStorage]);

	// Écouter les changements de contexte depuis d'autres pages
	React.useEffect(() => {
		const handleContextChange = () => {
			loadContextFromStorage();
		};

		window.addEventListener(
			"wisetwin-context-changed",
			handleContextChange
		);

		return () => {
			window.removeEventListener(
				"wisetwin-context-changed",
				handleContextChange
			);
		};
	}, [loadContextFromStorage]);

	// Sauvegarder la sélection dans localStorage et recharger la page
	const updateActiveContext = (context) => {
		setActiveContext(context);
		localStorage.setItem(
			"wisetwin-active-context",
			JSON.stringify(context)
		);

		// Recharger la page pour vider tous les caches et états
		window.location.reload();
	};

	// Gérer la création d'organisation
	const handleCreateOrganization = async (orgData) => {
		try {
			const newOrg = await createOrganization(orgData);
			if (newOrg) {
				// Mettre à jour le contexte actif vers la nouvelle organisation
				updateActiveContext({
					type: "organization",
					id: newOrg.id,
					name: newOrg.name,
					logoUrl: newOrg.logoUrl,
					azureContainer: newOrg.azureContainer,
				});
				setIsCreateModalOpen(false);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la création de l'organisation:",
				error
			);
			throw error; // Relancer l'erreur pour que la modale puisse la gérer
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

	// Navigation items définis directement dans le composant
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
					id: "wisetwin",
					title: "WiseTwin",
					url: "/wisetwin",
					icon: Box,
					isActive: isItemActive("wisetwin"),
				},
				{
					id: "wisetrainer",
					title: "WiseTrainer",
					url: "/wisetrainer",
					icon: GraduationCap,
					isActive: isItemActive("wisetrainer"),
				},
			],
		},
		{
			title: "Organisation",
			items: [
				{
					id: "organization",
					title: "Gérer mon organisation",
					url: "/organization",
					icon: Users,
					isActive: isItemActive("organization"),
				},
			],
		},
	];

	return (
		<>
			<Sidebar collapsible="icon" className="bg-muted/50" {...props}>
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size="lg"
										className="data-[state=open]:bg-wisetwin-blue/10 data-[state=open]:text-wisetwin-darkblue hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
										tooltip={
											activeContext
												? `${activeContext.name}${
														activeContext.type ===
														"organization"
															? " - Organisation"
															: " - Personnel"
												  }`
												: "Chargement..."
										}
									>
										<div
											className={`flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden ${
												activeContext?.logoUrl
													? "bg-transparent"
													: "bg-wisetwin-darkblue text-white"
											}`}
										>
											{activeContext?.logoUrl ? (
												<Image
													src={activeContext.logoUrl}
													alt={
														activeContext.name ||
														"Logo"
													}
													width={32}
													height={32}
													className="rounded-lg object-cover"
												/>
											) : activeContext?.type ===
											  "organization" ? (
												<Building2 className="size-4" />
											) : (
												<User className="size-4" />
											)}
										</div>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold text-foreground">
												{activeContext?.name ||
													"Chargement..."}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{activeContext?.type ===
												"organization"
													? "Organisation"
													: "Personnel"}
											</span>
										</div>
										<ChevronsUpDown className="ml-auto text-muted-foreground" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
									align="start"
									side="bottom"
									sideOffset={4}
								>
									<DropdownMenuLabel className="text-xs text-muted-foreground">
										Contextes
									</DropdownMenuLabel>

									{/* Mode Personnel */}
									<DropdownMenuItem
										onClick={() =>
											updateActiveContext({
												type: "personal",
												name: "Mode Personnel",
												azureContainer: azureContainer,
											})
										}
										className="gap-2 p-2 hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue focus:outline-none focus-visible:ring-0"
									>
										<div className="flex size-6 items-center justify-center rounded-sm border bg-wisetwin-darkblue text-white">
											<User className="size-4 shrink-0" />
										</div>
										Mode Personnel
										{activeContext?.type === "personal" && (
											<DropdownMenuShortcut>
												✓
											</DropdownMenuShortcut>
										)}
									</DropdownMenuItem>

									{/* Organisations */}
									{hasOrganizations && (
										<>
											<DropdownMenuSeparator />
											<DropdownMenuLabel className="text-xs text-muted-foreground">
												Organisations
											</DropdownMenuLabel>
											{organizations.map((org, index) => (
												<DropdownMenuItem
													key={org.id}
													onClick={() =>
														updateActiveContext({
															type: "organization",
															id: org.id,
															name: org.name,
															logoUrl:
																org.logoUrl,
															azureContainer:
																org.azureContainer,
														})
													}
													className="gap-2 p-2 hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue focus:outline-none focus-visible:ring-0"
												>
													<div
														className={`flex size-6 items-center justify-center rounded-sm border overflow-hidden ${
															org.logoUrl
																? "bg-transparent"
																: "bg-background"
														}`}
													>
														{org.logoUrl ? (
															<Image
																src={
																	org.logoUrl
																}
																alt={org.name}
																width={24}
																height={24}
																className="rounded-sm object-cover"
															/>
														) : (
															<Building2 className="size-4 shrink-0" />
														)}
													</div>
													{org.name}
													{activeContext?.type ===
														"organization" &&
														activeContext?.id ===
															org.id && (
															<DropdownMenuShortcut>
																✓
															</DropdownMenuShortcut>
														)}
												</DropdownMenuItem>
											))}
										</>
									)}

									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() =>
											setIsCreateModalOpen(true)
										}
										className="gap-2 p-2 hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue focus:outline-none focus-visible:ring-0 cursor-pointer"
									>
										<div className="flex size-6 items-center justify-center rounded-md border bg-background">
											<Plus className="size-4" />
										</div>
										<div className="font-medium text-muted-foreground">
											Créer une organisation
										</div>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					{navMain.map((section) => (
						<SidebarGroup key={section.title}>
							<SidebarGroupLabel className="text-muted-foreground text-xs">
								{section.title}
							</SidebarGroupLabel>
							<SidebarMenu>
								{section.items.map((item) => {
									const Icon = item.icon;
									return (
										<SidebarMenuItem key={item.id}>
											<SidebarMenuButton
												asChild={!item.disabled}
												isActive={item.isActive}
												disabled={item.disabled}
												tooltip={item.title}
												className={`
												hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue 
												dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue 
												transition-colors duration-200 focus-visible:ring-0 focus-visible:ring-offset-0
												${
													item.isActive
														? "bg-wisetwin-blue/10 text-wisetwin-darkblue dark:bg-wisetwin-blue/20 dark:text-wisetwin-blue"
														: ""
												}
											`}
											>
												{!item.disabled ? (
													<Link
														href={item.url}
														className="flex items-center gap-2 w-full focus:outline-none focus-visible:ring-0"
													>
														<Icon
															className={`${
																item.isActive
																	? "text-wisetwin-darkblue dark:text-wisetwin-blue"
																	: "text-muted-foreground"
															}`}
														/>
														<span
															className={`${
																item.isActive
																	? "text-wisetwin-darkblue dark:text-wisetwin-blue font-semibold"
																	: "text-foreground"
															}`}
														>
															{item.title}
														</span>
													</Link>
												) : (
													<div className="opacity-50 cursor-not-allowed flex items-center gap-2 w-full">
														<Icon className="text-muted-foreground" />
														<span className="text-muted-foreground">
															{item.title}
														</span>
													</div>
												)}
											</SidebarMenuButton>
										</SidebarMenuItem>
									);
								})}
							</SidebarMenu>
						</SidebarGroup>
					))}
				</SidebarContent>
				{auth0User && (
					<SidebarFooter>
						<SidebarMenu>
							<SidebarMenuItem>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<SidebarMenuButton
											size="lg"
											className="data-[state=open]:bg-wisetwin-blue/10 data-[state=open]:text-wisetwin-darkblue hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
											tooltip={
												auth0User?.name ||
												auth0User?.email ||
												"Menu utilisateur"
											}
										>
											<Avatar className="h-8 w-8 rounded-lg">
												<AvatarImage
													src={auth0User?.picture}
													alt={
														auth0User?.name ||
														auth0User?.email ||
														"User"
													}
												/>
												<AvatarFallback className="rounded-lg bg-wisetwin-darkblue text-white">
													{(
														auth0User?.name ||
														auth0User?.email ||
														"U"
													)
														.charAt(0)
														.toUpperCase()}
												</AvatarFallback>
											</Avatar>
											<div className="grid flex-1 text-left text-sm leading-tight">
												<span className="truncate font-semibold text-foreground">
													{auth0User?.name ||
														auth0User?.email?.split(
															"@"
														)[0] ||
														"Utilisateur"}
												</span>
												<span className="truncate text-xs text-muted-foreground">
													{auth0User?.email ||
														"Email non disponible"}
												</span>
											</div>
											<ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
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
														src={auth0User?.picture}
														alt={
															auth0User?.name ||
															auth0User?.email ||
															"User"
														}
													/>
													<AvatarFallback className="rounded-lg">
														{(
															auth0User?.name ||
															auth0User?.email ||
															"U"
														)
															.charAt(0)
															.toUpperCase()}
													</AvatarFallback>
												</Avatar>
												<div className="grid flex-1 text-left text-sm leading-tight">
													<span className="truncate font-semibold">
														{auth0User?.name ||
															auth0User?.email?.split(
																"@"
															)[0] ||
															"Utilisateur"}
													</span>
													<span className="truncate text-xs text-muted-foreground">
														{auth0User?.email ||
															"Email non disponible"}
													</span>
												</div>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuItem
												asChild
												className="hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue focus:outline-none focus-visible:ring-0"
											>
												<Link href="/settings">
													<Settings />
													Paramètres
												</Link>
											</DropdownMenuItem>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											asChild
											className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors focus:bg-red-50 focus:text-red-600 focus:outline-none focus-visible:ring-0"
										>
											<a href="/auth/logout">
												<LogOut />
												Se déconnecter
											</a>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarFooter>
				)}
			</Sidebar>

			{/* Modale de création d'organisation */}
			<CreateOrganizationModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
				onSubmit={handleCreateOrganization}
			/>
		</>
	);
}
