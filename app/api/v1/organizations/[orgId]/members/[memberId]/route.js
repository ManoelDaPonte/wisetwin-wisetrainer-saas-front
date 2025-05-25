import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { organizationService } from '@/lib/services/adapters/organizationServiceAdapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/organizations/[orgId]/members/[memberId] - Get member details
export const GET = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN', 'MEMBER'])(
      async (request, { params }) => {
        const { orgId, memberId } = params;
        
        const member = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: orgId,
              userId: memberId
            }
          },
          include: {
            user: true
          }
        });
        
        if (!member) {
          return NextResponse.json(
            { error: 'Member not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(organizationService.formatMember(member));
      }
    )
  )
);

// PATCH /api/v1/organizations/[orgId]/members/[memberId] - Update member role
export const PATCH = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId, memberId } = params;
        const body = await request.json();
        const { role } = body;
        
        if (!role || !['OWNER', 'ADMIN', 'MEMBER'].includes(role)) {
          return NextResponse.json(
            { error: 'Invalid role' },
            { status: 400 }
          );
        }
        
        const member = await organizationService.updateMember(orgId, memberId, { role });
        
        return NextResponse.json(member);
      }
    )
  )
);

// DELETE /api/v1/organizations/[orgId]/members/[memberId] - Remove member
export const DELETE = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId, memberId } = params;
        
        const result = await organizationService.removeMember(orgId, memberId);
        
        return NextResponse.json(result);
      }
    )
  )
);