// components/wisetrainer/modals/UnenrollModal.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export default function UnenrollModal({
	isOpen,
	onClose,
	onConfirm,
	courseName,
}) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
							<AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
						</div>
						<DialogTitle>
							Se désinscrire de la formation
						</DialogTitle>
					</div>
					<DialogDescription className="pt-2">
						Êtes-vous sûr de vouloir vous désinscrire de{" "}
						<span className="font-medium text-foreground">
							"{courseName}"
						</span>{" "}
						?
					</DialogDescription>
				</DialogHeader>

				<div className="py-3">
					<p className="text-sm text-gray-600 dark:text-gray-300">
						En vous désinscrivant, vous perdrez votre accès à cette
						formation et votre progression sera réinitialisée. Vous
						pourrez vous réinscrire ultérieurement si vous le
						souhaitez.
					</p>
				</div>

				<DialogFooter className="flex flex-row justify-end gap-2">
					<Button variant="outline" onClick={onClose}>
						Annuler
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						Se désinscrire
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
