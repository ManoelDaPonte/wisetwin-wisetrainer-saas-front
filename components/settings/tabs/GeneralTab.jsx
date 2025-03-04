// components/settings/tabs/GeneralTab.jsx

import React, { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Moon, Sun, Globe, Bell } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";

const GeneralTab = () => {
	const { theme, setTheme } = useTheme();
	const [language, setLanguage] = useState("fr");
	const [notifications, setNotifications] = useState(true);

	// Fonction pour changer le thème
	const handleThemeChange = (value) => {
		setTheme(value);
	};

	return (
		<div>
			<h3 className="text-md font-medium mb-5 dark:text-white">
				Préférences
			</h3>

			<div className="space-y-6">
				{/* Paramètres d'apparence */}
				<div>
					<h4 className="text-sm font-medium flex items-center mb-3 dark:text-white">
						<Moon className="h-4 w-4 mr-2" />
						Apparence
					</h4>

					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-sm dark:text-gray-300">
								Thème
							</span>
							<div className="w-32">
								<select
									value={theme}
									onChange={(e) =>
										handleThemeChange(e.target.value)
									}
									className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								>
									<option value="light">Clair</option>
									<option value="dark">Sombre</option>
									<option value="system">Système</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Paramètres de langue */}
				<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
					<h4 className="text-sm font-medium flex items-center mb-3 dark:text-white">
						<Globe className="h-4 w-4 mr-2" />
						Langue et région
					</h4>

					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-sm dark:text-gray-300">
								Langue
							</span>
							<div className="w-32">
								<select
									value={language}
									onChange={(e) =>
										setLanguage(e.target.value)
									}
									className="w-full px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
								>
									<option value="fr">Français</option>
									<option value="en">English</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Paramètres de notifications */}
				<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
					<h4 className="text-sm font-medium flex items-center mb-3 dark:text-white">
						<Bell className="h-4 w-4 mr-2" />
						Notifications
					</h4>

					<div className="space-y-4">
						<div className="flex justify-between items-center">
							<span className="text-sm dark:text-gray-300">
								Notifications de progression
							</span>
							<div className="flex items-center h-5">
								<input
									type="checkbox"
									checked={notifications}
									onChange={() =>
										setNotifications(!notifications)
									}
									className="h-4 w-4 rounded border-gray-300 text-wisetwin-blue focus:ring-wisetwin-blue dark:border-gray-600"
								/>
							</div>
						</div>

						<div className="flex justify-between items-center">
							<span className="text-sm dark:text-gray-300">
								Alertes par email
							</span>
							<div className="flex items-center h-5">
								<input
									type="checkbox"
									checked={notifications}
									onChange={() =>
										setNotifications(!notifications)
									}
									className="h-4 w-4 rounded border-gray-300 text-wisetwin-blue focus:ring-wisetwin-blue dark:border-gray-600"
								/>
							</div>
						</div>
					</div>
				</div>

				{/* Version de l'application */}
				<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
					<div className="flex justify-between items-center">
						<span className="text-sm text-gray-500 dark:text-gray-400">
							Version
						</span>
						<span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
							v1.2.0
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GeneralTab;
