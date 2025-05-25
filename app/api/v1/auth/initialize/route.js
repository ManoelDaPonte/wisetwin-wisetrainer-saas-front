import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';
import { BlobServiceClient } from '@azure/storage-blob';

const prisma = new PrismaClient();

// POST /api/v1/auth/initialize - Initialize user after login
export const POST = withErrorHandler(withAuth(async (request) => {
  const auth0Id = request.user.sub;
  const { email, name } = request.user;

  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { auth0Id },
    include: {
      organizations: {
        include: {
          organization: true
        }
      }
    }
  });

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING
  );

  if (!user) {
    // Generate unique container name
    const containerName = `user-${
      name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : 'user'
    }-${auth0Id.slice(-6)}`;
    
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container
    await containerClient.createIfNotExists({
      access: 'container'
    });

    // Create user
    user = await prisma.user.create({
      data: {
        auth0Id,
        email,
        name,
        azureContainer: containerName
      },
      include: {
        organizations: {
          include: {
            organization: true
          }
        }
      }
    });
  } else {
    // Verify Azure container exists
    if (user.azureContainer) {
      const containerClient = blobServiceClient.getContainerClient(user.azureContainer);
      const containerExists = await containerClient.exists();
      
      if (!containerExists) {
        await containerClient.createIfNotExists({
          access: 'container'
        });
      }
    }
  }

  // Format user response
  const formattedUser = {
    id: user.id,
    auth0Id: user.auth0Id,
    email: user.email,
    name: user.name,
    azureContainer: user.azureContainer,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    organizations: user.organizations.map(membership => ({
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
      azureContainer: membership.organization.azureContainer
    }))
  };

  return NextResponse.json({
    success: true,
    user: formattedUser
  });
}));