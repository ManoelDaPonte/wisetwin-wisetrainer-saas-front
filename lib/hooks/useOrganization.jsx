// lib/hooks/useOrganization.jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useToast } from "@/lib/hooks/useToast";

export function useOrganization() {
	const { user, isLoading: userLoading } = useUser();
	const { toast } = useToast();

	// États pour les organisations
	const [userOrganizations, setUserOrganizations] = useState([]);
	const [currentOrganization, setCurrentOrganization] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// État pour les groupes et formations
	const [groups, setGroups] = useState([]);
	const [trainings, setTrainings] = useState([]);
	const [userGroups, setUserGroups] = useState([]);

	// Charger les organisations de l'utilisateur connecté
	const loadUserOrganizations = useCallback(async () => {
		if (!user) return;

		setIsLoading(true);
		setError(null);

		try {
			const response = await axios.get("/api/organization");

			if (response.data.organizations) {
				setUserOrganizations(response.data.organizations);

				// Si l'utilisateur n'a qu'une seule organisation, la définir comme courante
				if (response.data.organizations.length === 1) {
					setCurrentOrganization(response.data.organizations[0]);
					setUserRole(response.data.organizations[0].userRole);
				}
			}
		} catch (error) {
			console.error(
				"Erreur lors du chargement des organisations:",
				error
			);
			setError("Impossible de charger vos organisations");

			toast({
				title: "Erreur",
				description: "Impossible de charger vos organisations",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	}, [user, toast]);

	// Charger les détails d'une organisation spécifique
	const loadOrganization = useCallback(
		async (organizationId) => {
			if (!user || !organizationId) return;

			setIsLoading(true);
			setError(null);

			try {
				const response = await axios.get(
					`/api/organization/${organizationId}`
				);

				if (response.data.organization) {
					setCurrentOrganization(response.data.organization);
					setUserRole(response.data.organization.userRole);
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement de l'organisation:",
					error
				);
				setError("Impossible de charger les détails de l'organisation");

				toast({
					title: "Erreur",
					description:
						"Impossible de charger les détails de l'organisation",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[user, toast]
	);

	// Charger les groupes d'une organisation
	const loadGroups = useCallback(
		async (organizationId) => {
			if (!user || !organizationId) return;

			setIsLoading(true);
			setError(null);

			try {
				const response = await axios.get(
					`/api/organization/${organizationId}/groups`
				);

				if (response.data.groups) {
					setGroups(response.data.groups);
				}
			} catch (error) {
				console.error("Erreur lors du chargement des groupes:", error);
				setError("Impossible de charger les groupes de l'organisation");

				toast({
					title: "Erreur",
					description: "Impossible de charger les groupes",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[user, toast]
	);

	// Charger les formations disponibles pour l'utilisateur dans l'organisation
	const loadUserTrainings = useCallback(
		async (organizationId) => {
			if (!user || !organizationId) return;

			setIsLoading(true);
			setError(null);

			try {
				const response = await axios.get(
					`/api/organization/${organizationId}/user-trainings`
				);

				if (response.data.trainings) {
					setTrainings(response.data.trainings);

					// Mettre à jour le rôle de l'utilisateur si fourni
					if (response.data.userRole) {
						setUserRole(response.data.userRole);
					}
				}
			} catch (error) {
				console.error(
					"Erreur lors du chargement des formations:",
					error
				);
				setError("Impossible de charger les formations disponibles");

				toast({
					title: "Erreur",
					description: "Impossible de charger les formations",
					variant: "destructive",
				});
			} finally {
				setIsLoading(false);
			}
		},
		[user, toast]
	);

	// Créer un nouveau groupe
	const createGroup = useCallback(
		async (organizationId, groupData) => {
			if (!user || !organizationId) return null;

			try {
				const response = await axios.post(
					`/api/organization/${organizationId}/groups`,
					groupData
				);

				if (response.data.success) {
					// Rafraîchir la liste des groupes
					await loadGroups(organizationId);

					toast({
						title: "Groupe créé",
						description: `Le groupe "${groupData.name}" a été créé avec succès`,
						variant: "success",
					});

					return response.data.group;
				}
			} catch (error) {
				console.error("Erreur lors de la création du groupe:", error);

				toast({
					title: "Erreur",
					description:
						error.response?.data?.error ||
						"Impossible de créer le groupe",
					variant: "destructive",
				});

				return null;
			}
		},
		[user, loadGroups, toast]
	);

	// Assigner des membres à un groupe
	const assignMembersToGroup = useCallback(
		async (organizationId, groupId, memberIds) => {
			if (!user || !organizationId || !groupId || !memberIds)
				return false;

			try {
				const response = await axios.post(
					`/api/organization/${organizationId}/groups/${groupId}/members`,
					{
						memberIds,
					}
				);

				if (response.data.success) {
					// Rafraîchir la liste des groupes
					await loadGroups(organizationId);

					toast({
						title: "Membres assignés",
						description:
							response.data.message ||
							"Les membres ont été assignés au groupe",
						variant: "success",
					});

					return true;
				}
			} catch (error) {
				console.error(
					"Erreur lors de l'assignation des membres:",
					error
				);

				toast({
					title: "Erreur",
					description:
						error.response?.data?.error ||
						"Impossible d'assigner les membres",
					variant: "destructive",
				});

				return false;
			}
		},
		[user, loadGroups, toast]
	);

	// Assigner des formations à un groupe
	const assignTrainingsToGroup = useCallback(
		async (organizationId, groupId, trainingIds) => {
			if (!user || !organizationId || !groupId || !trainingIds)
				return false;

			try {
				const response = await axios.post(
					`/api/organization/${organizationId}/groups/${groupId}/trainings`,
					{
						trainingIds,
					}
				);

				if (response.data.success) {
					// Rafraîchir la liste des groupes et des formations
					await loadGroups(organizationId);
					await loadUserTrainings(organizationId);

					toast({
						title: "Formations assignées",
						description:
							response.data.message ||
							"Les formations ont été assignées au groupe",
						variant: "success",
					});

					return true;
				}
			} catch (error) {
				console.error(
					"Erreur lors de l'assignation des formations:",
					error
				);

				toast({
					title: "Erreur",
					description:
						error.response?.data?.error ||
						"Impossible d'assigner les formations",
					variant: "destructive",
				});

				return false;
			}
		},
		[user, loadGroups, loadUserTrainings, toast]
	);

	// Vérifier si l'utilisateur a accès à une formation spécifique
	const canAccessTraining = useCallback(
		(trainingId) => {
			// Si l'utilisateur est OWNER ou ADMIN, il a accès à toutes les formations
			if (userRole === "OWNER" || userRole === "ADMIN") return true;

			// Sinon, vérifier si la formation est dans la liste des formations accessibles
			return trainings.some((training) => training.id === trainingId);
		},
		[userRole, trainings]
	);

	// Effet pour charger les organisations de l'utilisateur au premier rendu
	useEffect(() => {
		if (user && !userLoading) {
			loadUserOrganizations();
		}
	}, [user, userLoading, loadUserOrganizations]);

	return {
		// États
		userOrganizations,
		currentOrganization,
		userRole,
		isLoading,
		error,
		groups,
		trainings,
		userGroups,

		// Fonctions
		loadUserOrganizations,
		loadOrganization,
		loadGroups,
		loadUserTrainings,
		createGroup,
		assignMembersToGroup,
		assignTrainingsToGroup,
		canAccessTraining,
		setCurrentOrganization,

		// Utilitaires
		isAdmin: userRole === "OWNER" || userRole === "ADMIN",
		hasOrganizations: userOrganizations.length > 0,
	};
}

export default useOrganization;
