import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { storageService } from '@/lib/services/adapters/storageServiceAdapter';

// GET /api/v1/storage/containers/[containerName]/blobs/[...path] - Download blob
export const GET = withErrorHandler(withAuth(async (request, { params }) => {
  const { containerName, path } = params;
  const blobName = path.join('/');
  
  try {
    const blob = await storageService.downloadBlob(containerName, blobName);
    
    // Stream the blob content
    return new NextResponse(blob.stream, {
      headers: {
        'Content-Type': blob.contentType || 'application/octet-stream',
        'Content-Length': blob.contentLength.toString()
      }
    });
  } catch (error) {
    if (error.message === 'Blob not found') {
      return NextResponse.json(
        { error: 'Blob not found' },
        { status: 404 }
      );
    }
    throw error;
  }
}));

// POST /api/v1/storage/containers/[containerName]/blobs/[...path] - Upload blob
export const POST = withErrorHandler(withAuth(async (request, { params }) => {
  const { containerName, path } = params;
  const blobName = path.join('/');
  
  // TODO: Add permission check
  
  const formData = await request.formData();
  const file = formData.get('file');
  
  if (!file) {
    return NextResponse.json(
      { error: 'File is required' },
      { status: 400 }
    );
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  
  const result = await storageService.uploadBlob(containerName, blobName, buffer, {
    contentType: file.type,
    metadata: {
      originalName: file.name
    }
  });
  
  return NextResponse.json(result, { status: 201 });
}));

// DELETE /api/v1/storage/containers/[containerName]/blobs/[...path] - Delete blob
export const DELETE = withErrorHandler(withAuth(async (request, { params }) => {
  const { containerName, path } = params;
  const blobName = path.join('/');
  
  // TODO: Add permission check
  
  const result = await storageService.deleteBlob(containerName, blobName);
  
  return NextResponse.json(result);
}));