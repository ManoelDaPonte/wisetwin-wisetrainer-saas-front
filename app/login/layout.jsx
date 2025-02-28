// app/login/layout.jsx
import React from "react";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function LoginLayout({ children }) {
	return (
		<html lang="fr">
			<body className={inter.className}>
				{/* Conteneur principal sans limitations ni décorations */}
				<main className="h-screen w-screen overflow-hidden">
					{children}
				</main>
			</body>
		</html>
	);
}
