import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { organizationService } from '@/lib/services/adapters/organizationServiceAdapter';

// GET /api/v1/organizations/[orgId] - Get organization details
export const GET = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN', 'MEMBER'])(
      async (request, { params }) => {
        const { orgId } = params;
        
        const organization = await organizationService.getOrganization(orgId);
        
        return NextResponse.json(organization);
      }
    )
  )
);

// PATCH /api/v1/organizations/[orgId] - Update organization
export const PATCH = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId } = params;
        const body = await request.json();
        
        // Only allow updating certain fields
        const allowedFields = ['name', 'description'];
        const updateData = {};
        
        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            updateData[field] = body[field];
          }
        }
        
        const organization = await organizationService.updateOrganization(orgId, updateData);
        
        return NextResponse.json(organization);
      }
    )
  )
);

// DELETE /api/v1/organizations/[orgId] - Delete organization
export const DELETE = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER'])(
      async (request, { params }) => {
        const { orgId } = params;
        
        const result = await organizationService.deleteOrganization(orgId);
        
        return NextResponse.json(result);
      }
    )
  )
);