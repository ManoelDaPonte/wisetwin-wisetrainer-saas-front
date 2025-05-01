// app/api/auth/initialize-user/route.test.js
import { POST } from './route';
import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { initializeUser } from '@/lib/services/auth/userService';

// Mock des dépendances
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({ data })),
  },
}));

jest.mock('@/lib/auth0', () => ({
  auth0: {
    getSession: jest.fn(),
  },
}));

jest.mock('@/lib/services/auth/userService', () => ({
  initializeUser: jest.fn(),
}));

describe('API: /api/auth/initialize-user', () => {
  beforeEach(() => {
    // Nettoyer tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Arrange: Simuler un utilisateur non authentifié
    auth0.getSession.mockResolvedValue(null);

    // Act: Appeler la route API
    await POST();

    // Assert: Vérifier que la réponse est 401 Non autorisé
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Non autorisé" },
      { status: 401 }
    );
  });

  it('should successfully initialize user and return user data', async () => {
    // Arrange: Simuler un utilisateur authentifié
    const mockAuth0User = {
      sub: 'auth0|123',
      email: 'test@example.com',
      name: 'Test User'
    };
    
    auth0.getSession.mockResolvedValue({ 
      user: mockAuth0User 
    });

    // Simuler le résultat de initializeUser
    const mockUser = {
      id: 'user_id_123',
      email: mockAuth0User.email,
      name: mockAuth0User.name,
    };
    
    initializeUser.mockResolvedValue(mockUser);

    // Act: Appeler la route API
    await POST();

    // Assert: Vérifier que initializeUser a été appelé avec les bons paramètres
    expect(initializeUser).toHaveBeenCalledWith(mockAuth0User);
    
    // Vérifier que la réponse inclut les données utilisateur
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
      user: expect.objectContaining({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      }),
    });
  });

  it('should handle service errors', async () => {
    // Arrange: Simuler un utilisateur authentifié mais une erreur de service
    auth0.getSession.mockResolvedValue({ 
      user: { sub: 'auth0|123', email: 'test@example.com' } 
    });
    
    // Simuler une erreur lors de l'initialisation
    const errorMessage = "Erreur lors de l'initialisation";
    initializeUser.mockRejectedValue(new Error(errorMessage));

    // Act: Appeler la route API
    await POST();

    // Assert: Vérifier que l'erreur est traitée correctement
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error: "Échec de l'initialisation de l'utilisateur",
        details: errorMessage,
      },
      { status: 500 }
    );
  });
});