"use client";
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { User, Palette, Shield } from "lucide-react";
import { useSettings } from "@/lib/contexts/SettingsContext";
import GeneralTab from "@/components/settings/tabs/GeneralTab";
import AccountTab from "@/components/settings/tabs/AccountTab";
import SecurityTab from "@/components/settings/tabs/SecurityTab";

/**
 * Composant principal des paramètres
 * Affiche une interface modulaire pour gérer les paramètres utilisateur
 *
 * @returns {JSX.Element} Composant SettingsPanel
 */
const SettingsPanel = () => {
	const { activeTab, setActiveTab, isLoading } = useSettings();

	// Animation pour les éléments qui apparaissent
	const fadeInAnimation = {
		initial: { opacity: 0, y: 10 },
		animate: { opacity: 1, y: 0 },
		transition: { duration: 0.3 },
	};

	return (
		<motion.div
			className="container mx-auto py-8"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* En-tête */}
			<motion.div className="mb-8" {...fadeInAnimation}>
				<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
					Paramètres
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					Gérez votre compte, vos préférences et la sécurité
				</p>
			</motion.div>

			{/* Système d'onglets */}
			<Tabs
				defaultValue="preferences"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<motion.div
					className="mb-8"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<TabsList className="mb-0">
						<TabsTrigger value="preferences">
							<Palette className="h-4 w-4 mr-2" />
							Générale
						</TabsTrigger>
						<TabsTrigger value="account">
							<User className="h-4 w-4 mr-2" />
							Mon compte
						</TabsTrigger>
						<TabsTrigger value="security">
							<Shield className="h-4 w-4 mr-2 rounded-full" />
							Sécurité
						</TabsTrigger>
					</TabsList>
				</motion.div>

				{/* Contenu des onglets avec états de chargement */}
				<motion.div
					className="mt-6"
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.2 }}
				>
					{isLoading ? (
						<div className="flex justify-center items-center py-20">
							<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wisetwin-blue"></div>
						</div>
					) : (
						<>
							<TabsContent value="preferences">
								<Card noPaddingTop>
									<CardContent className="pt-6">
										<GeneralTab />
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="account">
								<Card noPaddingTop>
									<CardContent className="pt-6">
										<AccountTab />
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="security">
								<Card noPaddingTop>
									<CardContent className="pt-6">
										<SecurityTab />
									</CardContent>
								</Card>
							</TabsContent>
						</>
					)}
				</motion.div>
			</Tabs>
		</motion.div>
	);
};

export default SettingsPanel;
