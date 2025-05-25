import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { courseService } from '@/lib/services/adapters/courseServiceAdapter';

// GET /api/v1/courses/[courseId] - Get course details
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId } = params;
  
  const course = await courseService.getCourseById(courseId);
  
  return NextResponse.json(course);
}));

// PATCH /api/v1/courses/[courseId] - Update course (admin only)
export const PATCH = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId } = params;
  const body = await request.json();
  
  // TODO: Add admin permission check
  
  const allowedFields = [
    'title',
    'description',
    'status',
    'duration',
    'difficulty',
    'imageUrl',
    'buildUrl'
  ];
  
  const updateData = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }
  
  const course = await courseService.updateCourse(courseId, updateData);
  
  return NextResponse.json(course);
}));

// DELETE /api/v1/courses/[courseId] - Delete course (admin only)
export const DELETE = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId } = params;
  
  // TODO: Add admin permission check
  
  const result = await courseService.deleteCourse(courseId);
  
  return NextResponse.json(result);
}));