"use client";
import { useState, useEffect } from "react";

export default function TermsAcceptanceModal() {
	const [accepted, setAccepted] = useState(false);

	useEffect(() => {
		// Vérifie si l'utilisateur a déjà accepté les termes
		const hasAccepted = localStorage.getItem("termsAccepted");
		setAccepted(hasAccepted === "true");
	}, []);

	const handleAccept = () => {
		localStorage.setItem("termsAccepted", "true");
		setAccepted(true);
	};

	if (accepted) {
		return null; // Ne rien afficher si l'utilisateur a accepté
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="bg-white p-6 rounded shadow-md max-w-lg mx-2">
				<h2 className="text-xl font-bold mb-4">
					Terms of use and privacy policy
				</h2>
				<p className="mb-4">
					Please read and accept our{" "}
					<a
						href="https://wisetwin.eu/ressources/legals/terms"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-500 underline"
					>
						Conditions of free access
					</a>{" "}
					and our{" "}
					<a
						href="https://wisetwin.eu/ressources/legals/privacy"
						target="_blank"
						rel="noopener noreferrer"
						className="text-blue-500 underline"
					>
						Privacy statment
					</a>
					.
				</p>
				<button
					onClick={handleAccept}
					className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
				>
					I&apos;ve read and accept
				</button>
			</div>
		</div>
	);
}
