// app/(app)/wisetrainer/organization/[organizationId]/[formationId]/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCurrentFormation } from "@/lib/hooks/formations/currentFormation/useCurrentFormation";
import { useFormations } from "@/lib/hooks/formations/useFormations";
import FormationHeader from "@/components/wisetrainer/formation/FormationHeader";
import FormationTabs from "@/components/wisetrainer/formation/FormationTabs";
import UnenrollModal from "@/components/wisetrainer/modals/UnenrollModal";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export default function OrganizationFormationDetailPage() {
	const router = useRouter();
	const params = useParams();
	const formationId = params?.formationId;
	const organizationId = params?.organizationId;

	const [showUnenrollModal, setShowUnenrollModal] = useState(false);
	const [isCheckingAccess, setIsCheckingAccess] = useState(true);
	const [accessError, setAccessError] = useState(null);

	const { toast } = useToast();

	// Vérifier l'accès à l'organisation en premier
	useEffect(() => {
		const checkAccess = async () => {
			try {
				const response = await axios.get(
					`/api/organizations/${organizationId}/check-membership`
				);

				if (!response.data.isMember) {
					setAccessError(
						"Vous n'êtes pas autorisé à accéder à cette formation"
					);
					toast({
						title: "Accès refusé",
						description:
							"Vous n'êtes pas membre de cette organisation",
						variant: "destructive",
					});

					// Rediriger après un court délai
					setTimeout(() => {
						router.push("/wisetrainer");
					}, 2000);
				}
			} catch (error) {
				console.error("Erreur lors de la vérification d'accès:", error);
				setAccessError(
					"Erreur lors de la vérification des droits d'accès"
				);
				toast({
					title: "Erreur",
					description: "Impossible de vérifier vos droits d'accès",
					variant: "destructive",
				});
			} finally {
				setIsCheckingAccess(false);
			}
		};

		if (organizationId) {
			checkAccess();
		}
	}, [organizationId, router, toast]);

	// Utiliser le hook avec les informations de l'organisation
	const { formation, isLoading, error } = useCurrentFormation(formationId, {
		type: "organization",
		organizationId: organizationId,
	});

	// Utiliser le hook des formations pour les actions d'inscription/désinscription
	const { enrollFormation, unenrollFormation } = useFormations();

	// Fonctions de navigation
	const handleBack = () => {
		router.push("/wisetrainer?tab=catalogueOrganizations");
	};

	// Gérer l'inscription
	const handleEnroll = async () => {
		if (!formation) return;

		const formationWithSource = {
			...formation,
			source: {
				type: "organization",
				organizationId: organizationId,
				name: formation.source.name,
			},
		};

		const result = await enrollFormation(formationWithSource);
		if (result.success) {
			// Recharger la page pour voir les mises à jour
			window.location.reload();
		}
	};

	// Gérer la désinscription
	const handleUnenroll = () => {
		setShowUnenrollModal(true);
	};

	const confirmUnenroll = async () => {
		if (!formation) return;

		const formationWithSource = {
			...formation,
			source: {
				type: "organization",
				organizationId: organizationId,
				name: formation.source.name,
			},
		};

		const result = await unenrollFormation(formationWithSource);
		if (result.success) {
			setShowUnenrollModal(false);
			router.push("/wisetrainer?tab=mesFormations");
		}
	};

	// Afficher un état de chargement
	if (isCheckingAccess || isLoading) {
		return (
			<div className="container mx-auto py-8">
				<Skeleton className="h-10 w-32 mb-4" />
				<div className="space-y-4 mb-8">
					<Skeleton className="h-12 w-3/4" />
					<div className="flex gap-2">
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-24" />
						<Skeleton className="h-6 w-24" />
					</div>
					<Skeleton className="h-4 w-64" />
				</div>

				<div className="flex gap-2 mb-6">
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-32" />
					<Skeleton className="h-10 w-32" />
				</div>

				<Skeleton className="h-64 w-full rounded-lg" />
			</div>
		);
	}

	// Afficher un message d'erreur
	if (accessError || error || !formation) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center py-12">
					<div className="text-red-500 text-xl mb-4">
						{accessError || error || "Formation non trouvée"}
					</div>
					<p className="text-gray-600 dark:text-gray-300 mb-4">
						Impossible d'accéder à cette formation.
					</p>
					<button
						className="bg-wisetwin-blue hover:bg-wisetwin-blue-light text-white px-4 py-2 rounded-md"
						onClick={handleBack}
					>
						Retour aux formations
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			{/* En-tête de la formation */}
			<FormationHeader
				formation={formation}
				onBack={handleBack}
				onEnroll={handleEnroll}
				onUnenroll={handleUnenroll}
			/>

			{/* Onglets de la formation */}
			<FormationTabs formation={formation} />

			{/* Modal de désinscription */}
			<UnenrollModal
				isOpen={showUnenrollModal}
				onClose={() => setShowUnenrollModal(false)}
				onConfirm={confirmUnenroll}
				courseName={formation?.name || ""}
			/>
		</div>
	);
}
