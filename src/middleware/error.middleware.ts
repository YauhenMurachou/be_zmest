import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

type ErrorResponse = {
  error: string;
  details?: Record<string, string[]>;
};

export const errorHandler = (
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): void => {
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(err.message);
    });

    const errorResponse: ErrorResponse = {
      error: 'Validation error',
      details,
    };

    response.status(400).json(errorResponse);
    return;
  }

  if (error.message === 'Invalid email or password') {
    response.status(401).json({ error: error.message });
    return;
  }

  if (error.message === 'Post not found' || error.message === 'User not found') {
    response.status(404).json({ error: error.message });
    return;
  }

  if (error.message.includes('permission')) {
    response.status(403).json({ error: error.message });
    return;
  }

  if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
    response.status(409).json({ error: 'Resource already exists' });
    return;
  }

  console.error('Unhandled error:', error);
  response.status(500).json({ error: 'Internal server error' });
};

