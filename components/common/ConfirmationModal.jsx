// components/common/ConfirmationModal.jsx
"use client";

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
import { Loader2 } from "lucide-react";

const ConfirmationModal = ({
	title,
	message,
	isVisible,
	onConfirm,
	onCancel,
	confirmText = "Confirmer",
	cancelText = "Annuler",
	isDanger = false,
	isProcessing = false,
}) => {
	return (
		<Dialog open={isVisible} onOpenChange={onCancel}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-end gap-2 mt-4">
					<Button
						variant="outline"
						onClick={onCancel}
						disabled={isProcessing}
					>
						{cancelText}
					</Button>
					<Button
						variant={isDanger ? "destructive" : "default"}
						className={
							isDanger
								? ""
								: "bg-wisetwin-darkblue hover:bg-wisetwin-darkblue-light"
						}
						onClick={onConfirm}
						disabled={isProcessing}
					>
						{isProcessing ? (
							<span className="flex items-center">
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Traitement...
							</span>
						) : (
							confirmText
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationModal;
