//app/api/auth/initialize-user/route.test.js
import { NextRequest } from 'next/server';
import * as userService from '@/lib/services/auth/userService';
import { POST } from '@/app/api/auth/initialize-user/route';

// Mock des dépendances
jest.mock('@/lib/auth0', () => ({
  auth0: {
    getSession: jest.fn(),
  },
}));

jest.mock('@/lib/services/auth/userService', () => ({
  initializeUser: jest.fn(),
}));

describe('Initialize User API Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    // Arrange
    const { auth0 } = require('@/lib/auth0');
    auth0.getSession.mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost:3000/api/auth/initialize-user');

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Non autorisé');
  });

  it('should initialize user and return success', async () => {
    // Arrange
    const { auth0 } = require('@/lib/auth0');
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    };
    
    auth0.getSession.mockResolvedValue({
      user: { sub: 'auth0|123456', email: 'test@example.com', name: 'Test User' }
    });
    
    userService.initializeUser.mockResolvedValue(mockUser);
    
    const request = new NextRequest('http://localhost:3000/api/auth/initialize-user');

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user).toEqual({
      id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  it('should handle errors properly', async () => {
    // Arrange
    const { auth0 } = require('@/lib/auth0');
    auth0.getSession.mockResolvedValue({
      user: { sub: 'auth0|123456', email: 'test@example.com', name: 'Test User' }
    });
    
    userService.initializeUser.mockRejectedValue(new Error('Database error'));
    
    const request = new NextRequest('http://localhost:3000/api/auth/initialize-user');

    // Act
    const response = await POST(request);

    // Assert
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Échec de l\'initialisation de l\'utilisateur');
  });
});