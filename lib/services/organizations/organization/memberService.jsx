// lib/services/organisation/memberService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Récupère tous les membres d'une organisation avec leurs tags
 * @param {string} organizationId - ID de l'organisation
 * @returns {Promise<Array>} Liste des membres avec leurs tags
 */
export async function getOrganizationMembersWithTags(organizationId) {
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

		// Pour chaque membre, récupérer ses tags
		const membersWithTags = await Promise.all(
			members.map(async (member) => {
				const userTags = await prisma.userTag.findMany({
					where: {
						userId: member.user.id,
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
					id: member.id,
					userId: member.user.id,
					name: member.user.name || member.user.email.split("@")[0],
					email: member.user.email,
					role: member.role,
					joinedAt: member.joinedAt,
					tags: formattedTags,
				};
			})
		);

		return membersWithTags;
	} catch (error) {
		console.error("Erreur lors de la récupération des membres:", error);
		throw error;
	}
}

/**
 * Modifie le rôle d'un membre
 * @param {string} organizationId - ID de l'organisation
 * @param {string} memberId - ID du membre
 * @param {string} newRole - Nouveau rôle (ADMIN, MEMBER)
 * @param {string} currentUserId - ID de l'utilisateur qui fait la modification
 * @returns {Promise<Object>} Membre mis à jour
 */
export async function changeMemberRole(
	organizationId,
	memberId,
	newRole,
	currentUserId
) {
	try {
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
		const memberToUpdate = await prisma.organizationMember.findUnique({
			where: {
				id: memberId,
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

		if (!memberToUpdate) {
			throw new Error("Membre non trouvé");
		}

		// Vérifier les permissions
		if (memberToUpdate.role === "OWNER") {
			throw new Error("Impossible de modifier le rôle du propriétaire");
		}

		if (
			memberToUpdate.role === "ADMIN" &&
			currentUserMembership.role !== "OWNER"
		) {
			throw new Error(
				"Seul le propriétaire peut modifier le rôle d'un administrateur"
			);
		}

		if (
			currentUserMembership.role !== "OWNER" &&
			currentUserMembership.role !== "ADMIN"
		) {
			throw new Error(
				"Vous n'avez pas les droits pour modifier les rôles"
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
export async function removeMember(organizationId, memberId, currentUserId) {
	try {
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

		// Récupérer le membre à supprimer
		const memberToDelete = await prisma.organizationMember.findUnique({
			where: {
				id: memberId,
			},
			include: {
				user: {
					select: {
						id: true,
					},
				},
			},
		});

		if (!memberToDelete) {
			throw new Error("Membre non trouvé");
		}

		// Vérifier les permissions
		if (memberToDelete.role === "OWNER") {
			throw new Error(
				"Impossible de supprimer le propriétaire de l'organisation"
			);
		}

		if (
			memberToDelete.role === "ADMIN" &&
			currentUserMembership.role !== "OWNER"
		) {
			throw new Error(
				"Seul le propriétaire peut supprimer un administrateur"
			);
		}

		if (
			currentUserMembership.role !== "OWNER" &&
			currentUserMembership.role !== "ADMIN"
		) {
			throw new Error(
				"Vous n'avez pas les droits pour supprimer des membres"
			);
		}

		// Empêcher un membre de se supprimer lui-même
		if (memberToDelete.userId === currentUserId) {
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
 * Ajoute les tags d'un membre
 * @param {string} organizationId - ID de l'organisation
 * @param {string} memberId - ID du membre
 * @param {Array} tagIds - IDs des tags à associer
 * @returns {Promise<Array>} Tags mis à jour
 */
export async function updateMemberTags(organizationId, memberId, tagIds) {
	try {
		// Récupérer le membre
		const member = await prisma.organizationMember.findUnique({
			where: { id: memberId },
			include: { user: true },
		});

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
		const updatedTags = await prisma.userTag.findMany({
			where: {
				userId: member.user.id,
				tag: {
					organizationId: organizationId,
				},
			},
			include: {
				tag: true,
			},
		});

		return updatedTags.map((ut) => ({
			id: ut.tag.id,
			name: ut.tag.name,
			color: ut.tag.color,
			description: ut.tag.description,
		}));
	} catch (error) {
		console.error("Erreur lors de la mise à jour des tags:", error);
		throw error;
	}
}
