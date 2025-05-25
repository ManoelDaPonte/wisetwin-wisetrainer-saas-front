import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/users/[userId]/courses - Get user's courses
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { userId } = params;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // active, completed
  
  // TODO: Add permission check (admin or self)
  const courses = await userService.getUserCourses(userId, status);
  
  return NextResponse.json({ courses });
}));