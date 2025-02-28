// components/common/Modal.jsx

import React, { useState } from "react";
import NavButton from "@/components/common/NavButton"; // Importer le composant NavButton
import { cn } from "@/lib/utils"; // Assure-toi que cette fonction est définie pour gérer les classes conditionnelles
import GeneralTab from "@/components/settings/tabs/GeneralTab";
import TeamsTab from "@/components/settings/tabs/TeamsTab";
import AccountTab from "@/components/settings/tabs/AccountTab";

const SettingsModal = ({ isOpen, onClose }) => {
	const [activeTab, setActiveTab] = useState("general");

	const tabs = [
		{ id: "general", label: "General", icon: "/icons/svg/settings.svg" },
		{
			id: "teams",
			label: "Teams",
			icon: "/icons/svg/users.svg",
			badge: { label: "soon", color: "purple" },
			disabled: true,
		},
		{
			id: "account",
			label: "Account",
			icon: "/icons/svg/user-round-cog.svg",
		},
	];

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
			<div className="bg-white w-[600px] rounded-lg shadow-lg p-6 relative flex">
				{/* Bouton de fermeture */}
				<button
					className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
					onClick={onClose}
				>
					✕
				</button>

				{/* Barre latérale pour les onglets */}
				<div className="w-1/3 border-r border-gray-200 pr-4">
					<h2 className="text-lg font-semibold mb-4">Settings</h2>
					<nav className="flex flex-col space-y-2">
						{tabs.map((tab) => (
							<NavButton
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								icon={tab.icon}
								className={cn(
									"flex items-center justify-between w-full h-10 px-4 rounded-md text-sm font-medium",
									activeTab === tab.id
										? "bg-gray-200 text-gray-900"
										: "hover:bg-gray-50"
								)}
								badge={tab.badge}
								disabled={tab.disabled} // Utilisation directe du paramètre disabled
							>
								{tab.label}
							</NavButton>
						))}
					</nav>
				</div>
				<div className="w-2/3 pl-6">
					{activeTab === "general" && <GeneralTab />}
					{activeTab === "teams" && <TeamsTab />}
					{activeTab === "account" && <AccountTab />}
				</div>
			</div>
		</div>
	);
};

export default SettingsModal;
