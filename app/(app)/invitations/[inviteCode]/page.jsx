// app/invitations/[inviteCode]/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0";
import { useToast } from "@/lib/hooks/useToast";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	AlertCircle,
	CheckCircle,
	XCircle,
	LogIn,
	Mail,
	Clock,
} from "lucide-react";
import Image from "next/image";

export default function InvitationPage() {
	const router = useRouter();
	const params = useParams();
	const { user, isLoading: userLoading, error: userError } = useUser();
	const { toast } = useToast();
	const [invitation, setInvitation] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState(null);
	const [processingStatus, setProcessingStatus] = useState(null);
	const inviteCode = params?.inviteCode;

	// Charger les détails de l'invitation
	useEffect(() => {
		if (inviteCode) {
			fetchInvitationDetails();
		}
	}, [inviteCode]);

	const fetchInvitationDetails = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await axios.get(`/api/invitations/${inviteCode}`);

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
	};

	// Accepter l'invitation
	const handleAcceptInvitation = async () => {
		if (!user) {
			// Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
			// Sauvegarder l'URL actuelle pour rediriger vers cette page après la connexion
			const returnUrl = encodeURIComponent(window.location.pathname);
			router.push(`/auth/login?returnTo=${returnUrl}`);
			return;
		}

		try {
			setIsProcessing(true);
			setProcessingStatus("Traitement de l'invitation en cours...");

			const response = await axios.post(`/api/invitations/${inviteCode}`);

			if (response.data.success) {
				setProcessingStatus("Invitation acceptée avec succès!");
				toast({
					title: "Invitation acceptée",
					description: "Vous avez rejoint l'organisation avec succès",
					variant: "success",
				});

				// Rediriger vers la page de l'organisation après un court délai
				setTimeout(() => {
					router.push(`/organization/${invitation.organization.id}`);
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
	const handleDeclineInvitation = () => {
		router.push("/organization");
	};

	// Formater les dates
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		});
	};

	// Vérifier si l'invitation est expirée
	const isExpired = invitation && new Date() > new Date(invitation.expiresAt);

	// Afficher un état de chargement
	if (isLoading) {
		return (
			<div className="container mx-auto max-w-md py-16">
				<div className="animate-pulse">
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-6"></div>
					<div className="h-64 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
					<div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
				</div>
			</div>
		);
	}

	// Afficher un message d'erreur si l'invitation n'est pas trouvée
	if (error || !invitation) {
		return (
			<div className="container mx-auto max-w-md py-16">
				<Card className="w-full">
					<CardHeader className="text-center">
						<XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
						<CardTitle>Invitation non valide</CardTitle>
						<CardDescription>
							{error ||
								"Cette invitation n'est pas valide ou a expiré."}
						</CardDescription>
					</CardHeader>
					<CardFooter className="flex justify-center">
						<Button onClick={() => router.push("/organization")}>
							Retour aux organisations
						</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-md py-16">
			<Card className="w-full">
				<CardHeader className="text-center">
					<div className="mx-auto bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-4 w-16 h-16 flex items-center justify-center">
						<Mail className="w-8 h-8 text-wisetwin-blue" />
					</div>
					<CardTitle>
						Invitation à rejoindre une organisation
					</CardTitle>
					<CardDescription>
						Vous avez été invité(e) à rejoindre une organisation sur
						WiseTwin
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{processingStatus && (
						<div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md mb-4 text-center">
							<p className="text-blue-700 dark:text-blue-300 flex items-center justify-center">
								<span className="animate-spin mr-2">⟳</span>{" "}
								{processingStatus}
							</p>
						</div>
					)}

					{isExpired && !isProcessing && (
						<div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
							<div className="flex items-start">
								<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
								<p className="text-red-700 dark:text-red-300">
									Cette invitation a expiré. Veuillez demander
									une nouvelle invitation.
								</p>
							</div>
						</div>
					)}

					{invitation.status !== "PENDING" && !isProcessing && (
						<div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4">
							<div className="flex items-start">
								<AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
								<p className="text-yellow-700 dark:text-yellow-300">
									Cette invitation a déjà été{" "}
									{invitation.status === "ACCEPTED"
										? "acceptée"
										: "refusée"}
									.
								</p>
							</div>
						</div>
					)}

					<div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
						<h3 className="font-semibold text-lg">
							Détails de l'invitation
						</h3>

						<div className="mt-4 space-y-2">
							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Organisation:
								</span>
								<span className="font-medium">
									{invitation.organization.name}
								</span>
							</div>

							{invitation.organization.description && (
								<div className="flex justify-between">
									<span className="text-gray-600 dark:text-gray-400">
										Description:
									</span>
									<span className="font-medium">
										{invitation.organization.description}
									</span>
								</div>
							)}

							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Rôle:
								</span>
								<span className="font-medium">
									{invitation.role === "ADMIN"
										? "Administrateur"
										: "Membre"}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Email:
								</span>
								<span className="font-medium">
									{invitation.email}
								</span>
							</div>

							<div className="flex justify-between">
								<span className="text-gray-600 dark:text-gray-400">
									Expire le:
								</span>
								<span className="font-medium flex items-center">
									<Clock className="w-4 h-4 mr-1 text-gray-400" />
									{formatDate(invitation.expiresAt)}
								</span>
							</div>
						</div>
					</div>

					{/* Afficher un avertissement si l'email de l'utilisateur connecté ne correspond pas */}
					{user && user.name !== invitation.email && (
						<div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
							<div className="flex items-start">
								<AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
								<div>
									<p className="text-yellow-700 dark:text-yellow-300">
										Cette invitation est destinée à{" "}
										{invitation.email}, mais vous êtes
										connecté avec {user.name}.
									</p>
									<p className="text-yellow-700 dark:text-yellow-300 mt-1">
										Veuillez vous connecter avec le bon
										compte pour accepter cette invitation.
									</p>
									<Button
										variant="outline"
										size="sm"
										className="mt-2"
										onClick={() =>
											router.push("/auth/logout")
										}
									>
										Se déconnecter
									</Button>
								</div>
							</div>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex gap-4 justify-between">
					<Button
						variant="outline"
						onClick={handleDeclineInvitation}
						disabled={isProcessing}
						className="flex-1"
					>
						Décliner
					</Button>
					<Button
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white flex-1"
						onClick={handleAcceptInvitation}
						disabled={
							isProcessing ||
							isExpired ||
							invitation.status !== "PENDING" ||
							(user && user.name !== invitation.email)
						}
					>
						{!user ? (
							<>
								<LogIn className="w-4 h-4 mr-2" />
								Se connecter pour accepter
							</>
						) : (
							<>
								<CheckCircle className="w-4 h-4 mr-2" />
								Accepter l'invitation
							</>
						)}
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
