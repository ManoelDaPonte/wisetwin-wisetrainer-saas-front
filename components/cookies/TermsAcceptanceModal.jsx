"use client";
import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LockKeyhole, ExternalLink } from "lucide-react";

export default function TermsAcceptanceModal() {
	const [accepted, setAccepted] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		// Vérifie si l'utilisateur a déjà accepté les termes
		const hasAccepted = localStorage.getItem("termsAccepted");
		setAccepted(hasAccepted === "true");
		setOpen(!hasAccepted || hasAccepted !== "true");
	}, []);

	const handleAccept = () => {
		localStorage.setItem("termsAccepted", "true");
		setAccepted(true);
		setOpen(false);
	};

	if (accepted) {
		return null; // Ne rien afficher si l'utilisateur a accepté
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(newOpen) => {
				// Empêcher la fermeture de la modale
				if (open === true && newOpen === false) {
					return;
				}
				setOpen(newOpen);
			}}
		>
			<DialogContent
				className="sm:max-w-md"
				hideCloseButton={true}
				onPointerDownOutside={(e) => e.preventDefault()}
				onEscapeKeyDown={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<div className="flex items-center mb-2">
						<LockKeyhole className="w-5 h-5 text-wisetwin-blue mr-2" />
						<DialogTitle className="text-xl">
							Conditions d'utilisation et confidentialité
						</DialogTitle>
					</div>
					<DialogDescription>
						Avant de continuer, veuillez lire et accepter nos
						conditions d'utilisation et notre politique de
						confidentialité.
					</DialogDescription>
				</DialogHeader>

				<div className="text-sm text-gray-600 dark:text-gray-300 space-y-4">
					<p>
						En utilisant cette plateforme, vous acceptez nos
						conditions de service et notre politique de
						confidentialité concernant la collecte et l'utilisation
						de vos données.
					</p>

					<div className="space-y-2">
						<a
							href="https://wisetwin.eu/ressources/legals/terms"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center text-wisetwin-blue hover:underline"
						>
							<ExternalLink className="w-4 h-4 mr-1" />
							Conditions d'accès gratuit
						</a>

						<a
							href="https://wisetwin.eu/ressources/legals/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center text-wisetwin-blue hover:underline"
						>
							<ExternalLink className="w-4 h-4 mr-1" />
							Politique de confidentialité
						</a>
					</div>
				</div>

				<DialogFooter className="pt-4">
					<Button
						onClick={handleAccept}
						className="w-full bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
					>
						J'ai lu et j'accepte
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
