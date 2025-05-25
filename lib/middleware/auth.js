import { auth0 } from "@/lib/auth0";
import { NextResponse } from 'next/server';

export function withAuth(handler) {
  return async (request, context) => {
    try {
      const session = await auth0.getSession();
      
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Add user to request
      request.user = session.user;
      
      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

export function requireAuth(handler) {
  return withAuth(handler);
}