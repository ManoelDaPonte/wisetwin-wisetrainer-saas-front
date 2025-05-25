import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { userService } from '@/lib/services/adapters/userServiceAdapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/v1/sessions - Start a new session
export const POST = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  const body = await request.json();
  const { type, trainingId, buildId } = body;
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Create session
  const session = await prisma.userSession.create({
    data: {
      userId: user.id,
      type: type || 'TRAINING',
      trainingId,
      buildId,
      startTime: new Date()
    }
  });
  
  return NextResponse.json(session, { status: 201 });
}));

// PATCH /api/v1/sessions - End current session
export const PATCH = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  const body = await request.json();
  const { sessionId, duration } = body;
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session ID is required' },
      { status: 400 }
    );
  }
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Update session
  const session = await prisma.userSession.update({
    where: {
      id: sessionId,
      userId: user.id
    },
    data: {
      endTime: new Date(),
      duration: duration || 0
    }
  });
  
  // Update user statistics
  await prisma.userStatistics.upsert({
    where: { userId: user.id },
    update: {
      totalTime: {
        increment: duration || 0
      }
    },
    create: {
      userId: user.id,
      totalTime: duration || 0,
      totalTrainings: 0,
      completedTrainings: 0,
      averageScore: 0
    }
  });
  
  return NextResponse.json(session);
}));