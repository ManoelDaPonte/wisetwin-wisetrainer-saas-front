import { NextResponse } from 'next/server';

export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);

      // Prisma errors
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Resource already exists' },
          { status: 409 }
        );
      }

      if (error.code === 'P2025') {
        return NextResponse.json(
          { error: 'Resource not found' },
          { status: 404 }
        );
      }

      // Validation errors
      if (error.name === 'ValidationError') {
        return NextResponse.json(
          { error: error.message, details: error.details },
          { status: 400 }
        );
      }

      // Default error
      return NextResponse.json(
        { 
          error: 'Internal server error',
          message: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
  };
}

export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}