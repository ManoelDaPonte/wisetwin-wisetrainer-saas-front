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

	// Fonction pour standardiser le format d'une formation
	const standardizeFormation = (formation) => {
		// S'assurer que la source est correctement définie
		const source = formation.source || {};
		const isWiseTwin =
			!source.type ||
			source.type === "wisetwin" ||
			!source.organizationId;

		// Format standardisé de la source
		const standardizedSource = isWiseTwin
			? { type: "wisetwin", name: "WiseTwin" }
			: {
					type: "organization",
					name: source.name || "Organisation",
					organizationId: source.organizationId,
			  };

		// Créer un ID composite unique
		const compositeId = `${formation.id}__${standardizedSource.type}__${
			standardizedSource.organizationId || "wisetwin"
		}`;

		// Retourner la formation standardisée
		return {
			...formation,
			source: standardizedSource,
			compositeId: compositeId,
			// Valeurs par défaut pour les champs manquants
			imageUrl: formation.imageUrl || null,
			duration: formation.duration || "Non spécifié",
			level: formation.level || formation.difficulty || "Intermédiaire",
			category: formation.category || "Formation",
			certification: !!formation.certification,
		};
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
				// Standardiser le format des formations
				const standardizedFormations =
					data.trainings.map(standardizeFormation);
				setUserFormations(standardizedFormations);
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
				// Standardiser le format des formations
				const standardizedFormations =
					data.trainings.map(standardizeFormation);
				setPublicFormations(standardizedFormations);
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
			console.log("Tentative de récupération des organisations...");

			// Vérifier si la session utilisateur est valide avant d'effectuer la requête
			const checkSessionResponse = await fetch(
				"/api/auth/check-session",
				{
					method: "GET",
					credentials: "include", // Important pour inclure les cookies de session
				}
			);

			if (!checkSessionResponse.ok) {
				console.log(
					"Session utilisateur invalide, impossible de récupérer les organisations"
				);
				setUserOrganizations([]);
				return;
			}

			// Ajouter des en-têtes pour éviter la mise en cache
			const response = await fetch("/api/organizations", {
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
					"X-Requested-With": "XMLHttpRequest", // Pour indiquer que c'est une requête AJAX
				},
				credentials: "include",
			});

			console.log("Statut de la réponse API:", response.status);

			if (!response.ok) {
				// Lire le contenu de la réponse pour le débogage
				const textResponse = await response.text();
				console.error(
					"Réponse d'erreur non-JSON:",
					textResponse.substring(0, 200) + "..."
				);
				throw new Error(
					`Réponse serveur invalide: ${response.status} ${response.statusText}`
				);
			}

			// Convertir en JSON uniquement si la réponse est OK
			const data = await response.json();
			console.log("Données reçues:", data);

			if (!response.ok) {
				throw new Error(data.error || "Une erreur est survenue");
			}

			if (data.organizations) {
				console.log(
					"Organisations trouvées:",
					data.organizations.length
				);
				setUserOrganizations(data.organizations);

				// Sélectionner automatiquement la première organisation si elle existe
				if (data.organizations.length > 0 && !selectedOrgId) {
					setSelectedOrgId(data.organizations[0].id);
				}
			} else {
				console.log("Pas d'organisations dans la réponse");
				setUserOrganizations([]);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des organisations:",
				error
			);
			// Initialiser avec un tableau vide en cas d'erreur
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
				// Standardiser le format des formations
				const standardizedFormations =
					data.trainings.map(standardizeFormation);
				setOrganizationFormations(standardizedFormations);
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

		// Utiliser compositeId pour une vérification plus simple
		return userFormations.some(
			(userCourse) => userCourse.compositeId === course.compositeId
		);
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
