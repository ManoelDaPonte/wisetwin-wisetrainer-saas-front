import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { courseService } from '@/lib/services/adapters/courseServiceAdapter';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// POST /api/v1/courses/[courseId]/enroll - Enroll in course
export const POST = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId } = params;
  const auth0Id = request.user.sub;
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Enroll user
  const enrollment = await courseService.enrollUser(courseId, user.id);
  
  return NextResponse.json(enrollment, { status: 201 });
}));

// DELETE /api/v1/courses/[courseId]/enroll - Unenroll from course
export const DELETE = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId } = params;
  const auth0Id = request.user.sub;
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Unenroll user
  const result = await courseService.unenrollUser(courseId, user.id);
  
  return NextResponse.json(result);
}));