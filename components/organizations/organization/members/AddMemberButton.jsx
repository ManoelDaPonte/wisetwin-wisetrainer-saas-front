//components/organizations/organization/members/AddMemberButton.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import AddMemberModal from "./AddMemberModal";

export default function AddMemberButton({ onAddMember }) {
	const [showModal, setShowModal] = useState(false);

	const handleAddMemberSubmit = async (memberData) => {
		const success = await onAddMember(memberData);
		if (success) {
			setShowModal(false);
		}
	};

	return (
		<>
			<Button
				onClick={() => setShowModal(true)}
				className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white"
			>
				<UserPlus className="w-4 h-4 mr-2" />
				Inviter un membre
			</Button>

			{/* Modal d'invitation */}
			{showModal && (
				<AddMemberModal
					isOpen={showModal}
					onClose={() => setShowModal(false)}
					onSubmit={handleAddMemberSubmit}
				/>
			)}
		</>
	);
}
