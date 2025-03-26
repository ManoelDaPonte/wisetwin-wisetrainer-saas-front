// app/api/organization/[organizationId]/members/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

// GET pour lister tous les membres d'une organisation
export async function GET(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;

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

		// Formatter les données des membres pour l'UI
		const formattedMembers = members.map((member) => ({
			id: member.id,
			userId: member.user.id,
			name: member.user.name || member.user.email.split("@")[0],
			email: member.user.email,
			role: member.role,
			joinedAt: member.joinedAt,
		}));

		return NextResponse.json({ members: formattedMembers });
	} catch (error) {
		console.error("Erreur lors de la récupération des membres:", error);
		return NextResponse.json(
			{
				error: "Échec de la récupération des membres",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}

// POST pour ajouter un nouveau membre à l'organisation
export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const { organizationId } = params;
		const { email, role } = await request.json();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		// Vérifier que l'email est fourni
		if (!email) {
			return NextResponse.json(
				{ error: "L'adresse email est requise" },
				{ status: 400 }
			);
		}

		// Vérifier que le rôle est valide
		const validRoles = ["ADMIN", "MEMBER"];
		if (role && !validRoles.includes(role)) {
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

		if (
			!currentMembership ||
			(currentMembership.role !== "OWNER" &&
				currentMembership.role !== "ADMIN")
		) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits pour ajouter des membres",
				},
				{ status: 403 }
			);
		}

		// Vérifier si l'organisation existe
		const organization = await prisma.organization.findUnique({
			where: {
				id: organizationId,
			},
		});

		if (!organization) {
			return NextResponse.json(
				{ error: "Organisation non trouvée" },
				{ status: 404 }
			);
		}

		// Rechercher l'utilisateur à ajouter par son email
		let userToAdd = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		// Si l'utilisateur n'existe pas, créer un nouvel utilisateur (pré-inscription)
		if (!userToAdd) {
			userToAdd = await prisma.user.create({
				data: {
					email: email,
					name: email.split("@")[0], // Utiliser la partie locale de l'email comme nom par défaut
					auth0Id: `pending_${Date.now()}`, // ID temporaire qui sera mis à jour lors de l'inscription
				},
			});
		}

		// Vérifier si l'utilisateur est déjà membre de l'organisation
		const existingMembership = await prisma.organizationMember.findUnique({
			where: {
				organizationId_userId: {
					organizationId: organizationId,
					userId: userToAdd.id,
				},
			},
		});

		if (existingMembership) {
			return NextResponse.json(
				{ error: "Cet utilisateur est déjà membre de l'organisation" },
				{ status: 400 }
			);
		}

		// Ajouter l'utilisateur à l'organisation
		const newMembership = await prisma.organizationMember.create({
			data: {
				organizationId: organizationId,
				userId: userToAdd.id,
				role: role || "MEMBER", // Par défaut, ajouter comme membre standard
			},
		});

		// Dans une implémentation réelle, envoyer un email d'invitation ici
		// Pour cet exemple, nous simulons simplement le succès

		return NextResponse.json({
			success: true,
			message: `Invitation envoyée à ${email}`,
			member: {
				id: newMembership.id,
				userId: userToAdd.id,
				name: userToAdd.name,
				email: userToAdd.email,
				role: newMembership.role,
				joinedAt: newMembership.joinedAt,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'ajout d'un membre:", error);
		return NextResponse.json(
			{ error: "Échec de l'ajout du membre", details: error.message },
			{ status: 500 }
		);
	}
}
