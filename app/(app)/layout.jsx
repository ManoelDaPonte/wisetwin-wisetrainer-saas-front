//app/(app)/layout.jsx
import { Inter } from "next/font/google";
import Image from "next/image";
import TopNavBar from "@/components/layout/TopNavBar";
import LeftNavBar from "@/components/layout/LeftNavBar";
import TermsAcceptanceModal from "@/components/cookies/TermsAcceptanceModal";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { DashboardProvider } from "@/lib/contexts/DashboardContext";
import { Toaster } from "@/components/ui/toaster";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Wise Twin - Plateforme d'apprentissage et de simulation",
	description:
		"Wise Twin - Solutions innovantes pour les jumeaux numériques et la formation en réalité augmentée",
};

export default function RootLayout({ children, pathname }) {
	// Vérifier si nous sommes sur la page de login
	const isLoginPage = pathname === "/login";

	return (
		<html lang="fr">
			<body className={inter.className}>
				{/* Fournisseurs de contexte */}
				<UserProvider>
					<DashboardProvider>
						{isLoginPage ? (
							// Si c'est la page de login, afficher uniquement le contenu
							<main className="h-screen w-screen overflow-hidden">
								{children}
							</main>
						) : (
							// Sinon, afficher la mise en page complète
							<div className="flex h-screen w-screen overflow-hidden">
								{/* Barre de navigation latérale */}
								<LeftNavBar />

								{/* Contenu principal */}
								<div className="flex-1 flex flex-col overflow-hidden">
									{/* Barre de navigation supérieure */}
									<TopNavBar />

									{/* Section de contenu principale avec défilement et fond cohérent */}
									<main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-wisetwin-darkblue/95 relative">
										{/* Logo en arrière-plan */}
										<div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-100">
											<div className="relative w-4/5 h-4/5">
												<Image
													src="/logos/logo_parrot_white.svg"
													fill
													alt="Wise Twin Background"
													className="object-contain"
													priority
												/>
											</div>
										</div>
										{/* Conteneur principal limité à 80% de la largeur et centré, mais sans overflow propre */}
										<div className="mx-auto w-4/5 max-w-7xl h-full">
											<div className="page-transition h-full relative z-10 py-6">
												{children}
											</div>
										</div>
									</main>
								</div>
							</div>
						)}
						<Toaster />
					</DashboardProvider>
				</UserProvider>

				{/* Modal d'acceptation des termes */}
				{!isLoginPage && <TermsAcceptanceModal />}
			</body>
		</html>
	);
}
