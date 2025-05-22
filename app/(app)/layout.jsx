import Image from "next/image";
import TopNavBar from "@/components/layout/TopNavBar";
import LeftNavBar from "@/components/layout/LeftNavBar";
import TermsAcceptanceModal from "@/components/cookies/TermsAcceptanceModal";
import { SettingsProvider } from "@/lib/contexts/SettingsContext";
import {
	SidebarProvider,
	SidebarTrigger,
	SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

export const metadata = {
	title: "Wise Twin - Plateforme d'apprentissage et de simulation",
	description:
		"Wise Twin - Solutions innovantes pour les jumeaux numériques et la formation en réalité augmentée",
};

export default function AppLayout({ children, pathname }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 px-4">
					<SidebarTrigger className="-ml-1" />
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min relative">
						<div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-100 dark:opacity-5">
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
						<div className="relative z-10 p-6">
							<div className="page-transition">{children}</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
