// components/settings/SettingsModal.jsx

import React, { useState } from "react";
import NavButton from "@/components/common/NavButton";
import { cn } from "@/lib/utils";
import GeneralTab from "@/components/settings/tabs/GeneralTab";
import AccountTab from "@/components/settings/tabs/AccountTab";
import { Settings as SettingsIcon, User, LogOut, Moon, X } from "lucide-react";

const SettingsModal = ({ isOpen, onClose }) => {
	const [activeTab, setActiveTab] = useState("general");
	const tabs = [
		{
			id: "general",
			label: "Préférences",
			icon: <SettingsIcon size={18} />,
		},
		{
			id: "account",
			label: "Mon Compte",
			icon: <User size={18} />,
		},
		{
			id: "logout",
			label: "Déconnexion",
			icon: <LogOut size={18} />,
			action: () => (window.location.href = "/api/auth/logout"),
			className: "mt-auto text-destructive hover:text-destructive/90",
		},
	];

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
			<div className="bg-background w-[550px] rounded-lg shadow-lg border border-border p-6 relative flex">
				{/* Bouton de fermeture */}
				<button
					className="absolute top-2 right-2 text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-accent transition-colors"
					onClick={onClose}
					aria-label="Fermer"
				>
					<X size={18} />
				</button>

				{/* Barre latérale pour les onglets */}
				<div className="w-1/3 border-r border-border pr-4">
					<h2 className="text-lg font-semibold mb-4 text-foreground">
						Paramètres
					</h2>
					<nav className="flex flex-col space-y-2 h-[400px]">
						{tabs.map((tab) => (
							<NavButton
								key={tab.id}
								onClick={() =>
									tab.action
										? tab.action()
										: setActiveTab(tab.id)
								}
								icon={tab.icon}
								className={cn(
									"flex items-center justify-between w-full h-10 px-4 rounded-md text-sm font-medium",
									activeTab === tab.id
										? "bg-accent text-accent-foreground"
										: "hover:bg-accent/50 text-foreground",
									tab.className
								)}
								badge={tab.badge}
								disabled={tab.disabled}
							>
								{tab.label}
							</NavButton>
						))}
					</nav>
				</div>
				<div className="w-2/3 pl-6">
					{activeTab === "general" && <GeneralTab />}
					{activeTab === "account" && <AccountTab />}
				</div>
			</div>
		</div>
	);
};

export default SettingsModal;
