// components/organization/AssignMembersToGroupModal.jsx
import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, User, Shield, Crown } from "lucide-react";

export default function AssignMembersToGroupModal({
	isOpen,
	onClose,
	onSubmit,
	group,
	organizationMembers = [],
	currentGroupMembers = [],
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedMembers, setSelectedMembers] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialiser les membres déjà sélectionnés
	useEffect(() => {
		if (isOpen && currentGroupMembers.length > 0) {
			setSelectedMembers(currentGroupMembers.map((member) => member.id));
		} else {
			setSelectedMembers([]);
		}
	}, [isOpen, currentGroupMembers]);

	// Filtrer les membres basés sur le terme de recherche
	const filteredMembers = organizationMembers.filter((member) => {
		return (
			member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			member.email.toLowerCase().includes(searchTerm.toLowerCase())
		);
	});

	const handleToggleMember = (memberId) => {
		setSelectedMembers((prev) => {
			if (prev.includes(memberId)) {
				return prev.filter((id) => id !== memberId);
			} else {
				return [...prev, memberId];
			}
		});
	};

	const handleSubmit = async () => {
		try {
			setIsSubmitting(true);
			await onSubmit({
				groupId: group.id,
				memberIds: selectedMembers,
			});
			// Le parent va gérer la fermeture de la modal
		} catch (error) {
			console.error("Erreur lors de l'assignation des membres:", error);
			setIsSubmitting(false);
		}
	};

	const handleClose = () => {
		setSearchTerm("");
		setSelectedMembers([]);
		setIsSubmitting(false);
		onClose();
	};

	// Fonction pour afficher l'icône du rôle
	const getRoleIcon = (role) => {
		switch (role) {
			case "OWNER":
				return <Crown className="w-4 h-4 text-yellow-500" />;
			case "ADMIN":
				return <Shield className="w-4 h-4 text-blue-500" />;
			default:
				return <User className="w-4 h-4 text-gray-500" />;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<UserPlus className="w-5 h-5" />
						Assigner des membres au groupe
					</DialogTitle>
					<DialogDescription>
						{group && (
							<span>
								Sélectionnez les membres à ajouter au groupe "
								{group.name}"
							</span>
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="py-4">
					{/* Barre de recherche */}
					<div className="relative mb-4">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
						<Input
							placeholder="Rechercher un membre..."
							className="pl-10"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					{/* Liste des membres */}
					<div className="border rounded-md max-h-[300px] overflow-y-auto">
						{filteredMembers.length === 0 ? (
							<div className="p-4 text-center text-gray-500">
								Aucun membre ne correspond à votre recherche
							</div>
						) : (
							filteredMembers.map((member) => (
								<div
									key={member.id}
									className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800"
								>
									<Checkbox
										id={`member-${member.id}`}
										checked={selectedMembers.includes(
											member.id
										)}
										onCheckedChange={() =>
											handleToggleMember(member.id)
										}
										className="mr-3"
									/>
									<Label
										htmlFor={`member-${member.id}`}
										className="flex items-center justify-between w-full cursor-pointer"
									>
										<div className="flex items-center">
											<div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mr-3">
												{member.name
													.charAt(0)
													.toUpperCase()}
											</div>
											<div>
												<div className="font-medium">
													{member.name}
												</div>
												<div className="text-xs text-gray-500">
													{member.email}
												</div>
											</div>
										</div>
										<div className="flex items-center">
											{getRoleIcon(member.role)}
										</div>
									</Label>
								</div>
							))
						)}
					</div>

					<div className="text-sm text-gray-500 mt-2">
						{selectedMembers.length} membre(s) sélectionné(s)
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isSubmitting}
					>
						Annuler
					</Button>
					<Button
						type="button"
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
						onClick={handleSubmit}
						disabled={isSubmitting}
					>
						{isSubmitting ? "Enregistrement..." : "Enregistrer"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
