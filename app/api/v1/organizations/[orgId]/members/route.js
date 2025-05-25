import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { organizationService } from '@/lib/services/adapters/organizationServiceAdapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/organizations/[orgId]/members - List organization members
export const GET = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN', 'MEMBER'])(
      async (request, { params }) => {
        const { orgId } = params;
        
        const members = await prisma.organizationMember.findMany({
          where: { organizationId: orgId },
          include: {
            user: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        });
        
        const formattedMembers = members.map(m => 
          organizationService.formatMember(m)
        );
        
        return NextResponse.json({ members: formattedMembers });
      }
    )
  )
);

// POST /api/v1/organizations/[orgId]/members - Add member
export const POST = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId } = params;
        const body = await request.json();
        const { email, role = 'MEMBER' } = body;
        
        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }
        
        const member = await organizationService.addMember(orgId, email, role);
        
        return NextResponse.json(member, { status: 201 });
      }
    )
  )
);