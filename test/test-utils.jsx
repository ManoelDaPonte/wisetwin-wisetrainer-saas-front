import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

/**
 * Réinitialise complètement la base entre les tests
 */
export async function resetDatabase() {
	await prisma.user.deleteMany();
}
