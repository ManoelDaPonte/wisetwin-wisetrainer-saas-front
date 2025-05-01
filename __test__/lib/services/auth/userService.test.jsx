// lib/services/auth/userService.test.js
import {
	findUserByAuth0Id,
	createUser,
	initializeUser,
	updateUser,
} from "@/lib/services/auth/userService";

// Mock pour PrismaClient
jest.mock("@prisma/client", () => {
	const mockUser = {
		findUnique: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
	};
	return {
		PrismaClient: jest.fn(() => ({
			user: mockUser,
			$connect: jest.fn(),
			$disconnect: jest.fn(),
		})),
	};
});

describe("userService", () => {
	let prisma;

	beforeEach(() => {
		// Nettoyer les mocks avant chaque test
		jest.clearAllMocks();

		// Récupérer l'instance mockée de PrismaClient
		prisma = new (require("@prisma/client").PrismaClient)();
	});

	describe("findUserByAuth0Id", () => {
		it("should find a user by Auth0 ID", async () => {
			// Arrange - Configuration du test
			const mockUser = { id: "123", name: "Test User" };
			prisma.user.findUnique.mockResolvedValue(mockUser);

			// Act - Exécution de la fonction à tester
			const result = await findUserByAuth0Id("auth0|123");

			// Assert - Vérification des résultats
			expect(result).toEqual(mockUser);
			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { auth0Id: "auth0|123" },
			});
		});

		it("should return null if user is not found", async () => {
			// Arrange
			prisma.user.findUnique.mockResolvedValue(null);

			// Act
			const result = await findUserByAuth0Id("auth0|456");

			// Assert
			expect(result).toBeNull();
			expect(prisma.user.findUnique).toHaveBeenCalled();
		});
	});

	describe("initializeUser", () => {
		it("should create a new user if not found", async () => {
			// Arrange
			const auth0User = {
				sub: "auth0|123",
				email: "test@example.com",
				name: "Test User",
			};

			// Mock: findUserByAuth0Id retourne null (utilisateur non trouvé)
			prisma.user.findUnique.mockResolvedValue(null);

			// Mock: createUser crée et retourne un nouvel utilisateur
			const createdUser = {
				id: "new-user-id",
				auth0Id: auth0User.sub,
				email: auth0User.email,
				name: auth0User.name,
			};
			prisma.user.create.mockResolvedValue(createdUser);

			// Act
			const result = await initializeUser(auth0User);

			// Assert
			expect(prisma.user.findUnique).toHaveBeenCalledWith({
				where: { auth0Id: auth0User.sub },
			});
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					auth0Id: auth0User.sub,
					email: auth0User.email,
					name: auth0User.name,
				}),
			});
			expect(result).toEqual(createdUser);
		});

		it("should return existing user if found and no update needed", async () => {
			// Arrange
			const auth0User = {
				sub: "auth0|456",
				email: "existing@example.com",
				name: "Existing User",
			};

			const existingUser = {
				id: "existing-id",
				auth0Id: auth0User.sub,
				email: auth0User.email, // Même email, pas besoin de mise à jour
				name: auth0User.name, // Même nom, pas besoin de mise à jour
			};

			// Mock: l'utilisateur existe déjà
			prisma.user.findUnique.mockResolvedValue(existingUser);

			// Act
			const result = await initializeUser(auth0User);

			// Assert
			expect(prisma.user.findUnique).toHaveBeenCalled();
			expect(prisma.user.update).not.toHaveBeenCalled(); // Pas de mise à jour
			expect(result).toEqual(existingUser);
		});

		it("should update existing user if email or name changed", async () => {
			// Arrange
			const auth0User = {
				sub: "auth0|789",
				email: "updated@example.com", // Email différent
				name: "Updated Name", // Nom différent
			};

			const existingUser = {
				id: "existing-id",
				auth0Id: auth0User.sub,
				email: "old@example.com",
				name: "Old Name",
			};

			const updatedUser = {
				...existingUser,
				email: auth0User.email,
				name: auth0User.name,
			};

			// Mock: l'utilisateur existe mais avec des données différentes
			prisma.user.findUnique.mockResolvedValue(existingUser);
			prisma.user.update.mockResolvedValue(updatedUser);

			// Act
			const result = await initializeUser(auth0User);

			// Assert
			expect(prisma.user.findUnique).toHaveBeenCalled();
			expect(prisma.user.update).toHaveBeenCalledWith({
				where: { id: existingUser.id },
				data: {
					email: auth0User.email,
					name: auth0User.name,
				},
			});
			expect(result).toEqual(updatedUser);
		});

		it("should throw error if auth0User is invalid", async () => {
			// Act & Assert - Tester avec des valeurs invalides
			await expect(initializeUser(null)).rejects.toThrow(
				"Données utilisateur Auth0 invalides"
			);
			await expect(initializeUser(undefined)).rejects.toThrow(
				"Données utilisateur Auth0 invalides"
			);
			await expect(initializeUser({})).rejects.toThrow(
				"Données utilisateur Auth0 invalides"
			);
		});
	});

	describe("createUser", () => {
		it("should create a new user with the provided data", async () => {
			// Arrange
			const userData = {
				auth0Id: "auth0|123",
				email: "test@example.com",
				name: "Test User",
				nickname: "tester",
			};

			const createdUser = {
				id: "new-user-id",
				...userData,
			};

			prisma.user.create.mockResolvedValue(createdUser);

			// Act
			const result = await createUser(userData);

			// Assert
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: {
					auth0Id: userData.auth0Id,
					email: userData.email,
					name: userData.name,
				},
			});
			expect(result).toEqual(createdUser);
		});

		it("should use nickname when name is not provided", async () => {
			// Arrange
			const userData = {
				auth0Id: "auth0|123",
				email: "test@example.com",
				nickname: "tester",
				// name is intentionally omitted
			};

			const expectedData = {
				auth0Id: userData.auth0Id,
				email: userData.email,
				name: userData.nickname, // nickname should be used as fallback
			};

			const createdUser = {
				id: "new-user-id",
				...expectedData,
			};

			prisma.user.create.mockResolvedValue(createdUser);

			// Act
			const result = await createUser(userData);

			// Assert
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: expectedData,
			});
			expect(result).toEqual(createdUser);
		});

		it("should use email prefix when name and nickname are not provided", async () => {
			// Arrange
			const userData = {
				auth0Id: "auth0|123",
				email: "test@example.com",
				// name and nickname are intentionally omitted
			};

			const expectedData = {
				auth0Id: userData.auth0Id,
				email: userData.email,
				name: "test", // email prefix
			};

			const createdUser = {
				id: "new-user-id",
				...expectedData,
			};

			prisma.user.create.mockResolvedValue(createdUser);

			// Act
			const result = await createUser(userData);

			// Assert
			expect(prisma.user.create).toHaveBeenCalledWith({
				data: expectedData,
			});
			expect(result).toEqual(createdUser);
		});
	});
});
