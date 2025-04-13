// app/api/organization/[organizationId]/members/[memberId]/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth0 } from "@/lib/auth0";

const prisma = new PrismaClient();

// GET pour récupérer les détails d'un membre spécifique
export async function GET(request, { params }) {
	try {
		const session = await auth0.getSession();
		const { organizationId, memberId } = params;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur depuis la base de données
		const user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que l'utilisateur est membre de l'organisation
		const membership = await prisma.organizationMember.findUnique({
			where: {
				organizationId_userId: {
					organizationId: organizationId,
					userId: user.id,
				},
			},
		});

		if (!membership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer les détails du membre demandé
		const memberDetails = await prisma.organizationMember.findUnique({
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

		if (!memberDetails) {
			return NextResponse.json(
				{ error: "Membre non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que le membre appartient bien à l'organisation demandée
		if (memberDetails.organizationId !== organizationId) {
			return NextResponse.json(
				{ error: "Ce membre n'appartient pas à cette organisation" },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			member: {
				id: memberDetails.id,
				userId: memberDetails.user.id,
				name:
					memberDetails.user.name ||
					memberDetails.user.email.split("@")[0],
				email: memberDetails.user.email,
				role: memberDetails.role,
				joinedAt: memberDetails.joinedAt,
			},
		});
	} catch (error) {
		console.error("Erreur lors de la récupération du membre:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération du membre",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// PATCH pour modifier le rôle d'un membre
export async function PATCH(request, { params }) {
	try {
		const session = await auth0.getSession();
		const { organizationId, memberId } = params;
		const { role } = await request.json();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Vérifier que le rôle est valide
		const validRoles = ["ADMIN", "MEMBER"];
		if (!role || !validRoles.includes(role)) {
			return NextResponse.json(
				{ error: "Le rôle spécifié est invalide" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur actuel depuis la base de données
		const currentUser = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!currentUser) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que l'utilisateur actuel est admin ou propriétaire de l'organisation
		const currentMembership = await prisma.organizationMember.findUnique({
			where: {
				organizationId_userId: {
					organizationId: organizationId,
					userId: currentUser.id,
				},
			},
		});

		if (!currentMembership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer le membre à modifier
		const memberToUpdate = await prisma.organizationMember.findUnique({
			where: {
				id: memberId,
			},
		});

		if (!memberToUpdate) {
			return NextResponse.json(
				{ error: "Membre non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que l'utilisateur a les droits pour modifier ce membre
		// 1. Seul le propriétaire peut modifier un administrateur
		// 2. Les administrateurs peuvent modifier les membres standards
		if (memberToUpdate.role === "OWNER") {
			return NextResponse.json(
				{ error: "Impossible de modifier le rôle du propriétaire" },
				{ status: 403 }
			);
		} else if (
			memberToUpdate.role === "ADMIN" &&
			currentMembership.role !== "OWNER"
		) {
			return NextResponse.json(
				{
					error: "Seul le propriétaire peut modifier le rôle d'un administrateur",
				},
				{ status: 403 }
			);
		} else if (
			currentMembership.role !== "OWNER" &&
			currentMembership.role !== "ADMIN"
		) {
			return NextResponse.json(
				{ error: "Vous n'avez pas les droits pour modifier les rôles" },
				{ status: 403 }
			);
		}

		// Modifier le rôle du membre
		const updatedMember = await prisma.organizationMember.update({
			where: {
				id: memberId,
			},
			data: {
				role: role,
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

		return NextResponse.json({
			success: true,
			member: {
				id: updatedMember.id,
				userId: updatedMember.user.id,
				name:
					updatedMember.user.name ||
					updatedMember.user.email.split("@")[0],
				email: updatedMember.user.email,
				role: updatedMember.role,
				joinedAt: updatedMember.joinedAt,
			},
			message: `Le rôle a été mis à jour avec succès.`,
		});
	} catch (error) {
		console.error("Erreur lors de la modification du rôle:", error);
		return NextResponse.json(
			{
				error: "Échec de la modification du rôle",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// DELETE pour supprimer un membre de l'organisation
export async function DELETE(request, { params }) {
	try {
		const session = await auth0.getSession();
		const { organizationId, memberId } = params;

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Récupérer l'utilisateur actuel depuis la base de données
		const currentUser = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!currentUser) {
			return NextResponse.json(
				{ error: "Utilisateur non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que l'utilisateur actuel est admin ou propriétaire de l'organisation
		const currentMembership = await prisma.organizationMember.findUnique({
			where: {
				organizationId_userId: {
					organizationId: organizationId,
					userId: currentUser.id,
				},
			},
		});

		if (!currentMembership) {
			return NextResponse.json(
				{ error: "Vous n'êtes pas membre de cette organisation" },
				{ status: 403 }
			);
		}

		// Récupérer le membre à supprimer
		const memberToDelete = await prisma.organizationMember.findUnique({
			where: {
				id: memberId,
			},
		});

		if (!memberToDelete) {
			return NextResponse.json(
				{ error: "Membre non trouvé" },
				{ status: 404 }
			);
		}

		// Vérifier que l'utilisateur a les droits pour supprimer ce membre
		// 1. Impossible de supprimer le propriétaire
		// 2. Seul le propriétaire peut supprimer un administrateur
		// 3. Les administrateurs peuvent supprimer les membres standards
		if (memberToDelete.role === "OWNER") {
			return NextResponse.json(
				{
					error: "Impossible de supprimer le propriétaire de l'organisation",
				},
				{ status: 403 }
			);
		} else if (
			memberToDelete.role === "ADMIN" &&
			currentMembership.role !== "OWNER"
		) {
			return NextResponse.json(
				{
					error: "Seul le propriétaire peut supprimer un administrateur",
				},
				{ status: 403 }
			);
		} else if (
			currentMembership.role !== "OWNER" &&
			currentMembership.role !== "ADMIN"
		) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits pour supprimer des membres",
				},
				{ status: 403 }
			);
		}

		// Empêcher un membre de se supprimer lui-même
		if (memberToDelete.userId === currentUser.id) {
			return NextResponse.json(
				{
					error: "Vous ne pouvez pas vous supprimer vous-même. Pour quitter l'organisation, utilisez l'option 'Quitter l'organisation'.",
				},
				{ status: 400 }
			);
		}

		// Supprimer le membre
		await prisma.organizationMember.delete({
			where: {
				id: memberId,
			},
		});

		return NextResponse.json({
			success: true,
			message: "Le membre a été retiré avec succès de l'organisation.",
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du membre:", error);
		return NextResponse.json(
			{
				error: "Échec de la suppression du membre",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
