"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import CourseDetail from "@/components/wisetrainer/CourseDetail";
import Spinner from "@/components/common/Spinner";
import { useToast } from "@/lib/hooks/useToast";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/newlib/hooks/useOrganization";
import { useUser } from "@/newlib/hooks/useUser";

export default function CourseDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isCheckingAccess, setIsCheckingAccess] = useState(true);
	const [loadingError, setLoadingError] = useState(null);

	// Récupérer le contexte actif depuis localStorage
	const getActiveContext = () => {
		if (typeof window !== 'undefined') {
			const contextStr = localStorage.getItem('wisetwin-active-context');
			if (contextStr) {
				try {
					const context = JSON.parse(contextStr);
					return context;
				} catch (e) {
					console.error('Erreur parsing contexte:', e);
					return null;
				}
			}
		}
		return null;
	};
	
	const activeContext = getActiveContext();

	// Utiliser les hooks appropriés selon le contexte
	const { user } = useUser();
	const { 
		currentOrganization,
		verifyMembership,
		isLoading: isLoadingOrg
	} = useOrganization({ autoLoad: activeContext?.type === 'organization' });

	useEffect(() => {
		async function checkAccess() {
			try {
				setIsCheckingAccess(true);

				// Si on est en contexte personnel, autoriser directement
				if (activeContext?.type !== 'organization') {
					setIsAuthorized(true);
					return;
				}

				// Si on est en contexte organisation, vérifier l'appartenance
				if (currentOrganization) {
					const { isMember } = await verifyMembership();
					
					if (isMember) {
						setIsAuthorized(true);
					} else {
						setLoadingError("Vous n'êtes pas autorisé à accéder à cette formation.");
						toast({
							title: "Accès refusé",
							description: "Vous n'êtes pas membre de cette organisation.",
							variant: "destructive",
						});
						router.push("/wisetrainer");
					}
				} else {
					// Pas d'organisation sélectionnée en contexte organisation
					setLoadingError("Aucune organisation sélectionnée.");
					toast({
						title: "Erreur",
						description: "Veuillez sélectionner une organisation.",
						variant: "destructive",
					});
					router.push("/wisetrainer");
				}
			} catch (error) {
				console.error("Erreur lors de la vérification d'accès:", error);
				setLoadingError("Impossible de vérifier vos droits d'accès.");
				toast({
					title: "Erreur d'accès",
					description: "Impossible de vérifier vos droits d'accès.",
					variant: "destructive",
				});
				router.push("/wisetrainer");
			} finally {
				setIsCheckingAccess(false);
			}
		}

		// Attendre que les données soient chargées avant de vérifier l'accès
		if (!isLoadingOrg && user) {
			checkAccess();
		}
	}, [activeContext, currentOrganization, router, toast, verifyMembership, isLoadingOrg, user]);

	// Si en cours de chargement, afficher le spinner
	if (isLoadingOrg || isCheckingAccess || !user) {
		return (
			<div className="container mx-auto py-8 h-[70vh]">
				<Spinner 
					text="Vérification des droits d'accès..." 
					size="md" 
					centered={true}
				/>
			</div>
		);
	}

	// Si erreur d'autorisation
	if (loadingError && !isAuthorized) {
		return (
			<div className="container mx-auto py-8">
				<div className="flex flex-col items-center justify-center h-64">
					<div className="text-center">
						<div className="text-red-500 text-xl mb-4">
							Accès refusé
						</div>
						<p className="text-gray-600 dark:text-gray-300 mb-4">
							{loadingError}
						</p>
						<Button onClick={() => router.push("/wisetrainer")}>
							Retour aux formations
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Si non autorisé
	if (!isAuthorized) {
		return null;
	}

	// Passer le contexte et l'organisation (si applicable) au CourseDetail
	return (
		<CourseDetail 
			params={params} 
			activeContext={activeContext}
			organization={activeContext?.type === 'organization' ? currentOrganization : null}
		/>
	);
}