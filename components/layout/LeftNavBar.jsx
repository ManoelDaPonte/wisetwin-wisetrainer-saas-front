// components/LeftNavBar.jsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import navigationItems from "@/lib/config/config";
import { cn } from "@/lib/utils";

const { topItems, coreItems, settingsItems, otherItems } = navigationItems;

export default function LeftNavBar() {
	const router = useRouter();
	const pathname = usePathname();
	const [activeId, setActiveId] = useState("");

	// Mettre à jour l'ID actif en fonction du chemin actuel
	useEffect(() => {
		setActiveId(pathname === "/" ? "" : pathname.slice(1));
	}, [pathname]);

	// Ne pas afficher la barre latérale sur la page de connexion
	if (pathname === "/login") return null;

	// Fonction pour générer un élément de navigation
	const NavItem = ({ item, isActive }) => {
		const isDisabled = item.disabled === true;
		const Icon = item.icon;

		// Créer le contenu de l'élément de navigation
		const navItemContent = (
			<motion.div
				whileHover={isDisabled ? {} : { scale: 1.02 }}
				whileTap={isDisabled ? {} : { scale: 0.98 }}
				onClick={() => {
					if (isDisabled) return;

					setActiveId(item.id);
					if (item.external) {
						window.open(
							"https://documentation.wisetwin.eu/",
							"_blank"
						);
					} else {
						router.push(`/${item.id}`);
					}
				}}
				className={cn(
					"flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors",
					isDisabled
						? "opacity-50 cursor-not-allowed"
						: "cursor-pointer",
					isActive && !isDisabled
						? "bg-wisetwin-darkblue/10 text-wisetwin-darkblue dark:text-wisetwin-blue"
						: isDisabled
						? "text-gray-400 dark:text-gray-500"
						: "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-wisetwin-blue/10"
				)}
			>
				{/* Utilisation des composants Lucide */}
				{Icon && (
					<Icon
						className={cn(
							"w-5 h-5",
							isDisabled
								? "text-gray-400 dark:text-gray-500"
								: isActive
								? "text-wisetwin-darkblue dark:text-wisetwin-blue"
								: "text-gray-500"
						)}
					/>
				)}
				<span className="font-medium text-sm">{item.label}</span>
			</motion.div>
		);

		// Retourner simplement le contenu
		return navItemContent;
	};

	// Fonction pour générer une section de navigation avec un séparateur visuel au lieu d'un titre
	const NavSection = ({ items, withDivider = false }) => (
		<div className="mb-6">
			{withDivider && (
				<div className="h-px bg-gray-200 dark:bg-wisetwin-darkblue-light my-4 mx-4"></div>
			)}
			<div className="space-y-1">
				{items.map((item) => (
					<NavItem
						key={item.id}
						item={item}
						isActive={activeId === item.id}
					/>
				))}
			</div>
		</div>
	);

	return (
		<aside className="bg-white dark:bg-wisetwin-darkblue border-r border-gray-200 dark:border-wisetwin-darkblue-light w-60 h-screen">
			{/* Logo */}
			<div className="py-6 flex justify-center items-center">
				<div className="px-4 flex items-center">
					<Image
						src="/logos/logo_parrot_dark.svg"
						alt="Wise Twin Logo"
						width={15}
						height={15}
						className="mr-2"
					/>
					<h1 className="text-xl font-bold">
						<span className="text-wisetwin-darkblue dark:text-wisetwin-blue">
							Wise
						</span>
						<span className="text-wisetwin-blue dark:text-white">
							Twin
						</span>
					</h1>
				</div>
			</div>

			{/* Sections de navigation avec séparateurs visuels au lieu de titres */}
			<div className="flex-1 overflow-y-auto py-4 px-3">
				<NavSection items={topItems} />
				<NavSection items={coreItems} withDivider={true} />
				{/* <NavSection items={settingsItems} withDivider={true} /> */}
				<NavSection items={otherItems} withDivider={true} />
			</div>
		</aside>
	);
}
