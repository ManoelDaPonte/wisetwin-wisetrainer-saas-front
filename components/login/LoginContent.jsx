// components/login/LoginContent.jsx
"use client";

import React, { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { LogIn, UserPlus } from "lucide-react";

const LoginContent = () => {
	const { user, error, isLoading } = useUser();
	const router = useRouter();
	const searchParams = useSearchParams();

	// Récupérer le paramètre returnTo de l'URL
	const returnTo = searchParams.get("returnTo");

	useEffect(() => {
		if (user) {
			// Si connecté et returnTo existe, rediriger vers cette destination
			if (returnTo) {
				router.push(returnTo);
			} else {
				// Sinon, rediriger vers la page principale
				router.push("/");
			}
		}
	}, [user, router, returnTo]);

	// Fonction pour gérer le clic sur le bouton de connexion
	const handleLogin = () => {
		// Créer l'URL de connexion avec le paramètre returnTo si présent
		let loginUrl = "/api/auth/login";
		if (returnTo) {
			loginUrl += `?returnTo=${returnTo}`;
		}
		window.location.href = loginUrl;
	};

	// Fonction pour gérer le clic sur le bouton d'inscription
	const handleSignup = () => {
		// Créer l'URL d'inscription avec le paramètre returnTo si présent
		let signupUrl = "/api/auth/signup";
		if (returnTo) {
			signupUrl += `?returnTo=${returnTo}`;
		}
		window.location.href = signupUrl;
	};

	return (
		<div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden">
			{/* Section de gauche: Image de fond et présentation */}
			<div className="w-full md:w-1/2 bg-gradient-to-br from-wisetwin-darkblue to-wisetwin-blue relative p-8 text-white flex flex-col justify-center items-center">
				{/* Motif de fond */}
				<div className="absolute inset-0 z-0 opacity-10">
					<svg
						width="100%"
						height="100%"
						xmlns="http://www.w3.org/2000/svg"
					>
						<defs>
							<pattern
								id="grid"
								width="40"
								height="40"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 40 0 L 0 0 0 40"
									fill="none"
									stroke="white"
									strokeWidth="1"
								/>
							</pattern>
						</defs>
						<rect width="100%" height="100%" fill="url(#grid)" />
					</svg>
				</div>

				{/* Contenu */}
				<div className="relative z-10 max-w-md text-center">
					<div className="mb-6 flex justify-center">
						<div className="relative w-24 h-24 bg-white/10 rounded-full p-4 backdrop-blur-sm">
							<Image
								src="/logos/logo_parrot_light.svg"
								alt="Wise Twin Logo"
								fill
								className="object-contain p-2"
							/>
						</div>
					</div>
					<h1 className="text-4xl font-bold mb-4">
						Bienvenue sur{" "}
						<span className="text-white">
							Wise
							<span className="text-wisetwin-blue-light">
								Twin
							</span>
						</span>
					</h1>
					<p className="text-lg opacity-90 mb-6">
						La plateforme immersive de formation industrielle
					</p>
					<div className="flex flex-wrap justify-center gap-4 text-sm">
						<span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
							Sécurité
						</span>
						<span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
							Formation
						</span>
						<span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
							Immersion
						</span>
						<span className="px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm">
							Excellence
						</span>
					</div>
				</div>
			</div>

			{/* Section de droite: Formulaire de connexion */}
			<div className="w-full md:w-1/2 bg-white dark:bg-wisetwin-darkblue/95 p-8 flex flex-col justify-center items-center">
				<div className="w-full max-w-md">
					<div className="text-center mb-8">
						<h2 className="text-2xl font-bold text-wisetwin-darkblue dark:text-white mb-2">
							Connectez-vous à votre compte
						</h2>
						<p className="text-gray-600 dark:text-gray-300">
							Accédez à vos formations et à vos statistiques
						</p>
					</div>

					<div className="space-y-6">
						<Button
							variant="default"
							size="lg"
							className="w-full bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light text-white dark:bg-wisetwin-blue dark:hover:bg-wisetwin-blue-light flex items-center justify-center"
							onClick={handleLogin}
						>
							<LogIn className="w-5 h-5 mr-2" />
							Se connecter
						</Button>

						<div className="relative flex items-center justify-center">
							<div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
							<span className="mx-4 text-sm text-gray-500 dark:text-gray-400">
								OU
							</span>
							<div className="flex-grow h-px bg-gray-300 dark:bg-gray-700"></div>
						</div>

						<Button
							variant="outline"
							size="lg"
							className="w-full flex items-center justify-center"
							onClick={handleSignup}
						>
							<UserPlus className="w-5 h-5 mr-2" />
							Créer un compte
						</Button>
					</div>

					<div className="mt-8 text-center">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							En vous connectant, vous acceptez nos{" "}
							<a
								href="https://wisetwin.eu/ressources/legals/terms"
								className="text-wisetwin-blue hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								Conditions d'utilisation
							</a>{" "}
							et notre{" "}
							<a
								href="https://wisetwin.eu/ressources/legals/privacy"
								className="text-wisetwin-blue hover:underline"
								target="_blank"
								rel="noopener noreferrer"
							>
								Politique de confidentialité
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginContent;
