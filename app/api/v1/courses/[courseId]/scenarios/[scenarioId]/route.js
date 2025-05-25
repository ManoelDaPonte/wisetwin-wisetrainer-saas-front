import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { courseService } from '@/lib/services/adapters/courseServiceAdapter';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/courses/[courseId]/scenarios/[scenarioId] - Get scenario details
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId, scenarioId } = params;
  
  const scenario = await courseService.getScenario(courseId, scenarioId);
  
  return NextResponse.json(scenario);
}));

// POST /api/v1/courses/[courseId]/scenarios/[scenarioId] - Submit scenario answers
export const POST = withErrorHandler(withAuth(async (request, { params }) => {
  const { courseId, scenarioId } = params;
  const auth0Id = request.user.sub;
  const body = await request.json();
  const { answers } = body;
  
  if (!answers) {
    return NextResponse.json(
      { error: 'Answers are required' },
      { status: 400 }
    );
  }
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Save answers
  const result = await courseService.saveScenarioAnswers(scenarioId, user.id, answers);
  
  return NextResponse.json(result, { status: 201 });
}));