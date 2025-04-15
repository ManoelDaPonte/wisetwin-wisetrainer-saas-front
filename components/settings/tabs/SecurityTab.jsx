// components/settings/tabs/SecurityTab.jsx
import React, { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
	Shield,
	Smartphone,
	Key,
	AlertCircle,
	CheckCircle,
	Lock,
	MailCheck,
} from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function SecurityTab() {
	const { user } = useUser();
	const [mfaEnabled, setMfaEnabled] = useState(false);
	const [showMfaSetup, setShowMfaSetup] = useState(false);

	const toggleMfa = () => {
		if (!mfaEnabled) {
			setShowMfaSetup(true);
		} else {
			setMfaEnabled(false);
			setShowMfaSetup(false);
		}
	};

	const handleSetupMfa = () => {
		// Simuler l'activation de la MFA
		setMfaEnabled(true);
		setShowMfaSetup(false);
	};

	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-medium mb-5">Sécurité du compte</h3>

				{/* Authentification à deux facteurs */}
				<Card>
					<CardHeader className="pb-2">
						<div className="flex items-start justify-between">
							<div className="flex gap-2">
								<div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
									<Smartphone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<CardTitle className="text-base">
										Authentification à deux facteurs (MFA)
									</CardTitle>
									<CardDescription>
										Ajoutez une couche de sécurité
										supplémentaire à votre compte
									</CardDescription>
								</div>
							</div>
							<Switch
								checked={mfaEnabled}
								onCheckedChange={toggleMfa}
							/>
						</div>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							L'authentification à deux facteurs ajoute une couche
							de protection supplémentaire en exigeant une
							vérification via votre application
							d'authentification en plus de votre mot de passe.
						</p>

						{showMfaSetup && (
							<div className="mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
								<h4 className="font-medium mb-2 flex items-center gap-2">
									<Key className="h-4 w-4 text-amber-500" />
									Configuration de l'authentification à deux
									facteurs
								</h4>
								<ol className="space-y-3 text-sm">
									<li className="flex items-start gap-2">
										<div className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 mt-0.5 text-xs">
											1
										</div>
										<p>
											Téléchargez une application
											d'authentification sur votre
											téléphone (Google Authenticator,
											Authy, etc.)
										</p>
									</li>
									<li className="flex items-start gap-2">
										<div className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 mt-0.5 text-xs">
											2
										</div>
										<p>
											Scannez le code QR ci-dessous avec
											votre application d'authentification
										</p>
									</li>
									<li className="flex items-start gap-2">
										<div className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 mt-0.5 text-xs">
											3
										</div>
										<p>
											Entrez le code à 6 chiffres généré
											par votre application dans le champ
											ci-dessous
										</p>
									</li>
								</ol>

								<div className="flex justify-center my-4">
									<div className="bg-white p-4 rounded-lg border">
										<div className="w-40 h-40 bg-gray-200 flex items-center justify-center text-gray-500">
											Code QR
										</div>
									</div>
								</div>

								<div className="flex justify-end">
									<Button
										onClick={handleSetupMfa}
										className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
									>
										Activer l'authentification à deux
										facteurs
									</Button>
								</div>
							</div>
						)}

						{mfaEnabled && (
							<div className="flex items-start bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
								<CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
								<p className="text-sm text-green-700 dark:text-green-300">
									L'authentification à deux facteurs est
									activée. Votre compte est mieux protégé
									contre les accès non autorisés.
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Notifications de sécurité */}
			<div className="border-t pt-6">
				<h3 className="text-lg font-medium mb-4">
					Notifications de sécurité
				</h3>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Lock className="h-4 w-4 text-muted-foreground" />
							<Label
								htmlFor="login-alerts"
								className="cursor-pointer"
							>
								Alertes de connexion suspectes
							</Label>
						</div>
						<Switch id="login-alerts" defaultChecked />
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<MailCheck className="h-4 w-4 text-muted-foreground" />
							<Label
								htmlFor="security-email"
								className="cursor-pointer"
							>
								Emails de sécurité importants
							</Label>
						</div>
						<Switch id="security-email" defaultChecked />
					</div>
				</div>
			</div>
		</div>
	);
}
