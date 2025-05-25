import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { courseService } from '@/lib/services/adapters/courseServiceAdapter';

// GET /api/v1/courses - List all courses
export const GET = withErrorHandler(withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // wisetrainer, wisetwin
  const organizationId = searchParams.get('organizationId');
  const status = searchParams.get('status'); // active, archived
  
  const courses = await courseService.getAllCourses({
    type,
    organizationId,
    status: status || 'ACTIVE'
  });
  
  return NextResponse.json({ courses });
}));

// POST /api/v1/courses - Create new course (admin only)
export const POST = withErrorHandler(withAuth(async (request) => {
  const body = await request.json();
  
  // TODO: Add admin permission check
  
  const {
    title,
    description,
    type = 'WISETRAINER',
    organizationId,
    duration,
    difficulty,
    imageUrl,
    buildUrl
  } = body;
  
  if (!title || !description) {
    return NextResponse.json(
      { error: 'Title and description are required' },
      { status: 400 }
    );
  }
  
  const course = await courseService.createCourse({
    title,
    description,
    type,
    organizationId,
    status: 'ACTIVE',
    duration,
    difficulty,
    imageUrl,
    buildUrl
  });
  
  return NextResponse.json(course, { status: 201 });
}));