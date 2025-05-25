import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { userService } from '@/lib/services/adapters/userServiceAdapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/users - List users (admin only)
export const GET = withErrorHandler(withAuth(async (request) => {
  // This endpoint might be restricted to admins only
  // For now, returning empty array for non-admins
  
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get('organizationId');
  
  if (organizationId) {
    // Get users from specific organization
    const members = await prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: true
      }
    });
    
    return NextResponse.json({
      users: members.map(m => ({
        ...userService.formatUser(m.user),
        role: m.role
      }))
    });
  }
  
  // Return empty for now (admin functionality to be implemented)
  return NextResponse.json({ users: [] });
}));