import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { userService } from '@/lib/services/adapters/userServiceAdapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/users/[userId]/stats - Get user statistics
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { userId } = params;
  
  // TODO: Add permission check (admin or self)
  const stats = await userService.getUserStats(userId);
  
  return NextResponse.json(stats);
}));

// POST /api/v1/users/[userId]/stats - Update user statistics
export const POST = withErrorHandler(withAuth(async (request, { params }) => {
  const { userId } = params;
  const body = await request.json();
  
  // TODO: Add permission check (system only)
  // This endpoint should only be called by the system when updating training progress
  
  const { totalTime, completedTrainings, averageScore } = body;
  
  const stats = await prisma.userStatistics.upsert({
    where: { userId },
    update: {
      totalTime: { increment: totalTime || 0 },
      completedTrainings: { increment: completedTrainings || 0 },
      totalTrainings: { increment: 1 },
      averageScore: averageScore || 0
    },
    create: {
      userId,
      totalTime: totalTime || 0,
      completedTrainings: completedTrainings || 0,
      totalTrainings: 1,
      averageScore: averageScore || 0
    }
  });
  
  return NextResponse.json(stats);
}));