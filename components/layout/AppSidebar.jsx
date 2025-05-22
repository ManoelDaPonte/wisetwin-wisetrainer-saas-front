"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/lib/hooks/useTheme";
import navigationItems from "@/lib/config/config";

import {
	AudioWaveform,
	BookOpen,
	Bot,
	Command,
	Frame,
	GalleryVerticalEnd,
	Map,
	PieChart,
	Settings2,
	SquareTerminal,
	ChevronRight,
	ChevronsUpDown,
	Plus,
	Building2,
	Crown,
	CreditCard,
	LogOut,
	Settings,
	Sparkles,
	BadgeCheck,
	Bell,
	User,
} from "lucide-react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Separator } from "@/components/ui/separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";

const { topItems, coreItems, otherItems } = navigationItems;

// Organisation data
const teams = [
	{
		name: "Espace Personnel",
		logo: User,
		plan: "Personnel",
	},
	{
		name: "Mon Entreprise",
		logo: Building2,
		plan: "Pro",
	},
];

export function AppSidebar({ ...props }) {
	const pathname = usePathname();
	const { user } = useUser();
	const { theme } = useTheme();
	const [activeTeam, setActiveTeam] = React.useState(teams[0]);

	// Fonction pour déterminer si un item est actif
	const isItemActive = (itemId) => {
		if (itemId === "guide") {
			return pathname === "/guide" || pathname === "/" || pathname.startsWith("/guide");
		}
		return pathname.startsWith(`/${itemId}`);
	};

	// Convertir les items de navigation en format attendu
	const navMain = [
		{
			title: "Navigation principale",
			items: topItems.map((item) => ({
				id: item.id,
				title: item.label,
				url: `/${item.id}`,
				icon: item.icon,
				isActive: isItemActive(item.id),
				disabled: item.disabled,
			})),
		},
		{
			title: "Applications",
			items: coreItems.map((item) => ({
				id: item.id,
				title: item.label,
				url: `/${item.id}`,
				icon: item.icon,
				isActive: isItemActive(item.id),
				disabled: item.disabled,
			})),
		},
		{
			title: "Paramètres",
			items: otherItems.map((item) => ({
				id: item.id,
				title: item.label,
				url: `/${item.id}`,
				icon: item.icon,
				isActive: isItemActive(item.id),
				disabled: item.disabled,
			})),
		},
	];

	return (
		<Sidebar collapsible="icon" className="bg-muted/50" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-wisetwin-blue/10 data-[state=open]:text-wisetwin-darkblue hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
									tooltip={`${activeTeam.name} - ${activeTeam.plan}`}
								>
									<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-wisetwin-darkblue text-white">
										<activeTeam.logo className="size-4" />
									</div>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold text-foreground">
											{activeTeam.name}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{activeTeam.plan}
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
									Organisations
								</DropdownMenuLabel>
								{teams.map((team, index) => (
									<DropdownMenuItem
										key={team.name}
										onClick={() => setActiveTeam(team)}
										className="gap-2 p-2 hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue"
									>
										<div className="flex size-6 items-center justify-center rounded-sm border">
											<team.logo className="size-4 shrink-0" />
										</div>
										{team.name}
										<DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem className="gap-2 p-2 hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue">
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
						<SidebarGroupLabel className="text-muted-foreground text-xs">{section.title}</SidebarGroupLabel>
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
												${item.isActive ? 'bg-wisetwin-blue/10 text-wisetwin-darkblue dark:bg-wisetwin-blue/20 dark:text-wisetwin-blue' : ''}
											`}
										>
											{!item.disabled ? (
												<Link href={item.url} className="flex items-center gap-2 w-full focus:outline-none focus-visible:ring-0">
													<Icon className={`${item.isActive ? 'text-wisetwin-darkblue dark:text-wisetwin-blue' : 'text-muted-foreground'}`} />
													<span className={`${item.isActive ? 'text-wisetwin-darkblue dark:text-wisetwin-blue font-semibold' : 'text-foreground'}`}>{item.title}</span>
												</Link>
											) : (
												<div className="opacity-50 cursor-not-allowed flex items-center gap-2 w-full">
													<Icon className="text-muted-foreground" />
													<span className="text-muted-foreground">{item.title}</span>
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
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-wisetwin-blue/10 data-[state=open]:text-wisetwin-darkblue hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
									tooltip={user?.name || user?.email || "Menu utilisateur"}
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={user?.picture}
											alt={user?.name || "User"}
										/>
										<AvatarFallback className="rounded-lg bg-wisetwin-darkblue text-white">
											{(user?.name || user?.email || "U")
												.charAt(0)
												.toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold text-foreground">
											{user?.name || user?.email}
										</span>
										<span className="truncate text-xs text-muted-foreground">
											{user?.email}
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
												src={user?.picture}
												alt={user?.name || "User"}
											/>
											<AvatarFallback className="rounded-lg">
												{(user?.name || user?.email || "U")
													.charAt(0)
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">
												{user?.name || user?.email}
											</span>
											<span className="truncate text-xs text-muted-foreground">
												{user?.email}
											</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem className="hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue">
										<Sparkles />
										Upgrade to Pro
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem className="hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue">
										<BadgeCheck />
										Mon Profil
									</DropdownMenuItem>
									<DropdownMenuItem className="hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue">
										<CreditCard />
										Facturation
									</DropdownMenuItem>
									<DropdownMenuItem className="hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue">
										<Bell />
										Notifications
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="hover:bg-wisetwin-blue/10 hover:text-wisetwin-darkblue dark:hover:bg-wisetwin-blue/20 dark:hover:text-wisetwin-blue transition-colors focus:bg-wisetwin-blue/10 focus:text-wisetwin-darkblue">
									<LogOut />
									Se déconnecter
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}