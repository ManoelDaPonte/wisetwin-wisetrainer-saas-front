import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function requireOrgRole(roles = ['OWNER', 'ADMIN', 'MEMBER']) {
  return (handler) => {
    return async (request, context) => {
      try {
        const { orgId } = context.params;
        const userId = request.user?.sub;

        if (!userId || !orgId) {
          return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
          );
        }

        // Get user ID from auth0Id
        const user = await prisma.user.findUnique({
          where: { auth0Id: userId }
        });

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Check organization membership
        const membership = await prisma.organizationMember.findUnique({
          where: {
            organizationId_userId: {
              organizationId: orgId,
              userId: user.id
            }
          }
        });

        if (!membership) {
          return NextResponse.json(
            { error: 'Not a member of this organization' },
            { status: 403 }
          );
        }

        // Check role permissions
        if (!roles.includes(membership.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        // Add organization and role to request
        request.organization = { id: orgId, role: membership.role };
        request.userId = user.id;

        return handler(request, context);
      } catch (error) {
        console.error('Permissions middleware error:', error);
        return NextResponse.json(
          { error: 'Permission check failed' },
          { status: 500 }
        );
      }
    };
  };
}

export function requireOwner(handler) {
  return requireOrgRole(['OWNER'])(handler);
}

export function requireAdmin(handler) {
  return requireOrgRole(['OWNER', 'ADMIN'])(handler);
}