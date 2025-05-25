import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// DELETE /api/v1/organizations/[orgId]/invitations/[invitationId] - Cancel invitation
export const DELETE = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId, invitationId } = params;
        
        await prisma.organizationInvitation.delete({
          where: {
            id: invitationId,
            organizationId: orgId
          }
        });
        
        return NextResponse.json({ success: true });
      }
    )
  )
);

// POST /api/v1/organizations/[orgId]/invitations/[invitationId]/resend - Resend invitation
export const POST = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId, invitationId } = params;
        
        const invitation = await prisma.organizationInvitation.findUnique({
          where: {
            id: invitationId,
            organizationId: orgId
          }
        });
        
        if (!invitation) {
          return NextResponse.json(
            { error: 'Invitation not found' },
            { status: 404 }
          );
        }
        
        // Update expiration date
        const updatedInvitation = await prisma.organizationInvitation.update({
          where: { id: invitationId },
          data: {
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        });
        
        // TODO: Resend email
        
        return NextResponse.json(updatedInvitation);
      }
    )
  )
);