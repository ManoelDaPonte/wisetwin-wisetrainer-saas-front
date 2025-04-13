// components/settings/tabs/GeneralTab.jsx
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Moon, Sun, Globe, Bell, PanelLeft, Monitor, Mail } from "lucide-react";
import { useTheme } from "@/lib/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

const GeneralTab = () => {
	const { theme, setTheme } = useTheme();
	const [language, setLanguage] = useState("fr");
	const [notifications, setNotifications] = useState(true);
	const [emailAlerts, setEmailAlerts] = useState(true);
	const [sidebarCompact, setSidebarCompact] = useState(false);

	// Fonction pour changer le thème
	const handleThemeChange = (value) => {
		setTheme(value);
	};

	return (
		<div className="space-y-8">
			{/* Paramètres d'apparence */}
			<div>
				<h3 className="text-lg font-medium mb-4">Apparence</h3>

				<div className="space-y-4">
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
						<div
							className={`border rounded-lg p-4 flex flex-col items-center space-y-2 cursor-pointer transition-all hover:border-wisetwin-blue ${
								theme === "light"
									? "border-wisetwin-blue bg-wisetwin-blue/5"
									: ""
							}`}
							onClick={() => handleThemeChange("light")}
						>
							<div className="h-20 w-full bg-white border rounded-md flex items-center justify-center">
								<Sun className="h-8 w-8 text-amber-500" />
							</div>
							<span className="font-medium">Clair</span>
						</div>

						<div
							className={`border rounded-lg p-4 flex flex-col items-center space-y-2 cursor-pointer transition-all hover:border-wisetwin-blue ${
								theme === "dark"
									? "border-wisetwin-blue bg-wisetwin-blue/5"
									: ""
							}`}
							onClick={() => handleThemeChange("dark")}
						>
							<div className="h-20 w-full bg-gray-900 border rounded-md flex items-center justify-center">
								<Moon className="h-8 w-8 text-indigo-400" />
							</div>
							<span className="font-medium">Sombre</span>
						</div>

						<div
							className={`border rounded-lg p-4 flex flex-col items-center space-y-2 cursor-pointer transition-all hover:border-wisetwin-blue ${
								theme === "system"
									? "border-wisetwin-blue bg-wisetwin-blue/5"
									: ""
							}`}
							onClick={() => handleThemeChange("system")}
						>
							<div className="h-20 w-full bg-gradient-to-r from-white to-gray-900 border rounded-md flex items-center justify-center">
								<Monitor className="h-8 w-8 text-gray-600" />
							</div>
							<span className="font-medium">Système</span>
						</div>
					</div>
				</div>
			</div>

			{/* Paramètres d'interface */}
			<div>
				<h3 className="text-lg font-medium mb-4">Interface</h3>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<PanelLeft className="h-4 w-4 text-muted-foreground" />
							<Label htmlFor="sidebar-compact">
								Mode compact pour la barre latérale
							</Label>
						</div>
						<Switch
							id="sidebar-compact"
							checked={sidebarCompact}
							onCheckedChange={setSidebarCompact}
						/>
					</div>
					<p className="text-sm text-muted-foreground">
						Lorsque le mode compact est activé, la barre latérale
						n'affichera que les icônes des menus.
					</p>
				</div>
			</div>

			{/* Paramètres de langue */}
			<div>
				<h3 className="text-lg font-medium mb-4">Langue et région</h3>

				<div className="space-y-4">
					<RadioGroup value={language} onValueChange={setLanguage}>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="fr" id="fr" />
							<Label htmlFor="fr" className="flex items-center">
								<span className="font-medium">Français</span>
								<span className="ml-2 text-sm text-muted-foreground">
									(Français)
								</span>
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="en" id="en" />
							<Label htmlFor="en" className="flex items-center">
								<span className="font-medium">English</span>
								<span className="ml-2 text-sm text-muted-foreground">
									(English)
								</span>
							</Label>
						</div>
					</RadioGroup>
				</div>
			</div>

			<Separator />

			{/* Paramètres de notifications */}
			<div>
				<h3 className="text-lg font-medium mb-4">Notifications</h3>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Bell className="h-4 w-4 text-muted-foreground" />
							<Label htmlFor="notifications">
								Notifications dans l'application
							</Label>
						</div>
						<Switch
							id="notifications"
							checked={notifications}
							onCheckedChange={setNotifications}
						/>
					</div>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Mail className="h-4 w-4 text-muted-foreground" />
							<Label htmlFor="email-alerts">
								Alertes par email
							</Label>
						</div>
						<Switch
							id="email-alerts"
							checked={emailAlerts}
							onCheckedChange={setEmailAlerts}
						/>
					</div>
					<p className="text-sm text-muted-foreground">
						Recevez des notifications sur l'avancement de vos
						formations, les échéances et les nouvelles
						fonctionnalités.
					</p>
				</div>
			</div>

			{/* Version de l'application */}
			<div className="border-t pt-6">
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
	);
};

export default GeneralTab;
