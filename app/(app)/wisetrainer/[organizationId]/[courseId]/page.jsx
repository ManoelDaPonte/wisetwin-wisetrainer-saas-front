"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import CourseDetail from "@/components/wisetrainer/CourseDetail";
import Spinner from "@/components/common/Spinner";
import { useToast } from "@/lib/hooks/useToast";
import { Button } from "@/components/ui/button";

export default function OrganizationCourseDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [loadingError, setLoadingError] = useState(null);

	useEffect(() => {
		async function checkAccess() {
			if (!params.organizationId) {
				router.push("/wisetrainer");
				return;
			}

			try {
				// Vérifier si l'utilisateur est membre de l'organisation
				const response = await axios.get(
					`/api/organization/${params.organizationId}/check-membership`
				);

				if (response.data.isMember) {
					setIsAuthorized(true);
				} else {
					setLoadingError("Vous n'êtes pas autorisé à accéder à cette formation.");
					toast({
						title: "Accès refusé",
						description: "Vous n'êtes pas autorisé à accéder à cette formation.",
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
				setIsLoading(false);
			}
		}

		checkAccess();
	}, [params.organizationId, router, toast]);

	// Si en cours de chargement, afficher le spinner de vérification des droits
	if (isLoading) {
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

	// Si erreur d'autorisation et pas de redirection automatique
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

	// Si l'utilisateur n'est pas autorisé mais n'a pas d'erreur (cas rare)
	if (!isAuthorized) {
		return null; // La redirection est gérée dans l'effet
	}

	// Si autorisé, afficher le détail du cours
	return <CourseDetail params={params} />;
}