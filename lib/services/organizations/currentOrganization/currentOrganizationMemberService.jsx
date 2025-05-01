// lib/services/organizations/organization/memberService.jsx
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Service pour gérer toutes les opérations liées aux membres d'une organisation
 */
class MemberService {
	/**
	 * Récupère tous les membres d'une organisation, avec ou sans leurs tags
	 * @param {string} organizationId - ID de l'organisation
	 * @param {Object} options - Options de la requête
	 * @param {boolean} options.includeTags - Inclure les tags (par défaut: false)
	 * @returns {Promise<Array>} Liste des membres
	 */
	async getOrganizationMembers(
		organizationId,
		options = { includeTags: false }
	) {
		try {
			// Récupérer tous les membres de l'organisation
			const members = await prisma.organizationMember.findMany({
				where: {
					organizationId: organizationId,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: {
					joinedAt: "asc",
				},
			});

			// Formatage de base des membres
			let formattedMembers = members.map((member) => ({
				id: member.id,
				userId: member.user.id,
				name: member.user.name || member.user.email.split("@")[0],
				email: member.user.email,
				role: member.role,
				joinedAt: member.joinedAt,
			}));

			// Si les tags sont demandés, les ajouter
			if (options.includeTags) {
				formattedMembers = await Promise.all(
					formattedMembers.map(async (member) => {
						const userTags = await prisma.userTag.findMany({
							where: {
								userId: member.userId,
								tag: {
									organizationId: organizationId,
								},
							},
							include: {
								tag: true,
							},
						});

						const formattedTags = userTags.map((ut) => ({
							id: ut.tag.id,
							name: ut.tag.name,
							color: ut.tag.color,
							description: ut.tag.description,
						}));

						return {
							...member,
							tags: formattedTags,
						};
					})
				);
			} else {
				// Si les tags ne sont pas demandés, ajouter un tableau vide
				formattedMembers = formattedMembers.map((member) => ({
					...member,
					tags: [],
				}));
			}

			return formattedMembers;
		} catch (error) {
			console.error("Erreur lors de la récupération des membres:", error);
			throw error;
		}
	}

	/**
	 * Récupère un membre spécifique par son ID
	 * @param {string} memberId - ID du membre
	 * @returns {Promise<Object|null>} Informations sur le membre ou null s'il n'existe pas
	 */
	async getMemberById(memberId) {
		try {
			const member = await prisma.organizationMember.findUnique({
				where: { id: memberId },
				include: { user: true },
			});

			if (!member) {
				return null;
			}

			return member;
		} catch (error) {
			console.error("Erreur lors de la récupération du membre:", error);
			throw error;
		}
	}

	/**
	 * Récupère les tags d'un membre
	 * @param {string} organizationId - ID de l'organisation
	 * @param {string} userId - ID de l'utilisateur
	 * @returns {Promise<Array>} Liste des tags du membre
	 */
	async getMemberTags(organizationId, userId) {
		try {
			const userTags = await prisma.userTag.findMany({
				where: {
					userId: userId,
					tag: {
						organizationId: organizationId,
					},
				},
				include: {
					tag: true,
				},
			});

			return userTags.map((ut) => ({
				id: ut.tag.id,
				name: ut.tag.name,
				color: ut.tag.color,
				description: ut.tag.description,
			}));
		} catch (error) {
			console.error(
				"Erreur lors de la récupération des tags du membre:",
				error
			);
			throw error;
		}
	}

	/**
	 * Vérifie si un utilisateur a le droit de modifier un membre
	 * @param {string} organizationId - ID de l'organisation
	 * @param {string} currentUserId - ID de l'utilisateur qui fait la modification
	 * @param {string} targetMemberId - ID du membre à modifier
	 * @returns {Promise<Object>} Résultat de la vérification
	 */
	async checkModifyPermissions(
		organizationId,
		currentUserId,
		targetMemberId
	) {
		// Vérifier le rôle de l'utilisateur actuel
		const currentUserMembership = await prisma.organizationMember.findFirst(
			{
				where: {
					organizationId: organizationId,
					userId: currentUserId,
				},
			}
		);

		if (!currentUserMembership) {
			throw new Error("Vous n'êtes pas membre de cette organisation");
		}

		// Récupérer le membre à modifier
		const memberToModify = await prisma.organizationMember.findUnique({
			where: {
				id: targetMemberId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!memberToModify) {
			throw new Error("Membre non trouvé");
		}

		return {
			currentUserRole: currentUserMembership.role,
			targetMemberRole: memberToModify.role,
			targetMember: memberToModify,
			// Seul le propriétaire peut modifier un OWNER ou un ADMIN
			// Les ADMIN peuvent modifier uniquement les MEMBER
			canModify:
				currentUserMembership.role === "OWNER" ||
				(currentUserMembership.role === "ADMIN" &&
					memberToModify.role === "MEMBER"),
			// Seul le propriétaire peut modifier un ADMIN
			canModifyAdmin: currentUserMembership.role === "OWNER",
			// Personne ne peut modifier le OWNER
			canModifyOwner: false,
		};
	}

	/**
	 * Modifie le rôle d'un membre
	 * @param {string} organizationId - ID de l'organisation
	 * @param {string} memberId - ID du membre
	 * @param {string} newRole - Nouveau rôle (ADMIN, MEMBER)
	 * @param {string} currentUserId - ID de l'utilisateur qui fait la modification
	 * @returns {Promise<Object>} Membre mis à jour
	 */
	async changeMemberRole(organizationId, memberId, newRole, currentUserId) {
		try {
			// Vérifier les permissions
			const permissions = await this.checkModifyPermissions(
				organizationId,
				currentUserId,
				memberId
			);

			// Vérifier les restrictions spécifiques
			if (permissions.targetMemberRole === "OWNER") {
				throw new Error(
					"Impossible de modifier le rôle du propriétaire"
				);
			}

			if (
				permissions.targetMemberRole === "ADMIN" &&
				permissions.currentUserRole !== "OWNER"
			) {
				throw new Error(
					"Seul le propriétaire peut modifier le rôle d'un administrateur"
				);
			}

			if (!permissions.canModify) {
				throw new Error(
					"Vous n'avez pas les droits pour modifier les rôles"
				);
			}

			// Rôles autorisés: ADMIN ou MEMBER
			if (newRole !== "ADMIN" && newRole !== "MEMBER") {
				throw new Error(
					"Rôle non valide. Les valeurs autorisées sont: ADMIN, MEMBER"
				);
			}

			// Modifier le rôle
			const updatedMember = await prisma.organizationMember.update({
				where: {
					id: memberId,
				},
				data: {
					role: newRole,
				},
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			});

			return {
				id: updatedMember.id,
				userId: updatedMember.user.id,
				name:
					updatedMember.user.name ||
					updatedMember.user.email.split("@")[0],
				email: updatedMember.user.email,
				role: updatedMember.role,
				joinedAt: updatedMember.joinedAt,
			};
		} catch (error) {
			console.error("Erreur lors de la modification du rôle:", error);
			throw error;
		}
	}

	/**
	 * Supprime un membre de l'organisation
	 * @param {string} organizationId - ID de l'organisation
	 * @param {string} memberId - ID du membre à supprimer
	 * @param {string} currentUserId - ID de l'utilisateur qui fait la suppression
	 * @returns {Promise<Object>} Résultat de la suppression
	 */
	async removeMember(organizationId, memberId, currentUserId) {
		try {
			// Vérifier les permissions
			const permissions = await this.checkModifyPermissions(
				organizationId,
				currentUserId,
				memberId
			);

			// Vérifications spécifiques
			if (permissions.targetMemberRole === "OWNER") {
				throw new Error(
					"Impossible de supprimer le propriétaire de l'organisation"
				);
			}

			if (
				permissions.targetMemberRole === "ADMIN" &&
				permissions.currentUserRole !== "OWNER"
			) {
				throw new Error(
					"Seul le propriétaire peut supprimer un administrateur"
				);
			}

			if (!permissions.canModify) {
				throw new Error(
					"Vous n'avez pas les droits pour supprimer des membres"
				);
			}

			// Empêcher un membre de se supprimer lui-même
			if (permissions.targetMember.userId === currentUserId) {
				throw new Error("Vous ne pouvez pas vous supprimer vous-même");
			}

			// Supprimer le membre
			await prisma.organizationMember.delete({
				where: {
					id: memberId,
				},
			});

			return { success: true };
		} catch (error) {
			console.error("Erreur lors de la suppression du membre:", error);
			throw error;
		}
	}

	/**
	 * Met à jour les tags d'un membre
	 * @param {string} organizationId - ID de l'organisation
	 * @param {string} memberId - ID du membre
	 * @param {Array} tagIds - IDs des tags à associer
	 * @returns {Promise<Array>} Tags mis à jour
	 */
	async updateMemberTags(organizationId, memberId, tagIds) {
		try {
			// Récupérer le membre
			const member = await this.getMemberById(memberId);

			if (!member) {
				throw new Error("Membre non trouvé");
			}

			// Vérifier que tous les tags existent et appartiennent à l'organisation
			const organizationTags = await prisma.organizationTag.findMany({
				where: {
					id: { in: tagIds },
					organizationId: organizationId,
				},
			});

			if (organizationTags.length !== tagIds.length) {
				throw new Error(
					"Certains tags n'existent pas ou n'appartiennent pas à cette organisation"
				);
			}

			// Transaction pour mettre à jour les tags
			await prisma.$transaction(async (prisma) => {
				// Supprimer tous les tags existants
				await prisma.userTag.deleteMany({
					where: {
						userId: member.user.id,
						tag: {
							organizationId: organizationId,
						},
					},
				});

				// Ajouter les nouveaux tags
				if (tagIds.length > 0) {
					await prisma.userTag.createMany({
						data: tagIds.map((tagId) => ({
							userId: member.user.id,
							tagId: tagId,
						})),
					});
				}
			});

			// Récupérer les tags mis à jour
			return this.getMemberTags(organizationId, member.user.id);
		} catch (error) {
			console.error("Erreur lors de la mise à jour des tags:", error);
			throw error;
		}
	}
}

// Export d'une instance unique du service
export const memberService = new MemberService();
