import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { withErrorHandler } from '@/lib/middleware/errorHandler';
import { storageService } from '@/lib/services/adapters/storageServiceAdapter';

// GET /api/v1/storage/builds - Search for Unity builds
export const GET = withErrorHandler(withAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // wisetrainer, wisetwin
  const organizationId = searchParams.get('organizationId');
  
  const builds = await storageService.searchBuilds({
    type: type?.toUpperCase(),
    organizationId
  });
  
  return NextResponse.json({ builds });
}));