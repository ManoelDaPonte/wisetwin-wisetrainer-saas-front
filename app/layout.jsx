"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/lib/contexts/ThemeContext";
import { Toaster } from "@/components/ui/toaster";

// Nouvelle architecture avec Zustand
import { ZustandInitializer } from "@/lib/components/ZustandInitializer";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
	return (
		<html lang="fr" suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeProvider>
					<ZustandInitializer>
						{children}
						<Toaster />
					</ZustandInitializer>
				</ThemeProvider>
			</body>
		</html>
	);
}
