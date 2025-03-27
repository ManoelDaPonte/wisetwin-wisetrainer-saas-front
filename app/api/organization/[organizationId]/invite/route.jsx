// app/api/organization/[organizationId]/invite/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";
import { v4 as uuidv4 } from "uuid";
import { sendInvitationEmail } from "@/lib/services/mailService";

const prisma = new PrismaClient();

export async function POST(request, { params }) {
	try {
		const session = await getSession();
		const resolvedParams = await params;
		const { organizationId } = resolvedParams;
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
		const currentMembership = await prisma.organizationMember.findFirst({
			where: {
				organizationId: organizationId,
				userId: currentUser.id,
				role: {
					in: ["OWNER", "ADMIN"],
				},
			},
		});

		if (!currentMembership) {
			return NextResponse.json(
				{
					error: "Vous n'avez pas les droits pour inviter des membres",
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

		// Rechercher l'utilisateur à inviter par son email
		let userToInvite = await prisma.user.findUnique({
			where: {
				email: email,
			},
		});

		// Vérifier si l'utilisateur à inviter existe déjà
		if (userToInvite) {
			// Vérifier si l'utilisateur est déjà membre de l'organisation
			const existingMembership =
				await prisma.organizationMember.findFirst({
					where: {
						organizationId: organizationId,
						userId: userToInvite.id,
					},
				});

			if (existingMembership) {
				return NextResponse.json(
					{
						error: "Cet utilisateur est déjà membre de l'organisation",
					},
					{ status: 400 }
				);
			}
		}

		// Vérifier si une invitation est déjà en cours
		const existingInvitation =
			await prisma.organizationInvitation.findFirst({
				where: {
					email: email,
					organizationId: organizationId,
					status: "PENDING",
				},
			});

		if (existingInvitation) {
			return NextResponse.json(
				{ error: "Une invitation est déjà en attente pour cet email" },
				{ status: 400 }
			);
		}

		// Créer l'invitation
		const inviteCode = uuidv4();
		const expirationDate = new Date();
		expirationDate.setDate(expirationDate.getDate() + 7); // Expire dans 7 jours

		const invitation = await prisma.organizationInvitation.create({
			data: {
				email,
				organizationId,
				inviteCode,
				role: role || "MEMBER",
				invitedBy: currentUser.id,
				expiresAt: expirationDate,
			},
		});

		// Envoyer l'email d'invitation
		await sendInvitationEmail(email, organization.name, inviteCode);

		return NextResponse.json({
			success: true,
			message: `Invitation envoyée à ${email}`,
			invitation: {
				id: invitation.id,
				email: invitation.email,
				role: invitation.role,
				status: invitation.status,
				expiresAt: invitation.expiresAt,
			},
		});
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'invitation:", error);
		return NextResponse.json(
			{
				error: "Échec de l'envoi de l'invitation",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
