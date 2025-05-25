import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { courseService } from '@/lib/services/adapters/courseServiceAdapter';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/courses/[courseId]/progress - Get user progress
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId } = params;
  const auth0Id = request.user.sub;
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Get progress
  const progress = await courseService.getUserProgress(courseId, user.id);
  
  return NextResponse.json(progress);
}));

// PATCH /api/v1/courses/[courseId]/progress - Update progress
export const PATCH = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId } = params;
  const auth0Id = request.user.sub;
  const body = await request.json();
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Update progress
  const progress = await courseService.updateProgress(courseId, user.id, body);
  
  return NextResponse.json(progress);
}));