// app/api/auth/initialize-user/route.jsx
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@auth0/nextjs-auth0";

const prisma = new PrismaClient();

export async function POST(request) {
	try {
		const session = await getSession();

		// Vérifier si l'utilisateur est authentifié
		if (!session || !session.user) {
			return NextResponse.json(
				{ error: "Non autorisé" },
				{ status: 401 }
			);
		}

		const { containerName } = await request.json();

		if (!containerName) {
			return NextResponse.json(
				{ error: "Le containerName est requis" },
				{ status: 400 }
			);
		}

		// Récupérer ou créer l'utilisateur
		let user = await prisma.user.findUnique({
			where: {
				auth0Id: session.user.sub,
			},
		});

		if (!user) {
			// Créer un nouvel utilisateur avec les informations de Auth0
			user = await prisma.user.create({
				data: {
					auth0Id: session.user.sub,
					email: session.user.name,
					name: session.user.nickmame,
					azureContainer: containerName,
				},
			});
		} else if (!user.azureContainer) {
			// Mettre à jour le containerName si nécessaire
			user = await prisma.user.update({
				where: {
					id: user.id,
				},
				data: {
					azureContainer: containerName,
				},
			});
		}

		return NextResponse.json({
			success: true,
			user: {
				id: user.id,
				auth0Id: user.auth0Id,
				email: user.email,
				name: user.name,
				azureContainer: user.azureContainer,
			},
		});
	} catch (error) {
		console.error(
			"Erreur lors de l'initialisation de l'utilisateur:",
			error
		);
		return NextResponse.json(
			{
				error: "Échec de l'initialisation de l'utilisateur",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
