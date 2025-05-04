// components/wisetrainer/UnenrollModal.jsx
import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const UnenrollModal = ({ isOpen, onClose, onConfirm, courseName }) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-amber-500" />
						Confirmation de suppression
					</DialogTitle>
					<DialogDescription>
						Êtes-vous sûr de vouloir supprimer{" "}
						<span className="font-medium text-foreground">
							"{courseName}"
						</span>{" "}
						de votre liste ?
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<p>
						Votre progression sera conservée, mais la formation ne
						sera plus visible dans "Mes Formations" et les fichiers seront supprimés 
						de votre espace de stockage. Vous pourrez la réajouter à tout moment depuis le catalogue.
					</p>
				</div>
				<DialogFooter className="sm:justify-between">
					<Button variant="outline" onClick={onClose}>
						Annuler
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						Supprimer
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default UnenrollModal;