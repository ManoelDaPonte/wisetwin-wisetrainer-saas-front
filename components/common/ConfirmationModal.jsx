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

const ConfirmationModal = ({
	title,
	message,
	isVisible,
	onConfirm,
	onCancel,
	confirmText = "Confirmer",
	cancelText = "Annuler",
	isDanger = false,
}) => {
	return (
		<Dialog open={isVisible} onOpenChange={onCancel}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{message}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="flex flex-row justify-end gap-2 mt-4">
					<Button variant="outline" onClick={onCancel}>
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
					>
						{confirmText}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ConfirmationModal;
