// lib/services/userService.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Trouve un utilisateur par son ID Auth0
 */
export async function findUserByAuth0Id(auth0Id) {
	return prisma.user.findUnique({
		where: { auth0Id },
	});
}

/**
 * Crée un nouvel utilisateur dans la base de données
 */
export async function createUser(userData) {
	const { auth0Id, email, name, nickname } = userData;

	// Créer l'utilisateur dans la base de données
	return prisma.user.create({
		data: {
			auth0Id,
			email,
			name: name || nickname || email.split("@")[0],
		},
	});
}

/**
 * Met à jour un utilisateur existant
 */
export async function updateUser(userId, userData) {
	const { email, name, nickname } = userData;

	return prisma.user.update({
		where: { id: userId },
		data: {
			email,
			name: name || nickname || email.split("@")[0],
			// Autres champs à mettre à jour
		},
	});
}

/**
 * Initialise ou récupère un utilisateur à partir des données Auth0
 */
export async function initializeUser(auth0User) {
	if (!auth0User || !auth0User.sub) {
		throw new Error("Données utilisateur Auth0 invalides");
	}

	// Chercher l'utilisateur existant
	let user = await findUserByAuth0Id(auth0User.sub);

	// Si l'utilisateur n'existe pas, le créer
	if (!user) {
		user = await createUser({
			auth0Id: auth0User.sub,
			email: auth0User.email,
			name: auth0User.name,
			nickname: auth0User.nickname,
		});
		console.log("Nouvel utilisateur créé:", user.id);
	} else {
		// Mettre à jour l'utilisateur si nécessaire
		if (user.email !== auth0User.email || user.name !== auth0User.name) {
			user = await updateUser(user.id, {
				email: auth0User.email,
				name: auth0User.name,
				nickname: auth0User.nickname,
			});
			console.log("Utilisateur existant mis à jour:", user.id);
		}
	}

	return user;
}
