// app/(auth)/layout.jsx
import { Inter } from "next/font/google";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
	title: "Login - Wise Twin",
	description: "Connectez-vous à la plateforme Wise Twin",
};

export default function AuthLayout({ children }) {
	return (
		<html lang="fr">
			<body className={inter.className}>
				<UserProvider>
					<main className="h-screen w-screen overflow-hidden">
						{children}
					</main>
				</UserProvider>
			</body>
		</html>
	);
}
