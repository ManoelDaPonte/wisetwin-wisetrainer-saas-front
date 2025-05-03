// lib/hooks/formations/useFormations.js
import { useState, useEffect } from "react";
import { useToast } from "@/lib/hooks/useToast";

export const useFormations = () => {
	const { toast } = useToast();

	// États pour les différentes listes de formations
	const [userFormations, setUserFormations] = useState([]);
	const [publicFormations, setPublicFormations] = useState([]);
	const [organizationFormations, setOrganizationFormations] = useState([]);
	const [userOrganizations, setUserOrganizations] = useState([]);
	const [selectedOrgId, setSelectedOrgId] = useState(null);

	// États de chargement
	const [isLoadingUser, setIsLoadingUser] = useState(true);
	const [isLoadingPublic, setIsLoadingPublic] = useState(true);
	const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
	const [isLoadingOrgFormations, setIsLoadingOrgFormations] = useState(true);

	// Fonction pour générer un ID composite pour un cours
	const generateCompositeId = (course) => {
		const sourceType = course.source?.type || "wisetwin";
		const orgId = course.source?.organizationId || "wisetwin";
		return `${course.id}__${sourceType}__${orgId}`;
	};

	// Charger les formations de l'utilisateur
	const fetchUserFormations = async () => {
		setIsLoadingUser(true);
		try {
			const response = await fetch("/api/formations/user-formations");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Une erreur est survenue");
			}

			if (data.trainings) {
				// Ajouter un compositeId à chaque formation
				const enrichedFormations = data.trainings.map((formation) => ({
					...formation,
					compositeId: generateCompositeId(formation),
				}));

				setUserFormations(enrichedFormations);
			}
		} catch (error) {
			console.error(
				"Erreur lors du chargement des formations de l'utilisateur:",
				error
			);
			toast({
				title: "Erreur",
				description: "Impossible de charger vos formations",
				variant: "destructive",
			});
		} finally {
			setIsLoadingUser(false);
		}
	};

	// Charger les formations publiques
	const fetchPublicFormations = async () => {
		setIsLoadingPublic(true);
		try {
			const response = await fetch("/api/formations/public-formations");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Une erreur est survenue");
			}

			if (data.trainings) {
				// Enrichir les formations avec des informations sources et compositeId
				const enrichedFormations = data.trainings.map((formation) => ({
					...formation,
					compositeId: generateCompositeId(formation),
				}));

				setPublicFormations(enrichedFormations);
			}
		} catch (error) {
			console.error(
				"Erreur lors du chargement des formations publiques:",
				error
			);
			toast({
				title: "Erreur",
				description: "Impossible de charger le catalogue de formations",
				variant: "destructive",
			});
		} finally {
			setIsLoadingPublic(false);
		}
	};

	// Charger les organisations de l'utilisateur
	const fetchUserOrganizations = async () => {
		setIsLoadingOrgs(true);
		try {
			const response = await fetch("/api/organization");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Une erreur est survenue");
			}

			if (data.organizations) {
				setUserOrganizations(data.organizations);

				// Sélectionner automatiquement la première organisation si elle existe
				if (data.organizations.length > 0 && !selectedOrgId) {
					setSelectedOrgId(data.organizations[0].id);
				}
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des organisations:",
				error
			);
			setUserOrganizations([]);
		} finally {
			setIsLoadingOrgs(false);
		}
	};

	// Charger les formations d'une organisation spécifique
	const fetchOrganizationFormations = async (orgId) => {
		if (!orgId) return;

		setIsLoadingOrgFormations(true);
		try {
			const response = await fetch(
				`/api/formations/organization-formations?organizationId=${orgId}`
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Une erreur est survenue");
			}

			if (data.trainings) {
				// Trouver l'organisation sélectionnée
				const selectedOrg = userOrganizations.find(
					(org) => org.id === orgId
				);

				// Enrichir les formations avec compositeId
				const enrichedFormations = data.trainings.map((formation) => ({
					...formation,
					compositeId: `${formation.id}__organization__${orgId}`,
				}));

				setOrganizationFormations(enrichedFormations);
			}
		} catch (error) {
			console.error(
				`Erreur lors du chargement des formations de l'organisation ${orgId}:`,
				error
			);
			toast({
				title: "Erreur",
				description:
					"Impossible de charger les formations de l'organisation",
				variant: "destructive",
			});
		} finally {
			setIsLoadingOrgFormations(false);
		}
	};

	// Vérifier si l'utilisateur est inscrit à une formation
	const isUserEnrolled = (course) => {
		if (!userFormations || userFormations.length === 0) {
			return false;
		}

		// Récupérer les informations de source du cours
		const sourceType = course.source?.type || "wisetwin";
		const orgId = course.source?.organizationId || null;

		// Vérifier si le cours existe déjà dans les formations de l'utilisateur
		return userFormations.some((userCourse) => {
			const userSourceType = userCourse.source?.type || "wisetwin";
			const userOrgId = userCourse.source?.organizationId || null;

			// Vérifier l'ID du cours ET sa source
			return (
				userCourse.id === course.id &&
				userSourceType === sourceType &&
				// Si les deux sont null, c'est égal. Sinon, comparer les valeurs
				((userOrgId === null && orgId === null) || userOrgId === orgId)
			);
		});
	};

	// S'inscrire à une formation
	const enrollFormation = async (course) => {
		try {
			const response = await fetch("/api/formations/enroll", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					courseId: course.id,
					sourceType: course.source?.type || "wisetwin",
					sourceOrganizationId: course.source?.organizationId || null,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Une erreur est survenue");
			}

			if (data.success) {
				// Rafraîchir la liste des formations de l'utilisateur
				await fetchUserFormations();

				toast({
					title: "Formation ajoutée",
					description:
						'Vous pouvez maintenant accéder à cette formation depuis "Mes Formations"',
					variant: "success",
				});

				return { success: true, data };
			} else {
				throw new Error(
					data.error || "Échec de l'inscription à la formation"
				);
			}
		} catch (error) {
			console.error(
				"Erreur lors de l'inscription à la formation:",
				error
			);
			toast({
				title: "Erreur",
				description:
					"Impossible d'ajouter cette formation. Veuillez réessayer.",
				variant: "destructive",
			});
			return { success: false, error };
		}
	};

	// Se désinscrire d'une formation
	const unenrollFormation = async (course) => {
		if (!course) return { success: false };

		try {
			const sourceType = course.source?.type || "wisetwin";
			const sourceOrgId = course.source?.organizationId || "";

			const response = await fetch(
				`/api/formations/unenroll?courseId=${course.id}&sourceType=${sourceType}&sourceOrganizationId=${sourceOrgId}`,
				{
					method: "DELETE",
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Une erreur est survenue");
			}

			if (data.success) {
				// Rafraîchir la liste des formations de l'utilisateur
				await fetchUserFormations();

				toast({
					title: "Formation supprimée",
					description: `"${course.name}" a été supprimée de votre liste. Vous pouvez la réajouter à tout moment depuis le catalogue.`,
					variant: "success",
				});

				return { success: true };
			} else {
				throw new Error(data.error || "Échec de la désinscription");
			}
		} catch (error) {
			console.error("Erreur lors de la désinscription:", error);
			toast({
				title: "Échec de la suppression",
				description: "Une erreur est survenue. Veuillez réessayer.",
				variant: "destructive",
			});
			return { success: false, error };
		}
	};

	// Effect pour charger les données initiales
	useEffect(() => {
		fetchUserFormations();
		fetchPublicFormations();
		fetchUserOrganizations();
	}, []);

	// Effect pour charger les formations d'organisation lorsque l'organisation sélectionnée change
	useEffect(() => {
		if (selectedOrgId) {
			fetchOrganizationFormations(selectedOrgId);
		}
	}, [selectedOrgId]);

	return {
		// Données
		userFormations,
		publicFormations,
		organizationFormations,
		userOrganizations,
		selectedOrgId,

		// États de chargement
		isLoadingUser,
		isLoadingPublic,
		isLoadingOrgs,
		isLoadingOrgFormations,

		// Actions
		setSelectedOrgId,
		isUserEnrolled,
		enrollFormation,
		unenrollFormation,

		// Rafraîchir les données
		refreshUserFormations: fetchUserFormations,
		refreshPublicFormations: fetchPublicFormations,
		refreshOrganizationFormations: () =>
			fetchOrganizationFormations(selectedOrgId),
	};
};
