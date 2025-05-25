import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { storageService } from '@/lib/services/adapters/storageServiceAdapter';

// GET /api/v1/storage/containers/[containerName] - Get container details
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { containerName } = params;
  
  const container = await storageService.getContainer(containerName);
  
  return NextResponse.json(container);
}));

// POST /api/v1/storage/containers/[containerName] - Create container
export const POST = withErrorHandler(withAuth(async (request, { params }) => {
  const { containerName } = params;
  const body = await request.json();
  
  // TODO: Add permission check
  
  const container = await storageService.createContainer(containerName, {
    public: body.public || false
  });
  
  return NextResponse.json(container, { status: 201 });
}));

// DELETE /api/v1/storage/containers/[containerName] - Delete container
export const DELETE = withErrorHandler(withAuth(async (request, { params }) => {
  const { containerName } = params;
  
  // TODO: Add permission check
  
  const result = await storageService.deleteContainer(containerName);
  
  return NextResponse.json(result);
}));