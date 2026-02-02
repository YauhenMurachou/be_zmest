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
    const messages: string[] = [];
    
    error.errors.forEach((err) => {
      messages.push(err.message);
    });

    response.status(400).json({
      resultCode: 1,
      messages,
      data: {},
    });
    return;
  }

  if (error.message === 'Invalid email or password') {
    response.status(401).json({
      resultCode: 1,
      messages: [error.message],
      data: {},
    });
    return;
  }

  if (error.message === 'Post not found' || error.message === 'User not found') {
    response.status(404).json({
      resultCode: 1,
      messages: [error.message],
      data: {},
    });
    return;
  }

  if (error.message.includes('permission')) {
    response.status(403).json({
      resultCode: 1,
      messages: [error.message],
      data: {},
    });
    return;
  }

  if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
    response.status(409).json({
      resultCode: 1,
      messages: ['Resource already exists'],
      data: {},
    });
    return;
  }

  console.error('Unhandled error:', error);
  response.status(500).json({
    resultCode: 1,
    messages: ['Internal server error'],
    data: {},
  });
};

