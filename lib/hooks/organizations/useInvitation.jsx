// lib/hooks/organizations/useInvitation.jsx
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0";
import { useToast } from "@/lib/hooks/useToast";

export function useInvitation(inviteCode) {
	const router = useRouter();
	const { user, isLoading: userLoading } = useUser();
	const { toast } = useToast();

	const [invitation, setInvitation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState(null);
	const [processingStatus, setProcessingStatus] = useState(null);

	// Charger les détails de l'invitation
	const fetchInvitationDetails = useCallback(async () => {
		if (!inviteCode) return;

		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(
				`/api/organizations/invitations/${inviteCode}`
			);

			if (response.data.invitation) {
				setInvitation(response.data.invitation);
			} else {
				setError("L'invitation n'a pas pu être trouvée");
			}
		} catch (error) {
			console.error("Erreur lors du chargement de l'invitation:", error);
			setError(
				error.response?.data?.error ||
					"L'invitation n'a pas pu être chargée"
			);
		} finally {
			setIsLoading(false);
		}
	}, [inviteCode]);

	// Accepter l'invitation
	const acceptInvitation = async () => {
		if (!user) {
			// Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
			const returnUrl = encodeURIComponent(window.location.pathname);
			router.push(`/auth/login?returnTo=${returnUrl}`);
			return;
		}

		try {
			setIsProcessing(true);
			setProcessingStatus("Traitement de l'invitation en cours...");

			const response = await axios.post(
				`/api/organizations/invitations/${inviteCode}`
			);

			if (response.data.success) {
				setProcessingStatus("Invitation acceptée avec succès!");
				toast({
					title: "Invitation acceptée",
					description: "Vous avez rejoint l'organisation avec succès",
					variant: "success",
				});

				// Rediriger vers la page de l'organisation après un court délai
				setTimeout(() => {
					router.push(
						`/organizations/${response.data.organizationId}`
					);
				}, 2000);
			} else {
				throw new Error(
					response.data.error ||
						"Échec de l'acceptation de l'invitation"
				);
			}
		} catch (error) {
			console.error(
				"Erreur lors de l'acceptation de l'invitation:",
				error
			);
			setProcessingStatus(null);
			setError(
				error.response?.data?.error ||
					"Échec de l'acceptation de l'invitation"
			);
			toast({
				title: "Erreur",
				description:
					error.response?.data?.error ||
					"Impossible d'accepter l'invitation",
				variant: "destructive",
			});
		} finally {
			setIsProcessing(false);
		}
	};

	// Refuser l'invitation (simplement rediriger vers la page des organisations)
	const declineInvitation = () => {
		router.push("/organizations");
	};

	// Charger les détails de l'invitation au montage
	useEffect(() => {
		if (inviteCode) {
			fetchInvitationDetails();
		}
	}, [inviteCode, fetchInvitationDetails]);

	// Calculer les états dérivés
	const isExpired = invitation && new Date() > new Date(invitation.expiresAt);
	const isEmailMismatch =
		user &&
		invitation &&
		user.email.toLowerCase() !== invitation.email.toLowerCase();
	const isPending = invitation && invitation.status === "PENDING";

	return {
		invitation,
		isLoading,
		isProcessing,
		error,
		processingStatus,
		isExpired,
		isEmailMismatch,
		isPending,
		acceptInvitation,
		declineInvitation,
		fetchInvitationDetails,

		// Helpers pour la page
		canAccept:
			invitation &&
			!isExpired &&
			isPending &&
			!isEmailMismatch &&
			!isProcessing,
	};
}
