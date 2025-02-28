// components/login/LoginContent.jsx
"use client";

import React, { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const LoginContent = () => {
	const { user, error, isLoading } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push("/"); // Redirection vers la page principale après connexion
		}
	}, [user, router]);

	return (
		<div className="flex flex-col md:flex-row min-h-screen w-full">
			{/* Section de gauche : Informations sur l'application */}
			<div className="w-full md:w-1/2 bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white flex flex-col justify-center items-center">
				<Image
					src="/logos/logo_parrot_white.svg"
					alt="Wise Twin Logo"
					width={100}
					height={100}
					className="mb-6"
				/>
				<h1 className="text-4xl font-bold mb-4">
					Bienvenue sur Wise Twin
				</h1>
				<p className="text-lg text-center px-4">
					La plateforme ultime pour gérer vos jumeaux numériques.
					Veuillez vous connecter pour continuer.
				</p>
			</div>
			{/* Section de droite : Boutons de connexion et d'inscription */}
			<div className="w-full md:w-1/2 bg-white p-8 flex flex-col justify-center items-center">
				<h2 className="text-2xl font-semibold mb-6">
					Connectez-vous à votre compte
				</h2>
				<div className="w-full max-w-sm">
					<Button
						variant="default"
						size="lg"
						className="w-full mb-4 text-white bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light"
						onClick={() =>
							(window.location.href = "/api/auth/login")
						}
					>
						Connexion
					</Button>
					<div className="flex items-center my-4">
						<hr className="flex-grow border-gray-300" />
						<span className="mx-2 text-gray-400">OU</span>
						<hr className="flex-grow border-gray-300" />
					</div>
					<Button
						variant="outline"
						size="lg"
						className="w-full"
						onClick={() =>
							(window.location.href = "/api/auth/signup")
						}
					>
						Inscription
					</Button>
				</div>
			</div>
		</div>
	);
};

export default LoginContent;
