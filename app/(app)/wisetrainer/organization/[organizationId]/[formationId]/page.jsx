// app/(app)/wisetrainer/organization/[organizationId]/[courseId]/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import CourseDetail from "@/components/wisetrainer/CourseDetail";
import { useToast } from "@/lib/hooks/useToast";

export default function OrganizationCourseDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { toast } = useToast();
	const [isAuthorized, setIsAuthorized] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

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
					toast({
						title: "Accès refusé",
						description:
							"Vous n'êtes pas autorisé à accéder à cette formation.",
						variant: "destructive",
					});
					router.push("/wisetrainer");
				}
			} catch (error) {
				console.error("Erreur lors de la vérification d'accès:", error);
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

	if (isLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="flex items-center justify-center h-64">
					<div className="animate-spin h-10 w-10 border-4 border-wisetwin-blue border-t-transparent rounded-full"></div>
					<p className="ml-4">Vérification des droits d'accès...</p>
				</div>
			</div>
		);
	}

	if (!isAuthorized) {
		return null; // La redirection est gérée dans l'effet
	}

	return <CourseDetail params={params} />;
}
