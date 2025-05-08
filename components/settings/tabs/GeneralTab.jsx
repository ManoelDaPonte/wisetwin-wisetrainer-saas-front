// components/settings/tabs/GeneralTab.jsx
import React from "react";
import { Moon, Sun, Globe, Mail, Monitor, Tags } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useSettings } from "@/lib/contexts/SettingsContext";

const GeneralTab = () => {
	const { 
		theme, 
		setTheme,
		language,
		setLanguage,
		notifications: trainingAlerts,
		setNotifications: setTrainingAlerts,
		emailAlerts: commercialOffers,
		setEmailAlerts: setCommercialOffers
	} = useSettings();

	// Animation pour la sélection du thème
	const themeVariants = {
		selected: {
			scale: [1, 1.05, 1],
			boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
			transition: { duration: 0.3 }
		}
	};

	// Fonction pour changer le thème
	const handleThemeChange = (value) => {
		setTheme(value);
	};

	return (
		<div className="space-y-8">
			{/* Paramètres d'apparence */}
			<div>
				<div className="flex items-center gap-3 mb-6">
					<div className="p-2 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-full">
						<Sun className="h-5 w-5 text-wisetwin-blue dark:text-wisetwin-light" />
					</div>
					<h3 className="text-lg font-medium">Apparence</h3>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
					<motion.div
						className={`border-2 rounded-xl p-5 flex flex-col items-center space-y-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
							theme === "light"
								? "border-wisetwin-darkblue ring-2 ring-wisetwin-blue/20 bg-wisetwin-blue/5"
								: "border-gray-200 dark:border-gray-700"
						}`}
						onClick={() => handleThemeChange("light")}
						animate={theme === "light" ? "selected" : "idle"}
						variants={themeVariants}
					>
						<div className="h-24 w-24 bg-white border-2 rounded-full shadow-inner flex items-center justify-center">
							<Sun className="h-12 w-12 text-amber-500" />
						</div>
						<span className="font-medium">Clair</span>
						{theme === "light" && <Badge className="bg-wisetwin-darkblue">Actif</Badge>}
					</motion.div>

					<motion.div
						className={`border-2 rounded-xl p-5 flex flex-col items-center space-y-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
							theme === "dark"
								? "border-wisetwin-darkblue ring-2 ring-wisetwin-blue/20 bg-wisetwin-blue/5"
								: "border-gray-200 dark:border-gray-700"
						}`}
						onClick={() => handleThemeChange("dark")}
						animate={theme === "dark" ? "selected" : "idle"}
						variants={themeVariants}
					>
						<div className="h-24 w-24 bg-gray-900 border-2 rounded-full shadow-inner flex items-center justify-center">
							<Moon className="h-12 w-12 text-indigo-400" />
						</div>
						<span className="font-medium">Sombre</span>
						{theme === "dark" && <Badge className="bg-wisetwin-darkblue">Actif</Badge>}
					</motion.div>

					<motion.div
						className={`border-2 rounded-xl p-5 flex flex-col items-center space-y-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all ${
							theme === "system"
								? "border-wisetwin-darkblue ring-2 ring-wisetwin-blue/20 bg-wisetwin-blue/5"
								: "border-gray-200 dark:border-gray-700"
						}`}
						onClick={() => handleThemeChange("system")}
						animate={theme === "system" ? "selected" : "idle"}
						variants={themeVariants}
					>
						<div className="h-24 w-24 bg-gradient-to-br from-gray-100 to-gray-900 border-2 rounded-full shadow-inner flex items-center justify-center">
							<Monitor className="h-12 w-12 text-gray-500" />
						</div>
						<span className="font-medium">Système</span>
						{theme === "system" && <Badge className="bg-wisetwin-darkblue">Actif</Badge>}
					</motion.div>
				</div>
			</div>

			{/* Paramètres de langue */}
			<div>
				<div className="flex items-center gap-3 mb-4">
					<div className="p-2 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-full">
						<Globe className="h-5 w-5 text-wisetwin-blue dark:text-wisetwin-light" />
					</div>
					<h3 className="text-lg font-medium">Langue et région</h3>
				</div>

				<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
					<RadioGroup value={language} onValueChange={setLanguage}>
						<div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
							<RadioGroupItem value="fr" id="fr" />
							<Label htmlFor="fr" className="flex items-center ml-2 cursor-pointer">
								<span className="font-medium">Français</span>
								<Badge variant="outline" className="ml-2">FR</Badge>
							</Label>
						</div>
					</RadioGroup>
				</div>
			</div>

			<Separator />

			{/* Paramètres de notifications */}
			<div>
				<div className="flex items-center gap-3 mb-4">
					<div className="p-2 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-full">
						<Mail className="h-5 w-5 text-wisetwin-blue dark:text-wisetwin-light" />
					</div>
					<h3 className="text-lg font-medium">Préférences emails</h3>
				</div>

				<div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Label htmlFor="commercial-offers" className="cursor-pointer">
								Offres commerciales et nouveautés
							</Label>
						</div>
						<Switch
							id="commercial-offers"
							checked={commercialOffers}
							onCheckedChange={setCommercialOffers}
						/>
					</div>
					
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Label htmlFor="training-alerts" className="cursor-pointer">
								Alertes sur les formations
							</Label>
						</div>
						<Switch
							id="training-alerts"
							checked={trainingAlerts}
							onCheckedChange={setTrainingAlerts}
						/>
					</div>
					
					<p className="text-sm text-muted-foreground">
						Recevez des notifications sur l'avancement de vos
						formations, les échéances, les nouvelles formations
						et les offres promotionnelles.
					</p>
				</div>
			</div>

			{/* Version de l'application */}
			<div className="border-t pt-6">
				<div className="flex justify-between items-center">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-wisetwin-blue/10 dark:bg-wisetwin-blue/20 rounded-full">
							<Tags className="h-4 w-4 text-wisetwin-blue dark:text-wisetwin-light" />
						</div>
						<span className="text-sm text-gray-500 dark:text-gray-400">
							Version
						</span>
					</div>
					<span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300 font-mono">
						v0.1.0
					</span>
				</div>
			</div>
		</div>
	);
};

export default GeneralTab;