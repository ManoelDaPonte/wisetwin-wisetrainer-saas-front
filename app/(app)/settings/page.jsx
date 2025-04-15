//app/(app)/settings/page.jsx
"use client";
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, User, CreditCard, Palette, Shield } from "lucide-react";

// Import des onglets
import GeneralTab from "@/components/settings/tabs/GeneralTab";
import AccountTab from "@/components/settings/tabs/AccountTab";
import SubscriptionTab from "@/components/settings/tabs/SubscriptionTab";
import SecurityTab from "@/components/settings/tabs/SecurityTab";

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("preferences");

	return (
		<div className="container mx-auto py-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
					Paramètres
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					Gérez votre compte, vos préférences et vos abonnements
				</p>
			</div>

			<Tabs
				defaultValue="preferences"
				value={activeTab}
				onValueChange={setActiveTab}
				className="w-full"
			>
				<div className="mb-8">
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
							<Shield className="h-4 w-4 mr-2" />
							Sécurité
						</TabsTrigger>
						<TabsTrigger value="subscription">
							<CreditCard className="h-4 w-4 mr-2" />
							Abonnement
						</TabsTrigger>
					</TabsList>
				</div>

				<div className="mt-6">
					<TabsContent value="preferences">
						<Card>
							<CardContent className="pt-6">
								<GeneralTab />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="account">
						<Card>
							<CardContent className="pt-6">
								<AccountTab />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="security">
						<Card>
							<CardContent className="pt-6">
								<SecurityTab />
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="subscription">
						<SubscriptionTab />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
