import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/users/[userId] - Get user by ID
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { userId } = params;
  
  // TODO: Add permission check (admin or self)
  const user = await userService.getUserById(userId);
  
  return NextResponse.json(user);
}));

// PATCH /api/v1/users/[userId] - Update user
export const PATCH = withErrorHandler(withAuth(async (request, { params }) => {
  const { userId } = params;
  const body = await request.json();
  
  // TODO: Add permission check (admin or self)
  
  // Only allow updating certain fields
  const allowedFields = ['name', 'email'];
  const updateData = {};
  
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  
  const updatedUser = await userService.updateUser(userId, updateData);
  
  return NextResponse.json(updatedUser);
}));

// DELETE /api/v1/users/[userId] - Delete user
export const DELETE = withErrorHandler(withAuth(async (request, { params }) => {
  const { userId } = params;
  
  // TODO: Add permission check (admin or self)
  const result = await userService.deleteUser(userId);
  
  return NextResponse.json(result);
}));