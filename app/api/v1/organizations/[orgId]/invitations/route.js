import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { organizationService } from '@/lib/services/adapters/organizationServiceAdapter';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/organizations/[orgId]/invitations - List invitations
export const GET = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId } = params;
        
        const invitations = await organizationService.getInvitations(orgId);
        
        return NextResponse.json({ invitations });
      }
    )
  )
);

// POST /api/v1/organizations/[orgId]/invitations - Create invitation
export const POST = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId } = params;
        const auth0Id = request.user.sub;
        const body = await request.json();
        const { email, role = 'MEMBER' } = body;
        
        if (!email) {
          return NextResponse.json(
            { error: 'Email is required' },
            { status: 400 }
          );
        }
        
        // Get inviter
        const inviter = await userService.getUserByAuth0Id(auth0Id);
        
        const invitation = await organizationService.createInvitation(orgId, {
          email,
          role,
          invitedBy: inviter.id
        });
        
        return NextResponse.json(invitation, { status: 201 });
      }
    )
  )
);