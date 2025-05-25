import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { withErrorHandler } from '@/lib/middleware/errorHandler';

// GET /api/v1/auth - Get current session
export const GET = withErrorHandler(async (request) => {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.user.sub,
      email: session.user.email,
      name: session.user.name,
      picture: session.user.picture
    }
  });
});

// DELETE /api/v1/auth - Logout
export const DELETE = withErrorHandler(async (request) => {
  // In Next.js App Router with Auth0, logout is handled by Auth0's logout URL
  // This endpoint can be used to perform cleanup before redirecting to Auth0 logout
  
  return NextResponse.json({
    message: 'Logout successful',
    logoutUrl: '/api/auth/logout'
  });
});