import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/organizations/[orgId]/tags - List organization tags
export const GET = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN', 'MEMBER'])(
      async (request, { params }) => {
        const { orgId } = params;
        
        const tags = await prisma.organizationTag.findMany({
          where: { organizationId: orgId },
          include: {
            _count: {
              select: {
                users: true,
                trainings: true
              }
            }
          },
          orderBy: {
            name: 'asc'
          }
        });
        
        return NextResponse.json({ tags });
      }
    )
  )
);

// POST /api/v1/organizations/[orgId]/tags - Create tag
export const POST = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN'])(
      async (request, { params }) => {
        const { orgId } = params;
        const body = await request.json();
        const { name, description, color } = body;
        
        if (!name) {
          return NextResponse.json(
            { error: 'Tag name is required' },
            { status: 400 }
          );
        }
        
        const tag = await prisma.organizationTag.create({
          data: {
            organizationId: orgId,
            name,
            description,
            color: color || '#3B82F6' // Default blue
          },
          include: {
            _count: {
              select: {
                users: true,
                trainings: true
              }
            }
          }
        });
        
        return NextResponse.json(tag, { status: 201 });
      }
    )
  )
);