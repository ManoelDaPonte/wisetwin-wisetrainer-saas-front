import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/users/me/courses - Get current user's courses
export const GET = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // active, completed
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Get user courses
  const courses = await userService.getUserCourses(user.id, status);
  
  return NextResponse.json({ courses });
}));