import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/organizations/[orgId]/tags/[tagId] - Get tag details
export const GET = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN', 'MEMBER'])(
      async (request, { params }) => {
        const { orgId, tagId } = params;
        
        const tag = await prisma.organizationTag.findUnique({
          where: {
            id: tagId,
            organizationId: orgId
          },
          include: {
            users: {
              include: {
                user: true
              }
            },
            trainings: true,
            _count: {
              select: {
                users: true,
                trainings: true
              }
            }
          }
        });
        
        if (!tag) {
          return NextResponse.json(
            { error: 'Tag not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(tag);
      }
    )
  )
);

// PATCH /api/v1/organizations/[orgId]/tags/[tagId] - Update tag
export const PATCH = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId, tagId } = params;
        const body = await request.json();
        
        const allowedFields = ['name', 'description', 'color'];
        const updateData = {};
        
        for (const field of allowedFields) {
          if (body[field] !== undefined) {
            updateData[field] = body[field];
          }
        }
        
        const tag = await prisma.organizationTag.update({
          where: {
            id: tagId,
            organizationId: orgId
          },
          data: updateData,
          include: {
            _count: {
              select: {
                users: true,
                trainings: true
              }
            }
          }
        });
        
        return NextResponse.json(tag);
      }
    )
  )
);

// DELETE /api/v1/organizations/[orgId]/tags/[tagId] - Delete tag
export const DELETE = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId, tagId } = params;
        
        await prisma.organizationTag.delete({
          where: {
            id: tagId,
            organizationId: orgId
          }
        });
        
        return NextResponse.json({ success: true });
      }
    )
  )
);