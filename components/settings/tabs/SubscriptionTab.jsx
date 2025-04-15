// components/settings/tabs/SubscriptionTab.jsx
import React from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Check,
	X,
	CreditCard,
	Building,
	AlertCircle,
	Phone,
	Users,
	Wrench,
	Clock,
	Calendar,
} from "lucide-react";

export default function SubscriptionTab() {
	// Données fictives pour l'abonnement - à remplacer par des données réelles
	const plans = [
		{
			id: "free",
			name: "Gratuit",
			description: "Pour les particuliers et les petites équipes",
			price: "0€",
			period: "pour toujours",
			current: true,
			popular: false,
			features: [
				{ text: "1 organisation", included: true },
				{ text: "Jusqu'à 5 utilisateurs", included: true },
				{ text: "Accès aux formations de base", included: true },
				{ text: "Suivi de progression individuel", included: true },
				{ text: "Rapports basiques", included: true },
				{ text: "Modifications des formations 3D", included: false },
				{ text: "Support standard", included: true },
			],
			cta: "Plan actuel",
			ctaVariant: "outline",
			disabled: true,
		},
		{
			id: "business",
			name: "Business",
			description: "Pour les entreprises avec des besoins spécifiques",
			price: "200€",
			period: "par mois",
			current: false,
			popular: true,
			features: [
				{ text: "1 organisation", included: true },
				{ text: "Jusqu'à 100 utilisateurs", included: true },
				{ text: "Accès à toutes les formations", included: true },
				{ text: "Suivi de progression avancé", included: true },
				{ text: "Rapports détaillés et exports", included: true },
				{ text: "Modifications des formations 3D", included: true },
				{ text: "Support prioritaire", included: true },
			],
			cta: "Passer à Business",
			ctaVariant: "default",
			disabled: false,
		},
		{
			id: "enterprise",
			name: "Enterprise",
			description:
				"Pour les grandes organisations avec des besoins complexes",
			price: "Sur devis",
			period: "",
			current: false,
			popular: false,
			features: [
				{ text: "Organisations illimitées", included: true },
				{ text: "Utilisateurs illimités", included: true },
				{ text: "Accès à toutes les formations", included: true },
				{ text: "Analyses avancées et BI", included: true },
				{ text: "Intégrations personnalisées", included: true },
				{
					text: "Modifications illimitées des formations 3D",
					included: true,
				},
				{
					text: "Support VIP et gestionnaire de compte dédié",
					included: true,
				},
			],
			cta: "Contactez-nous",
			ctaVariant: "outline",
			disabled: false,
			contact: true,
		},
	];

	// Utilisateur fictif pour la démo - à remplacer par des données réelles
	const userSubscription = {
		plan: "free",
		startDate: "2024-12-01",
		renewalDate: "2025-12-01",
		status: "active",
	};

	// Formatage de date pour l'affichage
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	return (
		<div className="space-y-8">
			{/* Statut actuel de l'abonnement */}
			<div>
				<h3 className="text-lg font-medium mb-4">Votre abonnement</h3>

				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col md:flex-row justify-between gap-6">
							<div>
								<h4 className="text-xl font-bold mb-1">
									{plans.find(
										(p) => p.id === userSubscription.plan
									)?.name || "Gratuit"}
								</h4>
								<p className="text-muted-foreground">
									Plan actif depuis le{" "}
									{formatDate(userSubscription.startDate)}
								</p>

								<div className="flex items-center gap-2 mt-4">
									<Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
										{userSubscription.status === "active"
											? "Actif"
											: "Inactif"}
									</Badge>

									{userSubscription.plan !== "free" && (
										<div className="flex items-center gap-1 text-sm">
											<Calendar className="w-4 h-4 text-muted-foreground" />
											<span>
												Renouvellement le{" "}
												{formatDate(
													userSubscription.renewalDate
												)}
											</span>
										</div>
									)}
								</div>
							</div>

							<div>
								<Button variant="outline">
									Gérer mon abonnement
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Comparaison des plans */}
			<div>
				<h3 className="text-lg font-medium mb-4">Plans disponibles</h3>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{plans.map((plan) => (
						<Card
							key={plan.id}
							className={`flex flex-col ${
								plan.popular
									? "border-wisetwin-blue shadow-md"
									: ""
							}`}
						>
							{plan.popular && (
								<div className="bg-wisetwin-blue text-white text-center py-1 text-sm font-medium">
									Recommandé
								</div>
							)}

							<CardHeader>
								<CardTitle>{plan.name}</CardTitle>
								<CardDescription>
									{plan.description}
								</CardDescription>

								<div className="mt-4">
									<span className="text-3xl font-bold">
										{plan.price}
									</span>
									{plan.period && (
										<span className="text-muted-foreground text-sm ml-1">
											{plan.period}
										</span>
									)}
								</div>
							</CardHeader>

							<CardContent className="flex-grow">
								<ul className="space-y-3">
									{plan.features.map((feature, index) => (
										<li
											key={index}
											className="flex items-start"
										>
											{feature.included ? (
												<Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
											) : (
												<X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
											)}
											<span>{feature.text}</span>
										</li>
									))}
								</ul>
							</CardContent>

							<CardFooter>
								<Button
									variant={plan.ctaVariant}
									className={`w-full ${
										plan.ctaVariant === "default"
											? "bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
											: ""
									}`}
									disabled={plan.disabled}
									onClick={() =>
										plan.contact
											? (window.location.href =
													"mailto:contact@wisetwin.eu")
											: null
									}
								>
									{plan.contact && (
										<Phone className="w-4 h-4 mr-2" />
									)}
									{plan.cta}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</div>

			{/* Informations sur les fonctionnalités des plans */}
			<div>
				<h3 className="text-lg font-medium mb-4">Ce qui est inclus</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<Building className="w-5 h-5 text-wisetwin-blue" />
								<CardTitle className="text-base">
									Organisations
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Les organisations vous permettent de regrouper
								des utilisateurs et de gérer les accès aux
								formations. Chaque plan offre un nombre
								différent d'organisations que vous pouvez créer
								et gérer.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<Users className="w-5 h-5 text-wisetwin-blue" />
								<CardTitle className="text-base">
									Utilisateurs
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Chaque plan a une limite différente sur le
								nombre d'utilisateurs que vous pouvez ajouter à
								votre organisation. Les utilisateurs peuvent
								être assignés à des formations et suivre leur
								progression.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<Wrench className="w-5 h-5 text-wisetwin-blue" />
								<CardTitle className="text-base">
									Modification des formations 3D
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Les plans payants vous permettent de
								personnaliser les formations 3D pour les adapter
								à vos besoins spécifiques, incluant
								l'environnement, les scénarios et les
								équipements.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<div className="flex items-center gap-2">
								<Clock className="w-5 h-5 text-wisetwin-blue" />
								<CardTitle className="text-base">
									Support
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground">
								Tous les plans incluent un support, mais les
								niveaux de service varient. Les plans supérieurs
								offrent un support prioritaire et des temps de
								réponse plus rapides.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Besoin d'aide */}
			<Card className="bg-gray-50 dark:bg-gray-800">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2">
						<AlertCircle className="w-5 h-5 text-wisetwin-blue" />
						Besoin d'aide pour choisir ?
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground mb-4">
						Notre équipe est disponible pour vous aider à choisir le
						plan qui correspond le mieux à vos besoins. N'hésitez
						pas à nous contacter pour une consultation.
					</p>
					<Button variant="outline">Contacter les ventes</Button>
				</CardContent>
			</Card>
		</div>
	);
}
