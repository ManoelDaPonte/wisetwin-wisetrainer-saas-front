import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/users/me - Get current user profile
export const GET = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  
  try {
    const user = await userService.getUserByAuth0Id(auth0Id);
    return NextResponse.json(user);
  } catch (error) {
    // User not found, initialize them
    const user = await userService.initializeUser({
      auth0Id,
      email: request.user.email,
      name: request.user.name,
      picture: request.user.picture
    });
    
    return NextResponse.json(user);
  }
}));

// PATCH /api/v1/users/me - Update current user profile
export const PATCH = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  const body = await request.json();
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Only allow updating certain fields
  const allowedFields = ['name', 'email'];
  const updateData = {};
  
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  
  const updatedUser = await userService.updateUser(user.id, updateData);
  
  return NextResponse.json(updatedUser);
}));