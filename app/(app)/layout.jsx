//app/(app)/layout.jsx
import { Inter } from "next/font/google";
import Image from "next/image";
import TopNavBar from "@/components/layout/TopNavBar";
import LeftNavBar from "@/components/layout/LeftNavBar";
import TermsAcceptanceModal from "@/components/cookies/TermsAcceptanceModal";
import { DashboardProvider } from "@/lib/contexts/DashboardContext";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { SettingsProvider } from "@/lib/contexts/SettingsContext";
import { Toaster } from "@/components/ui/toaster";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Wise Twin - Plateforme d'apprentissage et de simulation",
	description:
		"Wise Twin - Solutions innovantes pour les jumeaux numériques et la formation en réalité augmentée",
};

export default function RootLayout({ children, pathname }) {
	return (
		<html lang="fr" suppressHydrationWarning>
			<body className={inter.className}>
				{/* Fournisseurs de contexte */}
				<ThemeProvider>
					<SettingsProvider>
						<DashboardProvider>
						<div className="flex h-screen w-screen overflow-hidden">
							{/* Barre de navigation latérale */}
							<LeftNavBar />

							{/* Contenu principal */}
							<div className="flex-1 flex flex-col overflow-hidden">
								{/* Barre de navigation supérieure */}
								<TopNavBar />

								{/* Section de contenu principale avec défilement et fond cohérent */}
								<main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-wisetwin-darkblue/95 relative">
									<div
										className="fixed top-0 bottom-0 right-0 z-0 pointer-events-none flex items-center justify-center opacity-100 dark:opacity-5"
										style={{
											width: "calc(100% - 15rem)",
											left: "15rem",
										}}
									>
										<div className="relative w-4/5 h-4/5">
											<Image
												src="/logos/logo_parrot_light.svg"
												fill
												alt="Wise Twin Background"
												className="object-contain dark:invert-[0.1]"
												priority
											/>
										</div>
									</div>
									<div className="mx-auto w-4/5 max-w-7xl h-full">
										<div className="page-transition h-full relative z-10 py-6">
											{children}
										</div>
									</div>
								</main>
							</div>
						</div>
						<Toaster />
					</DashboardProvider>
						</SettingsProvider>
					</ThemeProvider>

				{/* Modal d'acceptation des termes */}
				<TermsAcceptanceModal />
			</body>
		</html>
	);
}
