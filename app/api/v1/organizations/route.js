import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { organizationService } from '@/lib/services/adapters/organizationServiceAdapter';
import { userService } from '@/lib/services/adapters/userServiceAdapter';

// GET /api/v1/organizations - List user's organizations
export const GET = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Get user's organizations
  const organizations = await organizationService.getUserOrganizations(user.id);
  
  return NextResponse.json({ organizations });
}));

// POST /api/v1/organizations - Create new organization
export const POST = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  const body = await request.json();
  
  const { name, description, azureContainer } = body;
  
  if (!name) {
    return NextResponse.json(
      { error: 'Organization name is required' },
      { status: 400 }
    );
  }
  
  // Get user
  const user = await userService.getUserByAuth0Id(auth0Id);
  
  // Create organization
  const organization = await organizationService.createOrganization(user.id, {
    name,
    description,
    azureContainer
  });
  
  return NextResponse.json(organization, { status: 201 });
}));