// components/settings/tabs/SecurityTab.jsx
import React from "react";
import { AlertCircle, Construction, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SecurityTab() {
	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-medium mb-5">Sécurité du compte</h3>

				<Alert className="mb-6 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
					<Construction className="h-5 w-5 text-amber-600 dark:text-amber-400" />
					<AlertTitle className="text-amber-800 dark:text-amber-300 text-base">Fonctionnalité en développement</AlertTitle>
					<AlertDescription className="text-amber-700 dark:text-amber-300">
						Les fonctionnalités de sécurité sont actuellement en cours de développement 
						et seront bientôt disponibles. Nous travaillons à renforcer la protection 
						de votre compte.
					</AlertDescription>
				</Alert>

				{/* Authentification à deux facteurs */}
				<Card className="mb-6 opacity-60">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
								<ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<div>
								<h4 className="text-base font-medium">Authentification à deux facteurs (MFA)</h4>
								<p className="text-sm text-muted-foreground">
									Ajoutez une couche de sécurité supplémentaire à votre compte
								</p>
							</div>
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex items-start bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
							<AlertCircle className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
							<p className="text-sm text-gray-700 dark:text-gray-300">
								Cette fonctionnalité sera bientôt disponible pour renforcer la sécurité de votre compte.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Section en développement */}
				<div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
					<Construction className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h4 className="text-lg font-medium mb-2">Fonctionnalités de sécurité à venir</h4>
					<p className="text-muted-foreground max-w-md mx-auto">
						Notre équipe travaille actuellement sur de nouvelles fonctionnalités de 
						sécurité, dont l'authentification à deux facteurs, la gestion des sessions, 
						et les alertes de sécurité.
					</p>
				</div>
			</div>
		</div>
	);
}