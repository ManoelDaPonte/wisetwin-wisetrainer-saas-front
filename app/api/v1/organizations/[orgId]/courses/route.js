import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { requireOrgRole } from '@/lib/middleware/permissions';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/v1/organizations/[orgId]/courses - Get organization courses/trainings
export const GET = withErrorHandler(
  requireAuth(
    requireOrgRole(['OWNER', 'ADMIN', 'MEMBER'])(
      async (request, { params }) => {
        const { orgId } = params;
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // wisetrainer, wisetwin
        
        // Get organization with tags
        const organization = await prisma.organization.findUnique({
          where: { id: orgId },
          include: {
            tags: {
              include: {
                trainings: true
              }
            }
          }
        });
        
        if (!organization) {
          return NextResponse.json(
            { error: 'Organization not found' },
            { status: 404 }
          );
        }
        
        // Get all training IDs associated with organization tags
        const trainingIds = new Set();
        organization.tags.forEach(tag => {
          tag.trainings.forEach(training => {
            trainingIds.add(training.id);
          });
        });
        
        // Get courses based on type
        let courses = [];
        
        if (type === 'wisetrainer' || !type) {
          const wisetrainerCourses = await prisma.course.findMany({
            where: {
              OR: [
                { organizationId: orgId },
                { id: { in: Array.from(trainingIds) } }
              ]
            },
            include: {
              _count: {
                select: {
                  users: true
                }
              }
            }
          });
          courses = [...courses, ...wisetrainerCourses];
        }
        
        // TODO: Add WiseTwin builds when implemented
        
        return NextResponse.json({ courses });
      }
    )
  )
);